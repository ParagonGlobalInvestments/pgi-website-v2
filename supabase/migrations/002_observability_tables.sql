-- ============================================================================
-- Observability Tables for PGI Portal
-- ============================================================================
-- Stores Core Web Vitals, page views, and error data for admin analytics
-- Designed for Supabase Free Tier (500MB limit)
-- Retention: 30 days raw data, 1 year aggregates
-- ============================================================================

-- Core Web Vitals storage (raw metrics)
CREATE TABLE IF NOT EXISTS obs_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL CHECK (metric_type IN ('CLS', 'LCP', 'FCP', 'TTFB', 'INP', 'FID')),
  value numeric NOT NULL,
  rating text CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  path text NOT NULL,
  route text,
  device_type text,
  connection_speed text,
  browser text,
  os text,
  country text,
  region text,
  deployment_id text,
  environment text DEFAULT 'production',
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_obs_vitals_metric_type ON obs_vitals(metric_type);
CREATE INDEX IF NOT EXISTS idx_obs_vitals_path ON obs_vitals(path);
CREATE INDEX IF NOT EXISTS idx_obs_vitals_created_at ON obs_vitals(created_at);
CREATE INDEX IF NOT EXISTS idx_obs_vitals_composite ON obs_vitals(metric_type, created_at, path);

-- Page views and custom events
CREATE TABLE IF NOT EXISTS obs_pageviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'pageview' CHECK (event_type IN ('pageview', 'event')),
  event_name text,
  path text NOT NULL,
  route text,
  referrer text,
  session_id text,
  device_type text,
  browser text,
  os text,
  country text,
  region text,
  deployment_id text,
  environment text DEFAULT 'production',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obs_pageviews_path ON obs_pageviews(path);
CREATE INDEX IF NOT EXISTS idx_obs_pageviews_created_at ON obs_pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_obs_pageviews_event_type ON obs_pageviews(event_type);

-- Hourly aggregates for efficient analytics queries
CREATE TABLE IF NOT EXISTS obs_vitals_hourly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hour timestamptz NOT NULL,
  metric_type text NOT NULL,
  path text NOT NULL,
  device_type text DEFAULT 'unknown',
  count integer NOT NULL DEFAULT 0,
  sum_value numeric NOT NULL DEFAULT 0,
  min_value numeric,
  max_value numeric,
  p50 numeric,
  p75 numeric,
  p95 numeric,
  good_count integer DEFAULT 0,
  needs_improvement_count integer DEFAULT 0,
  poor_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hour, metric_type, path, device_type)
);

CREATE INDEX IF NOT EXISTS idx_obs_vitals_hourly_hour ON obs_vitals_hourly(hour);
CREATE INDEX IF NOT EXISTS idx_obs_vitals_hourly_metric ON obs_vitals_hourly(metric_type);

-- Daily page view aggregates
CREATE TABLE IF NOT EXISTS obs_pageviews_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  path text NOT NULL,
  pageviews integer NOT NULL DEFAULT 0,
  unique_sessions integer NOT NULL DEFAULT 0,
  desktop_count integer DEFAULT 0,
  mobile_count integer DEFAULT 0,
  tablet_count integer DEFAULT 0,
  top_referrers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(day, path)
);

CREATE INDEX IF NOT EXISTS idx_obs_pageviews_daily_day ON obs_pageviews_daily(day);

-- Client-side error tracking
CREATE TABLE IF NOT EXISTS obs_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,
  message text NOT NULL,
  stack text,
  path text NOT NULL,
  route text,
  browser text,
  os text,
  user_agent text,
  deployment_id text,
  environment text DEFAULT 'production',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obs_errors_created_at ON obs_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_obs_errors_type ON obs_errors(error_type);

-- ============================================================================
-- Row Level Security (service role only access)
-- ============================================================================

ALTER TABLE obs_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_vitals_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_pageviews_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_errors ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access obs_vitals" ON obs_vitals
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access obs_pageviews" ON obs_pageviews
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access obs_vitals_hourly" ON obs_vitals_hourly
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access obs_pageviews_daily" ON obs_pageviews_daily
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access obs_errors" ON obs_errors
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- PostgreSQL Functions for Aggregation and Queries
-- ============================================================================

-- Get vitals summary for analytics page
CREATE OR REPLACE FUNCTION get_vitals_summary(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_path text DEFAULT NULL
)
RETURNS TABLE (
  metric_type text,
  avg_value numeric,
  p50_value numeric,
  p75_value numeric,
  p95_value numeric,
  good_count bigint,
  needs_improvement_count bigint,
  poor_count bigint,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.metric_type,
    ROUND(AVG(v.value)::numeric, 2) as avg_value,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY v.value)::numeric, 2) as p50_value,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY v.value)::numeric, 2) as p75_value,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY v.value)::numeric, 2) as p95_value,
    SUM(CASE WHEN v.rating = 'good' THEN 1 ELSE 0 END)::bigint as good_count,
    SUM(CASE WHEN v.rating = 'needs-improvement' THEN 1 ELSE 0 END)::bigint as needs_improvement_count,
    SUM(CASE WHEN v.rating = 'poor' THEN 1 ELSE 0 END)::bigint as poor_count,
    COUNT(*)::bigint as total_count
  FROM obs_vitals v
  WHERE v.created_at >= p_start_date
    AND v.created_at < p_end_date
    AND (p_path IS NULL OR v.path = p_path)
  GROUP BY v.metric_type;
END;
$$;

-- Get hourly trends for charts
CREATE OR REPLACE FUNCTION get_vitals_trends(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_metric_type text DEFAULT NULL
)
RETURNS TABLE (
  hour timestamptz,
  metric_type text,
  avg_value numeric,
  p75_value numeric,
  count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('hour', v.created_at) as hour,
    v.metric_type,
    ROUND(AVG(v.value)::numeric, 2) as avg_value,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY v.value)::numeric, 2) as p75_value,
    COUNT(*)::bigint as count
  FROM obs_vitals v
  WHERE v.created_at >= p_start_date
    AND v.created_at < p_end_date
    AND (p_metric_type IS NULL OR v.metric_type = p_metric_type)
  GROUP BY date_trunc('hour', v.created_at), v.metric_type
  ORDER BY hour ASC;
END;
$$;

-- Get page analytics
CREATE OR REPLACE FUNCTION get_page_analytics(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  path text,
  pageviews bigint,
  unique_sessions bigint,
  avg_lcp numeric,
  avg_cls numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.path,
    COUNT(*)::bigint as pageviews,
    COUNT(DISTINCT pv.session_id)::bigint as unique_sessions,
    ROUND(AVG(CASE WHEN v.metric_type = 'LCP' THEN v.value END)::numeric, 2) as avg_lcp,
    ROUND(AVG(CASE WHEN v.metric_type = 'CLS' THEN v.value END)::numeric, 4) as avg_cls
  FROM obs_pageviews pv
  LEFT JOIN obs_vitals v ON v.path = pv.path
    AND v.created_at >= p_start_date
    AND v.created_at < p_end_date
  WHERE pv.created_at >= p_start_date
    AND pv.created_at < p_end_date
    AND pv.event_type = 'pageview'
  GROUP BY pv.path
  ORDER BY pageviews DESC
  LIMIT p_limit;
END;
$$;

-- Cleanup old observability data (call via cron)
CREATE OR REPLACE FUNCTION cleanup_observability_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete raw vitals older than 30 days
  DELETE FROM obs_vitals WHERE created_at < now() - interval '30 days';

  -- Delete raw pageviews older than 30 days
  DELETE FROM obs_pageviews WHERE created_at < now() - interval '30 days';

  -- Delete errors older than 7 days
  DELETE FROM obs_errors WHERE created_at < now() - interval '7 days';

  -- Delete hourly aggregates older than 90 days
  DELETE FROM obs_vitals_hourly WHERE hour < now() - interval '90 days';

  -- Delete daily aggregates older than 1 year
  DELETE FROM obs_pageviews_daily WHERE day < (now() - interval '1 year')::date;
END;
$$;
