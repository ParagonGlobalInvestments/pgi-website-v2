-- =====================================================
-- TEST USERS SETUP FOR PGI PORTAL
-- =====================================================
-- This script creates 6 test users covering all role/track combinations
-- 
-- ROLES: admin, lead, member
-- TRACKS: quant, value
--
-- IMPORTANT: Run this AFTER users have signed up via Google OAuth
-- OR manually create auth users first (see Option 2 below)
-- =====================================================

-- =====================================================
-- OPTION 1: Update existing users (RECOMMENDED)
-- =====================================================
-- If you've already created accounts via Google sign-in,
-- just update their permissions here:

-- Example for updating an existing user:
-- UPDATE users 
-- SET 
--   org_permission_level = 'admin',
--   org_track = 'quant',
--   org_chapter_id = '45074ec1-1d76-4550-857d-00163d5bfd67', -- NYU
--   org_track_roles = ARRAY['QuantitativeResearchCommittee']::text[],
--   org_exec_roles = ARRAY['president']::text[]
-- WHERE personal_email = 'your-email@example.com';

-- =====================================================
-- OPTION 2: Create test users from scratch (ADVANCED)
-- =====================================================
-- This creates both auth users AND users table entries
-- You'll need to set passwords for these accounts

-- First, get chapter IDs (for reference)
-- SELECT id, name FROM chapters ORDER BY name;

-- Chapter IDs (from your database):
-- Brown:      2dc57a67-469b-4230-9833-e792ba985f9f
-- Columbia:   0be083a2-85e8-4dd3-90d0-9b27b201efe9
-- Cornell:    8dba9827-f9a7-4f9c-8e03-ae4fe4397acf
-- NYU:        45074ec1-1d76-4550-857d-00163d5bfd67
-- Princeton:  dac2cd2e-8818-465b-8e0e-e1392968ca1a
-- UChicago:   bec9d9f8-4f13-4d43-abb0-6fb08c9ee094
-- Penn:       06f79e29-c7b1-4a22-8197-b4fff68553a5
-- Yale:       1bc0b2cb-b6b1-4e06-a9d1-a7f94ff9e9a9

-- =====================================================
-- TEST USER 1: Admin - Quant Track
-- =====================================================
INSERT INTO users (
  id,
  personal_name,
  personal_email,
  personal_major,
  personal_grad_year,
  personal_bio,
  org_chapter_id,
  org_permission_level,
  org_track,
  org_track_roles,
  org_exec_roles,
  profile_skills,
  system_supabase_id,
  org_status
) VALUES (
  gen_random_uuid(),
  'Test Admin Quant',
  'admin-quant@pgitest.com',
  'Computer Science & Mathematics',
  2025,
  'Test admin user for quantitative track. Has full access to all features.',
  '45074ec1-1d76-4550-857d-00163d5bfd67', -- NYU
  'admin',
  'quant',
  ARRAY['QuantitativeResearchCommittee', 'TradingCommittee']::text[],
  ARRAY['president', 'cto']::text[],
  ARRAY['Python', 'Machine Learning', 'Quantitative Finance', 'C++', 'Statistics']::text[],
  NULL, -- Will be populated after auth signup
  'active'
) ON CONFLICT (personal_email) DO UPDATE SET
  org_permission_level = EXCLUDED.org_permission_level,
  org_track = EXCLUDED.org_track,
  org_track_roles = EXCLUDED.org_track_roles,
  org_exec_roles = EXCLUDED.org_exec_roles;

-- =====================================================
-- TEST USER 2: Admin - Value Track
-- =====================================================
INSERT INTO users (
  id,
  personal_name,
  personal_email,
  personal_major,
  personal_grad_year,
  personal_bio,
  org_chapter_id,
  org_permission_level,
  org_track,
  org_track_roles,
  org_exec_roles,
  profile_skills,
  system_supabase_id,
  org_status
) VALUES (
  gen_random_uuid(),
  'Test Admin Value',
  'admin-value@pgitest.com',
  'Finance & Economics',
  2025,
  'Test admin user for value track. Has full access to all features.',
  'dac2cd2e-8818-465b-8e0e-e1392968ca1a', -- Princeton
  'admin',
  'value',
  ARRAY['ValueInvestingCommittee', 'ResearchCommittee']::text[],
  ARRAY['cfo', 'vp-research']::text[],
  ARRAY['Financial Modeling', 'DCF Analysis', 'Equity Research', 'Excel', 'Bloomberg Terminal']::text[],
  NULL,
  'active'
) ON CONFLICT (personal_email) DO UPDATE SET
  org_permission_level = EXCLUDED.org_permission_level,
  org_track = EXCLUDED.org_track,
  org_track_roles = EXCLUDED.org_track_roles,
  org_exec_roles = EXCLUDED.org_exec_roles;

-- =====================================================
-- TEST USER 3: Lead - Quant Track
-- =====================================================
INSERT INTO users (
  id,
  personal_name,
  personal_email,
  personal_major,
  personal_grad_year,
  personal_bio,
  org_chapter_id,
  org_permission_level,
  org_track,
  org_track_roles,
  org_exec_roles,
  profile_skills,
  system_supabase_id,
  org_status
) VALUES (
  gen_random_uuid(),
  'Test Lead Quant',
  'lead-quant@pgitest.com',
  'Mathematics & Statistics',
  2026,
  'Test lead user for quantitative track. Can post internships and manage chapter members.',
  'bec9d9f8-4f13-4d43-abb0-6fb08c9ee094', -- UChicago
  'lead',
  'quant',
  ARRAY['QuantitativeResearchCommittee']::text[],
  ARRAY[]::text[], -- Leads don't have exec roles
  ARRAY['R', 'Python', 'Time Series Analysis', 'Algorithmic Trading', 'SQL']::text[],
  NULL,
  'active'
) ON CONFLICT (personal_email) DO UPDATE SET
  org_permission_level = EXCLUDED.org_permission_level,
  org_track = EXCLUDED.org_track,
  org_track_roles = EXCLUDED.org_track_roles,
  org_exec_roles = EXCLUDED.org_exec_roles;

-- =====================================================
-- TEST USER 4: Lead - Value Track
-- =====================================================
INSERT INTO users (
  id,
  personal_name,
  personal_email,
  personal_major,
  personal_grad_year,
  personal_bio,
  org_chapter_id,
  org_permission_level,
  org_track,
  org_track_roles,
  org_exec_roles,
  profile_skills,
  system_supabase_id,
  org_status
) VALUES (
  gen_random_uuid(),
  'Test Lead Value',
  'lead-value@pgitest.com',
  'Business Administration',
  2026,
  'Test lead user for value track. Can post internships and manage chapter members.',
  '1bc0b2cb-b6b1-4e06-a9d1-a7f94ff9e9a9', -- Yale
  'lead',
  'value',
  ARRAY['ValueInvestingCommittee']::text[],
  ARRAY[]::text[],
  ARRAY['Equity Valuation', 'Financial Statement Analysis', 'Portfolio Management', 'PowerPoint', 'Capital IQ']::text[],
  NULL,
  'active'
) ON CONFLICT (personal_email) DO UPDATE SET
  org_permission_level = EXCLUDED.org_permission_level,
  org_track = EXCLUDED.org_track,
  org_track_roles = EXCLUDED.org_track_roles,
  org_exec_roles = EXCLUDED.org_exec_roles;

-- =====================================================
-- TEST USER 5: Member - Quant Track
-- =====================================================
INSERT INTO users (
  id,
  personal_name,
  personal_email,
  personal_major,
  personal_grad_year,
  personal_bio,
  org_chapter_id,
  org_permission_level,
  org_track,
  org_track_roles,
  org_exec_roles,
  profile_skills,
  system_supabase_id,
  org_status
) VALUES (
  gen_random_uuid(),
  'Test Member Quant',
  'member-quant@pgitest.com',
  'Physics',
  2027,
  'Test member user for quantitative track. Has basic access to portal features.',
  '2dc57a67-469b-4230-9833-e792ba985f9f', -- Brown
  'member',
  'quant',
  ARRAY['QuantitativeResearchCommittee']::text[],
  ARRAY[]::text[],
  ARRAY['Python', 'Data Analysis', 'Linear Algebra', 'Pandas', 'NumPy']::text[],
  NULL,
  'active'
) ON CONFLICT (personal_email) DO UPDATE SET
  org_permission_level = EXCLUDED.org_permission_level,
  org_track = EXCLUDED.org_track,
  org_track_roles = EXCLUDED.org_track_roles,
  org_exec_roles = EXCLUDED.org_exec_roles;

-- =====================================================
-- TEST USER 6: Member - Value Track
-- =====================================================
INSERT INTO users (
  id,
  personal_name,
  personal_email,
  personal_major,
  personal_grad_year,
  personal_bio,
  org_chapter_id,
  org_permission_level,
  org_track,
  org_track_roles,
  org_exec_roles,
  profile_skills,
  system_supabase_id,
  org_status
) VALUES (
  gen_random_uuid(),
  'Test Member Value',
  'member-value@pgitest.com',
  'Economics',
  2027,
  'Test member user for value track. Has basic access to portal features.',
  '0be083a2-85e8-4dd3-90d0-9b27b201efe9', -- Columbia
  'member',
  'value',
  ARRAY['ValueInvestingCommittee']::text[],
  ARRAY[]::text[],
  ARRAY['Excel', 'Financial Modeling', 'Accounting', 'Valuation', 'Research']::text[],
  NULL,
  'active'
) ON CONFLICT (personal_email) DO UPDATE SET
  org_permission_level = EXCLUDED.org_permission_level,
  org_track = EXCLUDED.org_track,
  org_track_roles = EXCLUDED.org_track_roles,
  org_exec_roles = EXCLUDED.org_exec_roles;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all test users were created:
SELECT 
  personal_name,
  personal_email,
  org_permission_level as role,
  org_track as track,
  c.name as chapter,
  org_status as status
FROM users u
LEFT JOIN chapters c ON u.org_chapter_id = c.id
WHERE personal_email LIKE '%@pgitest.com'
ORDER BY org_permission_level DESC, org_track;

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- To delete all test users:
-- DELETE FROM users WHERE personal_email LIKE '%@pgitest.com';

