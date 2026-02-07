-- Resources table for portal resource management
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  url text not null default '',
  link_url text not null default '',
  type text not null default 'pdf',
  tab_id text not null,
  section text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: public read, admin write
alter table resources enable row level security;

create policy "Public read" on resources
  for select using (true);

create policy "Admin write" on resources
  for all using (
    auth.uid() in (select id from users where role = 'admin')
  );

-- Seed data from hardcoded constants
-- General tab — Networking
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('Networking Emails Guide', 'Templates and strategies for IB networking outreach', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/networking-emails.docx', 'doc', 'general', 'Networking', 0),
  ('Networking Questions & Guide', 'Comprehensive guide for networking conversations', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/networking-questions.docx', 'doc', 'general', 'Networking', 1);

-- General tab — Career Prep
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('Sample Resume', 'Example IB resume template', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/sample-resume.pdf', 'pdf', 'general', 'Career Prep', 0),
  ('Past Interview Questions', 'Real interview questions from past recruiting cycles', '', 'pdf', 'general', 'Career Prep', 1),
  ('Excel Shortcuts', 'Essential Excel keyboard shortcuts for finance', '', 'pdf', 'general', 'Career Prep', 2);

-- Value tab — Value Education
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('Value Education — Week 1', 'Introduction to value investing fundamentals', '', 'pdf', 'value', 'Value Education', 0),
  ('Value Education — Week 2', 'Financial statement analysis', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/value-week-2.pdf', 'pdf', 'value', 'Value Education', 1),
  ('Value Education — Week 3', 'Valuation methodologies', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/value-week-3.pdf', 'pdf', 'value', 'Value Education', 2),
  ('Value Education — Week 4', 'Pitch construction and presentation', '', 'pdf', 'value', 'Value Education', 3);

-- Value tab — IB Technicals
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('Core Concepts', 'Fundamental IB technical concepts', '', 'pdf', 'value', 'IB Technicals', 0),
  ('Accounting — 3 Statements', 'Income statement, balance sheet, and cash flow', '', 'pdf', 'value', 'IB Technicals', 1),
  ('Advanced Accounting & Projecting', 'Advanced accounting concepts and financial projections', '', 'pdf', 'value', 'IB Technicals', 2),
  ('Equity, EV, and Valuation Multiples', 'Enterprise value and comparable company analysis', '', 'pdf', 'value', 'IB Technicals', 3),
  ('DCF', 'Discounted cash flow analysis', '', 'pdf', 'value', 'IB Technicals', 4),
  ('Merger Model', 'M&A analysis and accretion/dilution', '', 'pdf', 'value', 'IB Technicals', 5),
  ('LBO', 'Leveraged buyout analysis', '', 'pdf', 'value', 'IB Technicals', 6),
  ('DCM, ECM, Lev Fin', 'Capital markets and leveraged finance', '', 'pdf', 'value', 'IB Technicals', 7),
  ('Private Companies', 'Valuing private companies', '', 'pdf', 'value', 'IB Technicals', 8);

-- Value tab — Financial Modeling
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('3 Statement Model Guide', 'Complete guide to building a 3-statement financial model', '', 'pdf', 'value', 'Financial Modeling', 0),
  ('Modeling Notes (LBO and General)', 'LBO modeling and general financial modeling notes', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/modeling-notes.pdf', 'pdf', 'value', 'Financial Modeling', 1);

-- Value tab — Stock Pitches
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('NASDAQ: CRWD — CrowdStrike', 'Investment pitch report and model (Dec 2025)', '', 'folder', 'value', 'Stock Pitches', 0),
  ('NASDAQ: CYTK — Cytokinetics', 'Investment pitch report and model (Dec 2025)', '', 'folder', 'value', 'Stock Pitches', 1),
  ('NASDAQ: FRPT — Freshpet', 'Investment pitch report and model (May 2025)', '', 'folder', 'value', 'Stock Pitches', 2),
  ('NASDAQ: HOOD — Robinhood', 'Investment pitch report and model (May 2025)', '', 'folder', 'value', 'Stock Pitches', 3),
  ('NASDAQ: OS — OneStream', 'Investment pitch report and model (Dec 2025)', '', 'folder', 'value', 'Stock Pitches', 4),
  ('NASDAQ: PINC — Premier', 'Investment pitch report and model (May 2025)', '', 'folder', 'value', 'Stock Pitches', 5),
  ('NYSE: DLR — Digital Realty', 'Investment pitch report and model (Dec 2025)', '', 'folder', 'value', 'Stock Pitches', 6),
  ('NYSE: LEA — Lear Corporation', 'Investment pitch report and model (Dec 2025)', '', 'folder', 'value', 'Stock Pitches', 7),
  ('NYSE: NKE — Nike', 'Investment pitch report and model (May 2025)', '', 'folder', 'value', 'Stock Pitches', 8),
  ('NYSE: NVO — Novo Nordisk', 'Investment pitch report and model (May 2025)', '', 'folder', 'value', 'Stock Pitches', 9);

-- Quant tab — Education
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('Quant Education — Week 1', 'Options and derivatives fundamentals', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/quant-week-1.pdf', 'pdf', 'quant', 'Education', 0),
  ('Quant Education — Week 2', 'Linear factor pricing models', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/quant-week-2.pdf', 'pdf', 'quant', 'Education', 1),
  ('Quant Education — Week 3', 'Portfolio optimization', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/quant-week-3.pdf', 'pdf', 'quant', 'Education', 2),
  ('Quant Education — Week 4', 'Portfolio construction', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/quant-week-4.pdf', 'pdf', 'quant', 'Education', 3),
  ('Quant Education — Week 5', 'Market making', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/education/quant-week-5.pdf', 'pdf', 'quant', 'Education', 4);

-- Quant tab — Interview Prep
insert into resources (title, description, url, type, tab_id, section, sort_order) values
  ('Quant Job Interview Q&A (Mark Joshi)', 'Comprehensive quant interview preparation', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/quant-joshi.pdf', 'pdf', 'quant', 'Interview Prep', 0),
  ('Practical Guide to Quant Interviews (Xinfeng Zhou)', 'Practical quant finance interview guide', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/quant-zhou.pdf', 'pdf', 'quant', 'Interview Prep', 1),
  ('Jane Street Interview Guide', 'Preparation guide for Jane Street interviews', 'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/recruitment/quant-janestreet.pdf', 'pdf', 'quant', 'Interview Prep', 2);
