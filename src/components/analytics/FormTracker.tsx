'use client';
import { trackEvent } from '@/lib/posthog';

interface FormTrackerProps {
  formName: 'interest_form' | 'application_form' | 'coffee_chat_signup';
  formType: 'google_form' | 'signup_com';
  targetUrl: string;
  section: 'apply_page' | 'header' | 'footer';
  additionalData?: Record<string, any>;
}

export const trackFormInteraction = ({
  formName,
  formType,
  targetUrl,
  section,
  additionalData = {},
}: FormTrackerProps) => {
  trackEvent('form_interaction', {
    form_name: formName,
    form_type: formType,
    target_url: targetUrl,
    section,
    interaction_type: 'click',
    conversion_intent: getConversionIntent(formName),
    user_journey_stage: getUserJourneyStage(formName),
    ...additionalData,
  });
};

// Track form abandonment (when user navigates away)
export const trackFormAbandonment = ({
  formName,
  formType,
  targetUrl,
  timeSpent,
}: FormTrackerProps & { timeSpent: number }) => {
  trackEvent('form_abandonment', {
    form_name: formName,
    form_type: formType,
    target_url: targetUrl,
    time_spent_seconds: timeSpent,
    abandonment_stage: 'external_redirect',
  });
};

// Track form completion intent
export const trackFormCompletionIntent = ({
  formName,
  formType,
  additionalData = {},
}: Omit<FormTrackerProps, 'targetUrl' | 'section'> & {
  additionalData?: Record<string, any>;
}) => {
  trackEvent('form_completion_intent', {
    form_name: formName,
    form_type: formType,
    intent_level: 'high',
    ...additionalData,
  });
};

// Helper function to determine conversion intent level
function getConversionIntent(
  formName: string
): 'low' | 'medium' | 'high' | 'critical' {
  switch (formName) {
    case 'interest_form':
      return 'medium';
    case 'application_form':
      return 'critical';
    case 'coffee_chat_signup':
      return 'high';
    default:
      return 'low';
  }
}

// Helper function to determine user journey stage
function getUserJourneyStage(
  formName: string
): 'awareness' | 'consideration' | 'decision' | 'action' {
  switch (formName) {
    case 'interest_form':
      return 'consideration';
    case 'application_form':
      return 'action';
    case 'coffee_chat_signup':
      return 'decision';
    default:
      return 'awareness';
  }
}

// Enhanced form click handler with comprehensive tracking
export const handleFormClick = (props: FormTrackerProps) => {
  const startTime = Date.now();

  // Track the initial click
  trackFormInteraction(props);

  // Track window focus loss (potential form abandonment)
  const handleWindowBlur = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    trackFormAbandonment({ ...props, timeSpent });
    window.removeEventListener('blur', handleWindowBlur);
  };

  // Track when user returns (potential form completion)
  const handleWindowFocus = () => {
    trackFormCompletionIntent(props);
    window.removeEventListener('focus', handleWindowFocus);
  };

  window.addEventListener('blur', handleWindowBlur);
  setTimeout(() => {
    window.addEventListener('focus', handleWindowFocus);
  }, 1000); // Wait 1 second before listening for focus

  // Clean up listeners after 5 minutes
  setTimeout(() => {
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
  }, 300000);
};
