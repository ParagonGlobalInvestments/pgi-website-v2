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
