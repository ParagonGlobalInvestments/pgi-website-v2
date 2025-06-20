'use client';
import { trackEvent } from '@/lib/posthog';

interface UniversityTrackerProps {
  universityName: string;
  section: 'members' | 'who-we-are' | 'home';
  interactionType: 'logo_click' | 'logo_hover' | 'chapter_view';
  additionalData?: Record<string, any>;
}

export const trackUniversityInteraction = ({
  universityName,
  section,
  interactionType,
  additionalData = {},
}: UniversityTrackerProps) => {
  trackEvent('university_interaction', {
    university_name: universityName,
    section,
    interaction_type: interactionType,
    university_tier: getUniversityTier(universityName),
    has_chapter: hasChapterAtUniversity(universityName),
    ...additionalData,
  });
};

// Helper function to categorize university tiers
function getUniversityTier(universityName: string): string {
  const tier1Universities = [
    'Harvard',
    'Stanford',
    'MIT',
    'Princeton',
    'Yale',
    'Columbia',
    'UChicago',
    'University of Chicago',
  ];
  const tier2Universities = [
    'NYU',
    'Northwestern',
    'Dartmouth',
    'Brown',
    'Cornell',
    'UPenn',
    'University of Pennsylvania',
  ];

  if (tier1Universities.some(uni => universityName.includes(uni)))
    return 'tier_1';
  if (tier2Universities.some(uni => universityName.includes(uni)))
    return 'tier_2';

  return 'other';
}

// Helper function to check if PGI has a chapter at the university
function hasChapterAtUniversity(universityName: string): boolean {
  const pgiChapterUniversities = [
    'Columbia',
    'Princeton',
    'Yale',
    'UChicago',
    'University of Chicago',
    'NYU',
    'UPenn',
    'University of Pennsylvania',
    'Brown',
  ];

  return pgiChapterUniversities.some(uni => universityName.includes(uni));
}

export default trackUniversityInteraction;
