-- Keep the same triggers and Vault configuration. Send event metadata in headers
-- so invalidation does not depend on POST bodies surviving the HTTP adapter.
BEGIN;

CREATE OR REPLACE FUNCTION public.notify_cms_cache_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  webhook_url text;
  webhook_secret text;
BEGIN
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets WHERE name = 'cms_revalidation_url';

  SELECT decrypted_secret INTO webhook_secret
  FROM vault.decrypted_secrets WHERE name = 'cms_revalidation_secret';

  IF coalesce(webhook_url, '') = '' OR coalesce(webhook_secret, '') = '' THEN
    RAISE WARNING 'CMS cache webhook is not configured in Vault';
    RETURN NULL;
  END IF;

  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret,
      'X-PGI-Schema', TG_TABLE_SCHEMA,
      'X-PGI-Table', TG_TABLE_NAME,
      'X-PGI-Event', TG_OP
    ),
    body := jsonb_build_object(
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'type', TG_OP
    ),
    timeout_milliseconds := 10000
  );
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'CMS cache webhook could not be queued (SQLSTATE %)', SQLSTATE;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_cms_cache_change()
  FROM PUBLIC, anon, authenticated;

COMMIT;
