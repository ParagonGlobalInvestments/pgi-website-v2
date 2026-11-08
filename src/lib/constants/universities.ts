export interface University {
  name: string;
  displayName: string;
  website: string;
  imagePath: string;
}

export const UNIVERSITIES: University[] = [
  {
    name: 'brown',
    displayName: 'Brown University',
    website: 'https://www.brown.edu/',
    imagePath: '/images/universities/brown.png',
  },
  {
    name: 'columbia',
    displayName: 'Columbia University',
    website: 'https://www.columbia.edu/',
    imagePath: '/images/universities/columbia.png',
  },
  {
    name: 'cornell',
    displayName: 'Cornell University',
    website: 'https://www.cornell.edu/',
    imagePath: '/images/universities/cornell.png',
  },
  {
    name: 'upenn',
    displayName: 'University of Pennsylvania',
    website: 'https://www.upenn.edu/',
    imagePath: '/images/universities/upenn.png',
  },
  {
    name: 'uchicago',
    displayName: 'University of Chicago',
    website: 'https://www.uchicago.edu/',
    imagePath: '/images/universities/uchicago.png',
  },
  {
    name: 'princeton',
    displayName: 'Princeton University',
    website: 'https://www.princeton.edu/',
    imagePath: '/images/universities/princeton-original.png',
  },
  {
    name: 'nyu',
    displayName: 'New York University',
    website: 'https://www.nyu.edu/',
    imagePath: '/images/universities/nyu.png',
  },
  {
    name: 'yale',
    displayName: 'Yale University',
    website: 'https://www.yale.edu/',
    imagePath: '/images/universities/yale.png',
  },
];

const SCHOOL_ALIASES: Record<string, string> = {
  barnard: 'columbia',
  'barnard college': 'columbia',
  penn: 'upenn',
  'the university of chicago': 'uchicago',
  brown: 'brown',
  columbia: 'columbia',
  cornell: 'cornell',
  nyu: 'nyu',
  'new york university': 'nyu',
  princeton: 'princeton',
  uchicago: 'uchicago',
  'university of chicago': 'uchicago',
  upenn: 'upenn',
  'university of pennsylvania': 'upenn',
  yale: 'yale',
};

/** Maps a school name in any known form to its slug, or null if it isn't a chapter. */
export function toSchoolSlug(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  return (
    SCHOOL_ALIASES[normalized] ??
    UNIVERSITIES.find(u => u.displayName.toLowerCase() === normalized)?.name ??
    null
  );
}
