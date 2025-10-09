'use client';

import { useState, useEffect } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/browser';
import {
  FaSave,
  FaBell,
  FaUser,
  FaPalette,
  FaDesktop,
  FaLinkedin,
  FaGithub,
  FaGraduationCap,
  FaTimes,
} from 'react-icons/fa';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Switch,
  Card,
  CardHeader,
  CardContent,
  RadioGroup,
  RadioGroupItem,
  SmoothTransition,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Textarea,
  Label,
} from '@/components/ui';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function SettingsPage() {
  const { user: supabaseUserData, isLoading } = useSupabaseUser();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    internshipAlerts: true,
    eventReminders: true,
    newsletterUpdates: false,
  });

  // Display preferences state
  const [displayPreferences, setDisplayPreferences] = useState({
    darkMode: false,
    compactView: false,
    fontSize: 'medium',
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    major: '',
    gradYear: new Date().getFullYear() + 1,
    bio: '',
    skills: [] as string[],
    linkedin: '',
    github: '',
  });

  // Save state and message
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });

  // Load profile data from Supabase
  useEffect(() => {
    if (supabaseUserData) {
      setProfileData({
        major: supabaseUserData.personal_major || '',
        gradYear:
          supabaseUserData.personal_grad_year || new Date().getFullYear() + 1,
        bio: supabaseUserData.personal_bio || '',
        skills: supabaseUserData.profile_skills || [],
        linkedin: supabaseUserData.profile_linkedin || '',
        github: supabaseUserData.profile_github || '',
      });
    }
  }, [supabaseUserData]);

  // Handle notification preferences submission
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveMessage({
        type: 'success',
        message: 'Notification preferences saved successfully.',
      });

      setTimeout(() => {
        setSaveMessage({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        message: 'Failed to save notification preferences.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle display preferences submission
  const handleDisplaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveMessage({
        type: 'success',
        message: 'Display preferences saved successfully.',
      });

      setTimeout(() => {
        setSaveMessage({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        message: 'Failed to save display preferences.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle profile submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMessage({ type: '', message: '' });

      if (!supabaseUserData?.id) {
        throw new Error('User not found');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          personal_major: profileData.major,
          personal_grad_year: profileData.gradYear,
          personal_bio: profileData.bio,
          profile_skills: profileData.skills,
          profile_linkedin: profileData.linkedin,
          profile_github: profileData.github,
        })
        .eq('id', supabaseUserData.id);

      if (updateError) {
        throw updateError;
      }

      setSaveMessage({
        type: 'success',
        message: 'Profile updated successfully!',
      });

      setTimeout(() => {
        setSaveMessage({ type: '', message: '' });
      }, 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveMessage({
        type: 'error',
        message: error.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle adding a skill
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !profileData.skills.includes(trimmedSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove),
    }));
  };

  if (isLoading || !supabaseUser) {
    return (
      <ProtectedPage>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-6 pt-4 lg:pt-0 text-navy"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account, profile, and preferences
          </p>
        </div>

        {saveMessage.message && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-md ${
                saveMessage.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {saveMessage.message}
            </motion.div>
          </AnimatePresence>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <FaDesktop className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <FaUser className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Account Settings Tab */}
          <TabsContent value="account">
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {/* Notification Preferences Section */}
              <motion.div variants={cardVariants}>
                <Card>
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-2 px-2">
                      <FaBell className="text-gray-500" />
                      <h2 className="text-lg font-medium text-gray-800">
                        Notification Preferences
                      </h2>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleNotificationSubmit}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">
                              Email Notifications
                            </h3>
                            <p className="text-xs text-gray-500">
                              Receive email notifications for important updates
                            </p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={notificationPreferences.emailNotifications}
                            onCheckedChange={checked =>
                              setNotificationPreferences({
                                ...notificationPreferences,
                                emailNotifications: checked,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">
                              Internship Alerts
                            </h3>
                            <p className="text-xs text-gray-500">
                              Get notified when new internships matching your
                              track are posted
                            </p>
                          </div>
                          <Switch
                            id="internshipAlerts"
                            checked={notificationPreferences.internshipAlerts}
                            onCheckedChange={checked =>
                              setNotificationPreferences({
                                ...notificationPreferences,
                                internshipAlerts: checked,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">
                              Event Reminders
                            </h3>
                            <p className="text-xs text-gray-500">
                              Get reminders about upcoming events and meetings
                            </p>
                          </div>
                          <Switch
                            id="eventReminders"
                            checked={notificationPreferences.eventReminders}
                            onCheckedChange={checked =>
                              setNotificationPreferences({
                                ...notificationPreferences,
                                eventReminders: checked,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">
                              Newsletter Updates
                            </h3>
                            <p className="text-xs text-gray-500">
                              Receive monthly newsletter with club updates
                            </p>
                          </div>
                          <Switch
                            id="newsletterUpdates"
                            checked={notificationPreferences.newsletterUpdates}
                            onCheckedChange={checked =>
                              setNotificationPreferences({
                                ...notificationPreferences,
                                newsletterUpdates: checked,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          type="submit"
                          disabled={saving}
                          variant="navy"
                          className="flex items-center gap-2"
                        >
                          <FaSave />
                          {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Display Preferences Section */}
              <motion.div variants={cardVariants}>
                <Card>
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-2 px-2">
                      <FaPalette className="text-gray-500" />
                      <h2 className="text-lg font-medium text-gray-800">
                        Display Preferences
                      </h2>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleDisplaySubmit}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">
                              Dark Mode
                            </h3>
                            <p className="text-xs text-gray-500">
                              Use dark theme for the portal interface
                            </p>
                          </div>
                          <Switch
                            id="darkMode"
                            checked={displayPreferences.darkMode}
                            onCheckedChange={checked =>
                              setDisplayPreferences({
                                ...displayPreferences,
                                darkMode: checked,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">
                              Compact View
                            </h3>
                            <p className="text-xs text-gray-500">
                              Display more content with less spacing
                            </p>
                          </div>
                          <Switch
                            id="compactView"
                            checked={displayPreferences.compactView}
                            onCheckedChange={checked =>
                              setDisplayPreferences({
                                ...displayPreferences,
                                compactView: checked,
                              })
                            }
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Font Size
                          </h3>
                          <RadioGroup
                            value={displayPreferences.fontSize}
                            onValueChange={value =>
                              setDisplayPreferences({
                                ...displayPreferences,
                                fontSize: value,
                              })
                            }
                            className="flex items-center space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="small" id="small" />
                              <label
                                htmlFor="small"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Small
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medium" id="medium" />
                              <label
                                htmlFor="medium"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Medium
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="large" id="large" />
                              <label
                                htmlFor="large"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Large
                              </label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          type="submit"
                          disabled={saving}
                          variant="navy"
                          className="flex items-center gap-2"
                        >
                          <FaSave />
                          {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Profile Settings Tab */}
          <TabsContent value="profile">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-2 px-2">
                    <FaUser className="text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-800">
                      Profile Information
                    </h2>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="major"
                          className="flex items-center gap-2"
                        >
                          <FaGraduationCap className="text-blue-500" />
                          Major
                        </Label>
                        <Input
                          id="major"
                          value={profileData.major}
                          onChange={e =>
                            setProfileData({
                              ...profileData,
                              major: e.target.value,
                            })
                          }
                          placeholder="e.g., Computer Science"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gradYear">Graduation Year</Label>
                        <Input
                          id="gradYear"
                          type="number"
                          value={profileData.gradYear}
                          onChange={e =>
                            setProfileData({
                              ...profileData,
                              gradYear: parseInt(e.target.value),
                            })
                          }
                          className="mt-1"
                          min={2000}
                          max={2100}
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        className="mt-1"
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <Label htmlFor="skillInput">Skills</Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          id="skillInput"
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          placeholder="Type a skill and press Enter"
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          Add
                        </Button>
                      </div>
                      {profileData.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profileData.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="hover:text-blue-900 transition-colors"
                              >
                                <FaTimes className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <FaLinkedin className="text-[#0077B5]" />
                          LinkedIn
                        </Label>
                        <Input
                          value={profileData.linkedin}
                          onChange={e =>
                            setProfileData({
                              ...profileData,
                              linkedin: e.target.value,
                            })
                          }
                          placeholder="LinkedIn profile URL"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <FaGithub className="text-gray-900" />
                          GitHub
                        </Label>
                        <Input
                          value={profileData.github}
                          onChange={e =>
                            setProfileData({
                              ...profileData,
                              github: e.target.value,
                            })
                          }
                          placeholder="GitHub profile URL"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        variant="navy"
                        className="flex items-center gap-2"
                      >
                        <FaSave />
                        {saving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </SmoothTransition>
    </ProtectedPage>
  );
}
