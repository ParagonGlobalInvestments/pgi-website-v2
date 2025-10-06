'use client';

import { useState, useEffect } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/browser';
import { FaSave, FaBell, FaUser, FaPalette, FaDesktop } from 'react-icons/fa';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { motion } from 'framer-motion';
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
} from '@/components/ui';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { user: supabaseUserData, isLoading } = useSupabaseUser();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const supabase = createClient();

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

  // Save state and message
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });

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

  if (isLoading || !supabaseUser) {
    return null; // Let the layout handle loading
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-4 lg:pt-0 text-navy"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account, profile, and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <FaDesktop className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2"
              onClick={() => router.push('/portal/dashboard/settings/profile')}
            >
              <FaUser className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {saveMessage.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 p-4 rounded-md ${
              saveMessage.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {saveMessage.message}
          </motion.div>
        )}

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8"
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
                          Get notified when new internships matching your track
                          are posted
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
                            className="text-sm text-gray-700"
                          >
                            Small
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <label
                            htmlFor="medium"
                            className="text-sm text-gray-700"
                          >
                            Medium
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="large" id="large" />
                          <label
                            htmlFor="large"
                            className="text-sm text-gray-700"
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
      </SmoothTransition>
    </ProtectedPage>
  );
}
