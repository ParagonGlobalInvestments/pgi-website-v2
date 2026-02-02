/**
 * PGI Portal — Resource definitions
 *
 * Hardcoded resource links organized by category.
 * Files hosted in Supabase Storage (public bucket: resources).
 */

const BASE =
  'https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string; // Public Supabase Storage URL (empty = "Coming soon")
  type: 'pdf' | 'doc' | 'sheet' | 'folder';
}

export interface ResourceCategory {
  id: string;
  label: string;
  description: string;
  resources: Resource[];
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'education',
    label: 'Education',
    description: 'Weekly class materials for Value and Quant tracks',
    resources: [
      // Value Education
      {
        id: 'value-week-1',
        title: 'Value Education — Week 1',
        description: 'Introduction to value investing fundamentals',
        url: '',
        type: 'pdf',
      },
      {
        id: 'value-week-2',
        title: 'Value Education — Week 2',
        description: 'Financial statement analysis',
        url: `${BASE}/education/value-week-2.pdf`,
        type: 'pdf',
      },
      {
        id: 'value-week-3',
        title: 'Value Education — Week 3',
        description: 'Valuation methodologies',
        url: `${BASE}/education/value-week-3.pdf`,
        type: 'pdf',
      },
      {
        id: 'value-week-4',
        title: 'Value Education — Week 4',
        description: 'Pitch construction and presentation',
        url: '',
        type: 'pdf',
      },
      // Quant Education
      {
        id: 'quant-week-1',
        title: 'Quant Education — Week 1',
        description: 'Options and derivatives fundamentals',
        url: `${BASE}/education/quant-week-1.pdf`,
        type: 'pdf',
      },
      {
        id: 'quant-week-2',
        title: 'Quant Education — Week 2',
        description: 'Linear factor pricing models',
        url: `${BASE}/education/quant-week-2.pdf`,
        type: 'pdf',
      },
      {
        id: 'quant-week-3',
        title: 'Quant Education — Week 3',
        description: 'Portfolio optimization',
        url: `${BASE}/education/quant-week-3.pdf`,
        type: 'pdf',
      },
      {
        id: 'quant-week-4',
        title: 'Quant Education — Week 4',
        description: 'Portfolio construction',
        url: `${BASE}/education/quant-week-4.pdf`,
        type: 'pdf',
      },
      {
        id: 'quant-week-5',
        title: 'Quant Education — Week 5',
        description: 'Market making',
        url: `${BASE}/education/quant-week-5.pdf`,
        type: 'pdf',
      },
    ],
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    description: 'Networking guides, resume templates, and technical prep',
    resources: [
      // IB Networking
      {
        id: 'networking-emails',
        title: 'Networking Emails Guide',
        description: 'Templates and strategies for IB networking outreach',
        url: `${BASE}/recruitment/networking-emails.docx`,
        type: 'doc',
      },
      {
        id: 'networking-questions',
        title: 'Networking Questions & Guide',
        description: 'Comprehensive guide for networking conversations',
        url: `${BASE}/recruitment/networking-questions.docx`,
        type: 'doc',
      },
      // Resume
      {
        id: 'sample-resume',
        title: 'Sample Resume',
        description: 'Example IB resume template',
        url: `${BASE}/recruitment/sample-resume.pdf`,
        type: 'pdf',
      },
      // IB Technicals
      {
        id: 'technicals-core-concepts',
        title: 'Core Concepts',
        description: 'Fundamental IB technical concepts',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-accounting',
        title: 'Accounting — 3 Statements',
        description: 'Income statement, balance sheet, and cash flow',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-advanced-accounting',
        title: 'Advanced Accounting & Projecting',
        description: 'Advanced accounting concepts and financial projections',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-ev',
        title: 'Equity, EV, and Valuation Multiples',
        description: 'Enterprise value and comparable company analysis',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-dcf',
        title: 'DCF',
        description: 'Discounted cash flow analysis',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-merger',
        title: 'Merger Model',
        description: 'M&A analysis and accretion/dilution',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-lbo',
        title: 'LBO',
        description: 'Leveraged buyout analysis',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-dcm-ecm',
        title: 'DCM, ECM, Lev Fin',
        description: 'Capital markets and leveraged finance',
        url: '',
        type: 'pdf',
      },
      {
        id: 'technicals-private',
        title: 'Private Companies',
        description: 'Valuing private companies',
        url: '',
        type: 'pdf',
      },
      // Interview Questions (merged into single entry)
      {
        id: 'interview-questions',
        title: 'Past Interview Questions',
        description: 'Real interview questions from past recruiting cycles',
        url: '',
        type: 'pdf',
      },
      // Financial Modeling
      {
        id: 'modeling-guide',
        title: '3 Statement Model Guide',
        description: 'Complete guide to building a 3-statement financial model',
        url: '',
        type: 'pdf',
      },
      {
        id: 'modeling-notes',
        title: 'Modeling Notes (LBO and General)',
        description: 'LBO modeling and general financial modeling notes',
        url: `${BASE}/recruitment/modeling-notes.pdf`,
        type: 'pdf',
      },
      {
        id: 'excel-shortcuts',
        title: 'Excel Shortcuts',
        description: 'Essential Excel keyboard shortcuts for finance',
        url: '',
        type: 'pdf',
      },
      // Quant Prep
      {
        id: 'quant-joshi',
        title: 'Quant Job Interview Q&A (Mark Joshi)',
        description: 'Comprehensive quant interview preparation',
        url: `${BASE}/recruitment/quant-joshi.pdf`,
        type: 'pdf',
      },
      {
        id: 'quant-zhou',
        title: 'Practical Guide to Quant Interviews (Xinfeng Zhou)',
        description: 'Practical quant finance interview guide',
        url: `${BASE}/recruitment/quant-zhou.pdf`,
        type: 'pdf',
      },
      {
        id: 'quant-janestreet',
        title: 'Jane Street Interview Guide',
        description: 'Preparation guide for Jane Street interviews',
        url: `${BASE}/recruitment/quant-janestreet.pdf`,
        type: 'pdf',
      },
    ],
  },
  {
    id: 'pitches',
    label: 'Pitches',
    description: 'Investment pitch reports and financial models',
    resources: [
      {
        id: 'pitch-crwd',
        title: 'NASDAQ: CRWD — CrowdStrike',
        description: 'Investment pitch report and model (Dec 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-cytk',
        title: 'NASDAQ: CYTK — Cytokinetics',
        description: 'Investment pitch report and model (Dec 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-frpt',
        title: 'NASDAQ: FRPT — Freshpet',
        description: 'Investment pitch report and model (May 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-hood',
        title: 'NASDAQ: HOOD — Robinhood',
        description: 'Investment pitch report and model (May 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-os',
        title: 'NASDAQ: OS — OneStream',
        description: 'Investment pitch report and model (Dec 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-pinc',
        title: 'NASDAQ: PINC — Premier',
        description: 'Investment pitch report and model (May 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-dlr',
        title: 'NYSE: DLR — Digital Realty',
        description: 'Investment pitch report and model (Dec 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-lea',
        title: 'NYSE: LEA — Lear Corporation',
        description: 'Investment pitch report and model (Dec 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-nke',
        title: 'NYSE: NKE — Nike',
        description: 'Investment pitch report and model (May 2025)',
        url: '',
        type: 'folder',
      },
      {
        id: 'pitch-nvo',
        title: 'NYSE: NVO — Novo Nordisk',
        description: 'Investment pitch report and model (May 2025)',
        url: '',
        type: 'folder',
      },
    ],
  },
];
