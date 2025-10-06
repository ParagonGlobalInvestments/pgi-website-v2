'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';

// Updated to match the nested MongoDB schema
interface UserData {
  personal?: {
    name?: string;
    email?: string;
    bio?: string;
    major?: string;
    gradYear?: number;
    isAlumni?: boolean;
    phone?: string;
  };
  org?: {
    chapter?: {
      name: string;
    };
    track?: 'quant' | 'value';
    trackRoles?: string[];
    status?: 'active' | 'inactive' | 'pending';
  };
  profile?: {
    skills?: string[];
    linkedin?: string;
    github?: string;
    interests?: string[];
  };
  system?: {
    firstLogin: boolean;
    notifications?: {
      email: boolean;
      platform: boolean;
    };
  };
}

interface OnboardingWizardProps {
  onComplete: () => void;
  userData?: {
    track?: string;
    trackRole?: string;
    chapter?: string;
    major?: string;
    gradYear?: number;
    skills?: string[];
    bio?: string;
  };
  lightTheme?: boolean;
}

// Define the steps in the onboarding process
enum OnboardingStep {
  Welcome = 0,
  BasicInfo = 1,
  TrackSelection = 2,
  ChapterSelection = 3,
  ProfileInfo = 4,
  Complete = 5,
}

// Valid chapters
const CHAPTERS = [
  'Princeton University',
  'Brown University',
  'Columbia University',
  'Yale University',
  'University of Pennsylvania',
  'New York University',
  'University of Chicago',
  'Cornell University',
];

// Tracks
const TRACKS = [
  {
    id: 'value',
    name: 'Value Investing',
    description:
      'Focus on fundamental analysis and identifying undervalued securities',
  },
  {
    id: 'quant',
    name: 'Quantitative Investing',
    description:
      'Apply mathematical models and computational methods to market data',
  },
];

// Available roles per track
const TRACK_ROLES = {
  quant: [
    {
      id: 'QuantitativeAnalyst',
      name: 'Quantitative Analyst',
      description: 'Develop and implement quantitative models',
    },
    {
      id: 'QuantitativeResearchCommittee',
      name: 'Quantitative Research Committee',
      description: 'Lead research and model development',
    },
  ],
  value: [
    {
      id: 'ValueAnalyst',
      name: 'Value Analyst',
      description: 'Conduct fundamental analysis on securities',
    },
  ],
};

// Special Value track roles that can be selected together
const VALUE_ADDITIONAL_ROLES = [
  {
    id: 'InvestmentCommittee',
    name: 'Investment Committee',
    description: 'Review and approve investment decisions',
  },
  {
    id: 'PortfolioManager',
    name: 'Portfolio Manager',
    description: "Manage a segment of the fund's portfolio",
  },
];

/**
 * Check if a user needs onboarding
 * Returns true if any required field is missing
 */
export function needsOnboarding(userData?: {
  track?: string;
  trackRole?: string;
  chapter?: string;
  major?: string;
  gradYear?: number;
  skills?: string[];
  bio?: string;
}) {
  if (!userData) {
    console.log('needsOnboarding: userData is null or undefined');
    return true;
  }

  // Helper function to check if a value is empty (null, undefined, or empty string)
  const isEmpty = (value: any) => {
    return value === null || value === undefined || value === '';
  };

  const missingFields = {
    track: isEmpty(userData.track),
    trackRole: isEmpty(userData.trackRole),
    chapter: isEmpty(userData.chapter),
    major: isEmpty(userData.major),
  };

  console.log('needsOnboarding check -', {
    track: userData.track,
    trackRole: userData.trackRole,
    chapter: userData.chapter,
    major: userData.major,
    missingFields: Object.entries(missingFields)
      .filter(([_, isMissing]) => isMissing)
      .map(([field]) => field),
  });

  // Check if any required fields are missing or empty strings
  const needsOnboarding =
    isEmpty(userData.track) ||
    isEmpty(userData.trackRole) ||
    isEmpty(userData.chapter) ||
    isEmpty(userData.major);

  console.log(`User ${needsOnboarding ? 'NEEDS' : 'DOES NOT NEED'} onboarding`);
  return needsOnboarding;
}

export default function OnboardingWizard({
  onComplete,
  userData,
  lightTheme = false,
}: OnboardingWizardProps) {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(OnboardingStep.Welcome);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check Supabase auth
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Update form data when supabaseUser is loaded
  useEffect(() => {
    if (supabaseUser) {
      setFormData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          name: supabaseUser.user_metadata?.full_name || '',
          email: supabaseUser.email || '',
        },
      }));
    }
  }, [supabaseUser]);

  // Form data with nested structure to match MongoDB schema - initialize with useEffect
  const [formData, setFormData] = useState<UserData>({
    personal: {
      name: '',
      email: '',
      bio: userData?.bio || '',
      major: userData?.major || '',
      gradYear: userData?.gradYear || new Date().getFullYear() + 1,
      isAlumni: false,
      phone: '',
    },
    org: {
      chapter: {
        name: userData?.chapter || '',
      },
      track: (userData?.track as 'quant' | 'value') || undefined,
      trackRoles: userData?.trackRole ? [userData.trackRole] : [],
      status: 'active',
    },
    profile: {
      skills: userData?.skills || [],
      linkedin: '',
      github: '',
      interests: [],
    },
    system: {
      firstLogin: false,
      notifications: {
        email: true,
        platform: true,
      },
    },
  });

  // State for special value track multiple role selection
  const [valueTrackRoles, setValueTrackRoles] = useState<{
    [key: string]: boolean;
  }>({
    InvestmentCommittee: false,
    PortfolioManager: false,
  });

  // Derived state for track-specific roles
  const [availableRoles, setAvailableRoles] = useState<
    { id: string; name: string; description: string }[]
  >([]);

  // Update available roles when track changes
  useEffect(() => {
    if (formData.org?.track) {
      setAvailableRoles(TRACK_ROLES[formData.org.track] || []);
    } else {
      setAvailableRoles([]);
    }

    // Reset value track roles when track changes
    if (formData.org?.track !== 'value') {
      setValueTrackRoles({
        InvestmentCommittee: false,
        PortfolioManager: false,
      });
    }
  }, [formData.org?.track]);

  // Update form data - handles nested fields
  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section as keyof UserData],
        [field]: value,
      },
    }));

    // Reset trackRoles when track changes
    if (section === 'org' && field === 'track') {
      setFormData(prevData => ({
        ...prevData,
        org: {
          ...prevData.org,
          trackRoles: [],
        },
      }));
    }
  };

  // Handle value track special roles
  const handleValueRoleChange = (roleId: string, checked: boolean) => {
    setValueTrackRoles(prev => ({
      ...prev,
      [roleId]: checked,
    }));

    // Update the trackRoles array for MongoDB
    const newRoles = [...(formData.org?.trackRoles || [])];

    // Add or remove the role
    if (checked && !newRoles.includes(roleId)) {
      newRoles.push(roleId);
    } else if (!checked) {
      const index = newRoles.indexOf(roleId);
      if (index > -1) {
        newRoles.splice(index, 1);
      }
    }

    setFormData(prevData => ({
      ...prevData,
      org: {
        ...prevData.org,
        trackRoles: newRoles,
      },
    }));
  };

  // Update single track role (for Quant or Value Analyst)
  const updateTrackRole = (roleId: string) => {
    // Start with the primary role
    const newRoles = [roleId];

    // For Value track, include any selected additional roles
    if (formData.org?.track === 'value') {
      Object.entries(valueTrackRoles).forEach(([role, isSelected]) => {
        if (isSelected) {
          newRoles.push(role);
        }
      });
    }

    setFormData(prevData => ({
      ...prevData,
      org: {
        ...prevData.org,
        trackRoles: newRoles,
      },
    }));
  };

  // Go to next step
  const goToNextStep = () => {
    if (currentStep < OnboardingStep.Complete) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    if (currentStep > OnboardingStep.Welcome) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  // Handle skills input (comma-separated)
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());

    setFormData(prevData => ({
      ...prevData,
      profile: {
        ...prevData.profile,
        skills: skillsArray,
      },
    }));
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.org?.chapter?.name) {
        setError('Please select a chapter');
        setLoading(false);
        return;
      }

      if (!formData.org?.track) {
        setError('Please select a track');
        setLoading(false);
        return;
      }

      if (!formData.org?.trackRoles || formData.org.trackRoles.length === 0) {
        setError('Please select at least one role');
        setLoading(false);
        return;
      }

      console.log('===== STARTING ONBOARDING COMPLETION =====');
      console.log('Chapter selected:', formData.org?.chapter?.name);
      console.log('Track selected:', formData.org?.track);
      console.log('Roles selected:', formData.org?.trackRoles);

      // Create a simple, flat API payload with all the critical data
      const apiData = {
        // Required fields
        chapter: formData.org?.chapter?.name,
        track: formData.org?.track,
        trackRoles: formData.org?.trackRoles,
        firstLogin: false, // Explicitly set to false

        // Personal info
        name: formData.personal?.name,
        email: formData.personal?.email,
        major: formData.personal?.major,
        gradYear: formData.personal?.gradYear,
        bio: formData.personal?.bio,
        phone: formData.personal?.phone,
        isAlumni: formData.personal?.isAlumni,

        // Profile info
        skills: formData.profile?.skills,
        linkedin: formData.profile?.linkedin,
        github: formData.profile?.github,
        interests: formData.profile?.interests,
      };

      console.log('Sending onboarding data:', JSON.stringify(apiData, null, 2));

      // Make a direct call to sync API with all the data
      const syncResponse = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
        cache: 'no-store', // Prevent caching
      });

      if (!syncResponse.ok) {
        const syncErrorData = await syncResponse.json();
        throw new Error(
          `Sync failed: ${syncErrorData.error || 'Unknown error'}`
        );
      }

      const syncResponseData = await syncResponse.json();
      console.log('Sync response:', syncResponseData);

      // Make a secondary direct PATCH to ensure firstLogin is set to false
      console.log('Making secondary direct update to firstLogin');
      const updateResponse = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: {
            firstLogin: false,
          },
        }),
      });

      if (!updateResponse.ok) {
        const updateErrorData = await updateResponse.json();
        console.error('Failed to update firstLogin:', updateErrorData);
      } else {
        console.log('Successfully set firstLogin to false');
      }

      // Verify the data was saved correctly
      console.log('Verifying data was saved...');
      const verifyResponse = await fetch('/api/users/me', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log(
          'Verification data:',
          JSON.stringify(
            {
              firstLogin: verifyData.user.system.firstLogin,
              chapter: verifyData.user.org.chapter?.name,
              track: verifyData.user.org.track,
              trackRoles: verifyData.user.org.trackRoles,
            },
            null,
            2
          )
        );

        // If data still not saved correctly, show error
        if (
          verifyData.user.system.firstLogin === true ||
          !verifyData.user.org.chapter?.name ||
          !verifyData.user.org.track
        ) {
          console.error(
            'CRITICAL: Data not saved correctly after verification'
          );
          setError(
            'Your profile was not saved correctly. Please try again or contact support.'
          );
        }
      }

      console.log('===== ONBOARDING COMPLETION FINISHED =====');

      // Complete the onboarding process
      onComplete();

      // Force full page reload to ensure state is consistent
      setTimeout(() => {
        console.log(
          'Forcing page refresh to update UI with completed onboarding data'
        );
        window.location.href = '/portal/dashboard?onboarded=true';
      }, 1000);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      // Don't proceed to onComplete if there was an error
      return;
    } finally {
      setLoading(false);
    }
  };

  // Validate current step
  const canProceed = () => {
    switch (currentStep) {
      case OnboardingStep.Welcome:
        return true;
      case OnboardingStep.BasicInfo:
        return formData.personal?.name && formData.personal?.email;
      case OnboardingStep.TrackSelection:
        if (!formData.org?.track) return false;

        // For quant track, need a role selection
        if (formData.org.track === 'quant') {
          return formData.org.trackRoles && formData.org.trackRoles.length > 0;
        }

        // For value track, either need Value Analyst selected or at least one of the special roles
        if (formData.org.track === 'value') {
          return formData.org.trackRoles && formData.org.trackRoles.length > 0;
        }

        return false;
      case OnboardingStep.ChapterSelection:
        return formData.org?.chapter?.name ? true : false;
      case OnboardingStep.ProfileInfo:
        return (
          formData.personal?.major &&
          formData.personal?.gradYear &&
          formData.personal?.gradYear > 2000 &&
          formData.personal?.gradYear < 2100
        );
      default:
        return true;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingStep.Welcome:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <img
                  src="/logos/pgiLogoTransparentDark.png"
                  alt="Paragon Global Investments"
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-gray-800">
                <DecryptedText
                  text="Welcome to"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={30}
                  useOriginalCharsOnly={true}
                  className="text-2xl font-semibold text-gray-800"
                />
                <br />
                <DecryptedText
                  text="Paragon Global Investments"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={25}
                  useOriginalCharsOnly={true}
                  className="text-pgi-accent-blue font-bold"
                />
              </h3>
              <p className="text-gray-600">
                Let's set up your profile. This will only take a few minutes, I
                promise.
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <Button
                onClick={goToNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Start <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case OnboardingStep.BasicInfo:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                <DecryptedText
                  text="Your Basic Information"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-xl font-semibold text-gray-800"
                />
              </h3>
              <p className="text-gray-600">
                <DecryptedText
                  text="Confirm these details from your account."
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={15}
                  useOriginalCharsOnly={true}
                  className="text-gray-600"
                />
              </p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.personal?.name || ''}
                  onChange={e =>
                    updateFormData('personal', 'name', e.target.value)
                  }
                  placeholder="Your full name"
                  className="border-2 border-gray-300 text-black focus-visible:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  value={formData.personal?.email || ''}
                  onChange={e =>
                    updateFormData('personal', 'email', e.target.value)
                  }
                  placeholder="Your email address"
                  type="email"
                  disabled={!!supabaseUser?.email}
                  className="border-2 border-gray-300 text-black focus-visible:ring-blue-500"
                />
                {supabaseUser?.email && (
                  <p className="text-xs text-gray-500">
                    This email is verified through your account.
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  value={formData.personal?.phone || ''}
                  onChange={e =>
                    updateFormData('personal', 'phone', e.target.value)
                  }
                  placeholder="Your phone number"
                  type="tel"
                  className="border-2 border-gray-300 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="border-gray-300 text-gray-700"
              >
                Back
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        );

      case OnboardingStep.TrackSelection:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                <DecryptedText
                  text="Select Your Investment Track"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-xl font-semibold text-gray-800"
                />
              </h3>
              <p className="text-gray-600">
                <DecryptedText
                  text="Choose the investment approach that best aligns with your interests and goals."
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={12}
                  useOriginalCharsOnly={true}
                  className="text-gray-600"
                />
              </p>
            </div>

            {/* Track Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="track" className="text-gray-700 font-medium">
                  Investment Track
                </Label>
                <Select
                  value={formData.org?.track}
                  onValueChange={value => updateFormData('org', 'track', value)}
                >
                  <SelectTrigger className="border-2 border-gray-300 text-black focus:border-blue-500">
                    <SelectValue placeholder="Select your investment track" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 border border-gray-200 z-[90]">
                    {TRACKS.map(track => (
                      <SelectItem
                        key={track.id}
                        value={track.id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.org?.track && (
                  <p className="text-xs text-gray-500 mt-1">
                    {
                      TRACKS.find(t => t.id === formData.org?.track)
                        ?.description
                    }
                  </p>
                )}
              </div>

              {/* Role Selection - Different for each track */}
              {formData.org?.track === 'quant' && (
                <div className="space-y-2">
                  <Label
                    htmlFor="trackRole"
                    className="text-gray-700 font-medium"
                  >
                    Your Role
                  </Label>
                  <Select
                    value={formData.org.trackRoles?.[0] || ''}
                    onValueChange={value => updateTrackRole(value)}
                  >
                    <SelectTrigger className="border-2 border-gray-300 text-black focus:border-blue-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900 border border-gray-200 z-[90]">
                      {availableRoles.map(role => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.org.trackRoles?.[0] && (
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        availableRoles.find(
                          r => r.id === formData.org?.trackRoles?.[0]
                        )?.description
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Value Track - Primary Role and Additional Roles */}
              {formData.org?.track === 'value' && (
                <div className="space-y-4">
                  {/* Primary Role - Value Analyst */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="valueTrackRole"
                      className="text-gray-700 font-medium"
                    >
                      Primary Role
                    </Label>
                    <Select
                      value={
                        formData.org.trackRoles?.includes('ValueAnalyst')
                          ? 'ValueAnalyst'
                          : ''
                      }
                      onValueChange={value => updateTrackRole(value)}
                    >
                      <SelectTrigger className="border-2 border-gray-300 text-black focus:border-blue-500">
                        <SelectValue placeholder="Select your primary role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-gray-900 border border-gray-200 z-[90]">
                        {availableRoles.map(role => (
                          <SelectItem
                            key={role.id}
                            value={role.id}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Roles - Can select both */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Additional Roles (Optional)
                    </Label>
                    <div className="space-y-3 mt-2">
                      {VALUE_ADDITIONAL_ROLES.map(role => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={role.id}
                            checked={valueTrackRoles[role.id] || false}
                            onCheckedChange={checked =>
                              handleValueRoleChange(role.id, checked === true)
                            }
                          />
                          <Label
                            htmlFor={role.id}
                            className="text-sm font-normal cursor-pointer text-black"
                          >
                            {role.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You can select multiple additional roles if applicable.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="border-gray-300 text-gray-700"
              >
                Back
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        );

      case OnboardingStep.ChapterSelection:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                <DecryptedText
                  text="Select Your Chapter"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-xl font-semibold text-gray-800"
                />
              </h3>
              <p className="text-gray-600">
                <DecryptedText
                  text="Which university chapter are you a part of?"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={15}
                  useOriginalCharsOnly={true}
                  className="text-gray-600"
                />
              </p>
            </div>

            {/* Chapter Selection */}
            <div className="space-y-2">
              <Label htmlFor="chapter" className="text-gray-700 font-medium">
                University Chapter
              </Label>
              <Select
                value={formData.org?.chapter?.name || ''}
                onValueChange={value =>
                  updateFormData('org', 'chapter', { name: value })
                }
              >
                <SelectTrigger className="border-2 border-gray-300 text-black focus:border-blue-500">
                  <SelectValue placeholder="Select your university chapter" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border border-gray-200 z-[90]">
                  {CHAPTERS.map(chapter => (
                    <SelectItem
                      key={chapter}
                      value={chapter}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="border-gray-300 text-gray-700"
              >
                Back
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        );

      case OnboardingStep.ProfileInfo:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                <DecryptedText
                  text="Complete Your Profile"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-xl font-semibold text-gray-800"
                />
              </h3>
              <p className="text-gray-600">
                <DecryptedText
                  text="Let us know a bit more about you."
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={15}
                  useOriginalCharsOnly={true}
                  className="text-gray-600"
                />
              </p>
            </div>

            <div className="space-y-4">
              {/* Major */}
              <div className="space-y-2">
                <Label htmlFor="major" className="text-gray-700 font-medium">
                  Major
                </Label>
                <Input
                  id="major"
                  value={formData.personal?.major || ''}
                  onChange={e =>
                    updateFormData('personal', 'major', e.target.value)
                  }
                  placeholder="E.g., Economics, Computer Science"
                  className="border-2 border-gray-300 focus-visible:ring-blue-500"
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="gradYear" className="text-gray-700 font-medium">
                  Expected Graduation Year
                </Label>
                <Input
                  id="gradYear"
                  type="number"
                  value={formData.personal?.gradYear || ''}
                  onChange={e =>
                    updateFormData(
                      'personal',
                      'gradYear',
                      parseInt(e.target.value)
                    )
                  }
                  className="border-2 border-gray-300 focus-visible:ring-blue-500"
                />
              </div>

              {/* Alumni Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAlumni"
                  checked={formData.personal?.isAlumni || false}
                  onCheckedChange={checked =>
                    updateFormData('personal', 'isAlumni', checked === true)
                  }
                />
                <Label
                  htmlFor="isAlumni"
                  className="text-sm font-normal cursor-pointer"
                >
                  I am an alumni
                </Label>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-gray-700 font-medium">
                  Skills (comma-separated)
                </Label>
                <Input
                  id="skills"
                  value={formData.profile?.skills?.join(', ') || ''}
                  onChange={handleSkillsChange}
                  placeholder="E.g., Python, Finance, Data Analysis"
                  className="border-2 border-gray-300 focus-visible:ring-blue-500"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-700 font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.personal?.bio || ''}
                  onChange={e =>
                    updateFormData('personal', 'bio', e.target.value)
                  }
                  placeholder="Tell us about yourself"
                  rows={3}
                  className="border-2 border-gray-300 focus-visible:ring-blue-500 resize-none"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-gray-700 font-medium">
                  LinkedIn (Optional)
                </Label>
                <Input
                  id="linkedin"
                  value={formData.profile?.linkedin || ''}
                  onChange={e =>
                    updateFormData('profile', 'linkedin', e.target.value)
                  }
                  placeholder="Your LinkedIn profile URL"
                  className="border-2 border-gray-300 focus-visible:ring-blue-500"
                />
              </div>

              {/* GitHub */}
              <div className="space-y-2">
                <Label htmlFor="github" className="text-gray-700 font-medium">
                  GitHub (Optional)
                </Label>
                <Input
                  id="github"
                  value={formData.profile?.github || ''}
                  onChange={e =>
                    updateFormData('profile', 'github', e.target.value)
                  }
                  placeholder="Your GitHub username"
                  className="border-2 border-gray-300 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="border-gray-300 text-gray-700"
              >
                Back
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        );

      case OnboardingStep.Complete:
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 rounded-full bg-green-100 mb-6">
              <CheckIcon className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="mb-4 text-2xl">
              <DecryptedText
                text="You're all set!"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={25}
                useOriginalCharsOnly={true}
                className="text-2xl font-bold text-gray-900"
              />
            </CardTitle>
            <CardDescription className="mb-8 max-w-md mx-auto">
              <DecryptedText
                text="Thanks for completing your onboarding. Click the button below to save your profile and start using the platform. Your chapter, track, and profile information will be saved."
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={10}
                useOriginalCharsOnly={true}
                className="text-gray-600"
              />
            </CardDescription>
            <Button
              className="w-full max-w-sm mb-4"
              onClick={completeOnboarding}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Go to Dashboard'}
            </Button>

            {/* Debug button to check user data */}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={async () => {
                try {
                  // Fetch current user data
                  const response = await fetch('/api/users/me');
                  if (response.ok) {
                    const data = await response.json();
                    console.log(
                      'Current user data:',
                      JSON.stringify(data.user, null, 2)
                    );
                    console.log(
                      'Chapter:',
                      data.user.org.chapter
                        ? data.user.org.chapter.name
                        : 'Not set'
                    );
                    console.log('Track:', data.user.org.track || 'Not set');
                    console.log('TrackRoles:', data.user.org.trackRoles);
                    console.log('FirstLogin:', data.user.system.firstLogin);

                    alert(`Debug Info:
Chapter: ${data.user.org.chapter ? data.user.org.chapter.name : 'Not set'}
Track: ${data.user.org.track || 'Not set'}
Roles: ${data.user.org.trackRoles.join(', ') || 'None'} 
FirstLogin: ${data.user.system.firstLogin}
                    
Check console for complete data.`);
                  }
                } catch (err) {
                  console.error('Error fetching debug data:', err);
                }
              }}
            >
              Debug User Data
            </Button>

            {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={
        lightTheme
          ? 'w-full'
          : 'min-h-screen bg-transparent flex items-center justify-center p-4'
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card
          className={`border-0 shadow-lg ${
            lightTheme ? 'overflow-hidden' : ''
          }`}
        >
          <CardHeader className="bg-white border-b border-gray-200 rounded-t-lg pb-6 pt-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              <DecryptedText
                text={`Hey ${supabaseUser?.user_metadata?.full_name || 'there'},`}
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={30}
                useOriginalCharsOnly={true}
                className="text-2xl font-bold text-center text-gray-900"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6 px-8 bg-white">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4 rounded-b-lg bg-gray-50">
            <div className="flex space-x-2">
              {Array.from({ length: OnboardingStep.Complete + 1 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                          ? 'bg-blue-400'
                          : 'bg-gray-200'
                    }`}
                  />
                )
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
