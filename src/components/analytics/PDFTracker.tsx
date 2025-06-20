'use client';
import { trackEvent } from '@/lib/posthog';

interface PDFTrackerProps {
  fileName: string;
  section: 'education' | 'resources' | 'application';
  contentType: 'lecture' | 'guide' | 'form' | 'report';
  downloadUrl: string;
}

export const trackPDFDownload = ({
  fileName,
  section,
  contentType,
  downloadUrl,
}: PDFTrackerProps) => {
  trackEvent('pdf_download', {
    file_name: fileName,
    section,
    content_type: contentType,
    download_url: downloadUrl,
    educational_topic: getEducationalTopic(fileName),
    engagement_level: 'high', // PDF downloads indicate high engagement
  });
};

// Track PDF link clicks (even if download doesn't complete)
export const trackPDFClick = ({
  fileName,
  section,
  contentType,
  downloadUrl,
}: PDFTrackerProps) => {
  trackEvent('pdf_click', {
    file_name: fileName,
    section,
    content_type: contentType,
    download_url: downloadUrl,
    educational_topic: getEducationalTopic(fileName),
  });
};

// Helper function to categorize educational content
function getEducationalTopic(fileName: string): string {
  if (fileName.includes('accounting')) return 'accounting';
  if (fileName.includes('valuation')) return 'valuation';
  if (fileName.includes('investment')) return 'investment_theory';
  if (fileName.includes('portfolio')) return 'portfolio_management';
  if (fileName.includes('algorithmic') || fileName.includes('trading'))
    return 'algorithmic_trading';
  if (fileName.includes('quantitative')) return 'quantitative_methods';

  return 'general';
}

export { trackPDFDownload as default };
