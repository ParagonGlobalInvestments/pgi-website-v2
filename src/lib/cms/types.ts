/**
 * CMS Types — Content Management System for the PGI public site
 */

export type PeopleGroupSlug =
  | 'officers'
  | 'alumni-board'
  | 'founders'
  | 'chapter-founders'
  | 'investment-committee'
  | 'portfolio-managers'
  | 'value-analysts'
  | 'quant-research-committee'
  | 'quant-analysts'
  | 'recruitment-team';

export interface CmsPerson {
  id: string;
  group_slug: PeopleGroupSlug;
  name: string;
  title: string | null;
  school: string | null;
  company: string | null;
  linkedin: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CmsRecruitment {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface CmsStatistic {
  id: string;
  key: string;
  label: string;
  value: string;
  sort_order: number;
  updated_at: string;
}

export interface CmsTimelineEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SponsorType = 'sponsor' | 'partner';

export interface CmsSponsor {
  id: string;
  type: SponsorType;
  name: string;
  display_name: string;
  website: string | null;
  image_path: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Group metadata for the People tab UI */
export const PEOPLE_GROUPS: {
  slug: PeopleGroupSlug;
  label: string;
  fields: ('title' | 'school' | 'company' | 'linkedin')[];
}[] = [
  { slug: 'officers', label: 'Officers', fields: ['title', 'school', 'linkedin'] },
  { slug: 'alumni-board', label: 'Alumni Board', fields: ['company', 'linkedin'] },
  { slug: 'founders', label: 'Founders', fields: ['school', 'linkedin'] },
  { slug: 'chapter-founders', label: 'Chapter Founders', fields: ['school', 'linkedin'] },
  { slug: 'investment-committee', label: 'Investment Committee', fields: ['school', 'linkedin'] },
  { slug: 'portfolio-managers', label: 'Portfolio Managers', fields: ['school', 'linkedin'] },
  { slug: 'value-analysts', label: 'Value Analysts', fields: ['school'] },
  { slug: 'quant-research-committee', label: 'Quant Research Committee', fields: ['school', 'linkedin'] },
  { slug: 'quant-analysts', label: 'Quant Analysts', fields: ['school'] },
  { slug: 'recruitment-team', label: 'Recruitment Team', fields: ['title', 'school', 'linkedin'] },
];
