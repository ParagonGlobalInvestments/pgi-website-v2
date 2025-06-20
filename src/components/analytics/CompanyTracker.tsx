'use client';
import { trackEvent } from '@/lib/posthog';

interface CompanyTrackerProps {
  companyName: string;
  section: 'placements' | 'members' | 'sponsors';
  interactionType: 'logo_click' | 'logo_hover' | 'profile_view';
  additionalData?: Record<string, any>;
}

export const trackCompanyInteraction = ({
  companyName,
  section,
  interactionType,
  additionalData = {},
}: CompanyTrackerProps) => {
  trackEvent('company_interaction', {
    company_name: companyName,
    section,
    interaction_type: interactionType,
    industry: getIndustryFromCompany(companyName),
    ...additionalData,
  });
};

// Helper function to categorize companies by industry
function getIndustryFromCompany(companyName: string): string {
  const financeCompanies = [
    'Goldman Sachs',
    'JP Morgan',
    'Morgan Stanley',
    'Citadel',
    'Blackstone',
    'Apollo',
    'KKR',
    'Carlyle',
  ];
  const techCompanies = [
    'Google',
    'Apple',
    'Microsoft',
    'Meta',
    'Amazon',
    'Tesla',
    'SpaceX',
    'Palantir',
  ];
  const consultingCompanies = ['McKinsey', 'BCG', 'Bain'];
  const tradingCompanies = [
    'Jane Street',
    'Two Sigma',
    'DE Shaw',
    'Millennium',
    'Point72',
    'Citadel Securities',
  ];

  if (financeCompanies.some(company => companyName.includes(company)))
    return 'finance';
  if (techCompanies.some(company => companyName.includes(company)))
    return 'technology';
  if (consultingCompanies.some(company => companyName.includes(company)))
    return 'consulting';
  if (tradingCompanies.some(company => companyName.includes(company)))
    return 'trading';

  return 'other';
}

export default trackCompanyInteraction;
