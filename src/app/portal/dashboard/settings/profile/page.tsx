"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { useMongoUser } from "@/hooks/useMongoUser";
import { useRouter } from "next/navigation";
import {
  FaSave,
  FaLinkedin,
  FaUserAlt,
  FaGraduationCap,
  FaCogs,
  FaUser,
  FaDesktop,
} from "react-icons/fa";

import {
  Input,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  SmoothTransition,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { MultiSelect, ComboboxOption } from "@/components/ui/combobox";

// Animation variants
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 24,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      duration: 0.3,
    },
  },
};

interface ProfileFormValues {
  bio: string;
  skills: string[];
  gradYear: number;
  linkedin: string;
  avatarUrl: string;
}

// Common skill suggestions
const commonSkills: ComboboxOption[] = [
  { value: "Financial Modeling", label: "Financial Modeling" },
  { value: "Excel", label: "Excel" },
  { value: "Python", label: "Python" },
  { value: "Data Analysis", label: "Data Analysis" },
  { value: "Valuation", label: "Valuation" },
  { value: "Research", label: "Research" },
  { value: "Portfolio Management", label: "Portfolio Management" },
  { value: "PowerPoint", label: "PowerPoint" },
  { value: "Bloomberg", label: "Bloomberg" },
  { value: "Equity Research", label: "Equity Research" },
];

// Track-specific skills
const quantSkills: ComboboxOption[] = [
  { value: "Python", label: "Python" },
  { value: "R", label: "R" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "Statistical Analysis", label: "Statistical Analysis" },
  { value: "SQL", label: "SQL" },
  { value: "Data Visualization", label: "Data Visualization" },
  { value: "Risk Management", label: "Risk Management" },
  { value: "Algorithmic Trading", label: "Algorithmic Trading" },
  { value: "Pandas", label: "Pandas" },
  { value: "NumPy", label: "NumPy" },
];

const valueSkills: ComboboxOption[] = [
  { value: "DCF Analysis", label: "DCF Analysis" },
  { value: "Comparable Analysis", label: "Comparable Analysis" },
  {
    value: "Financial Statement Analysis",
    label: "Financial Statement Analysis",
  },
  { value: "Industry Research", label: "Industry Research" },
  { value: "Accounting", label: "Accounting" },
  { value: "Due Diligence", label: "Due Diligence" },
  { value: "Private Equity", label: "Private Equity" },
  { value: "Investment Banking", label: "Investment Banking" },
  { value: "Equity Research", label: "Equity Research" },
  { value: "Financial Modeling", label: "Financial Modeling" },
];

// Leadership skills
const leadershipSkills: ComboboxOption[] = [
  { value: "Team Management", label: "Team Management" },
  { value: "Project Management", label: "Project Management" },
  { value: "Mentoring", label: "Mentoring" },
  { value: "Public Speaking", label: "Public Speaking" },
  { value: "Strategic Planning", label: "Strategic Planning" },
  { value: "Recruiting", label: "Recruiting" },
];

export default function ProfileSettingsPage() {
  const { user, isLoading, error, updateUser } = useMongoUser();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>();

  // Generate suggested skills based on user's track and role
  const suggestedSkills = useMemo(() => {
    let skills: ComboboxOption[] = [...commonSkills];

    // Add track-specific skills
    if (user?.track === "quant") {
      skills = [...skills, ...quantSkills];
    } else if (user?.track === "value") {
      skills = [...skills, ...valueSkills];
    } else if (user?.track === "both") {
      skills = [...skills, ...quantSkills, ...valueSkills];
    }

    // Add leadership skills for leads and admins
    if (user?.role === "lead" || user?.role === "admin") {
      skills = [...skills, ...leadershipSkills];
    }

    // Add manager-specific skills
    if (user?.isManager) {
      skills.push({
        value: "Portfolio Management",
        label: "Portfolio Management",
      });
      skills.push({
        value: "Performance Analysis",
        label: "Performance Analysis",
      });
    }

    // Remove duplicates
    const uniqueSkills = Array.from(new Set(skills.map((s) => s.value))).map(
      (value) => skills.find((s) => s.value === value)!
    );

    return uniqueSkills;
  }, [user?.track, user?.role, user?.isManager]);

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      setValue("bio", user.bio || "");
      setValue("skills", user.skills || []);
      setSelectedSkills(user.skills || []);
      setValue("gradYear", user.gradYear || new Date().getFullYear() + 1);
      setValue("linkedin", user.linkedin || "");
      setValue("avatarUrl", user.avatarUrl || "");
    }
  }, [user, setValue]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Update user profile with skills array
      await updateUser({
        bio: data.bio,
        skills: selectedSkills,
        gradYear: data.gradYear,
        linkedin: data.linkedin,
        avatarUrl: data.avatarUrl,
      });

      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSaveError(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedPage>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003E6B]"></div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">
            Manage your account, profile, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger
              value="account"
              className="flex items-center gap-2"
              onClick={() => router.push("/portal/dashboard/settings")}
            >
              <FaDesktop className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <FaUser className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {error && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-50 p-4 rounded-lg text-red-800"
          >
            {error}
          </motion.div>
        )}

        {saveError && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-50 p-4 rounded-lg text-red-800"
          >
            {saveError}
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-green-50 p-4 rounded-lg text-green-800"
          >
            Profile updated successfully!
          </motion.div>
        )}

        <motion.div variants={formVariants} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <motion.img
                        src={
                          user?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.name || "User"
                          )}&background=random`
                        }
                        alt={user?.name || "User"}
                        className="h-20 w-20 rounded-full object-cover border border-gray-200"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="avatarUrl"
                        type="text"
                        {...register("avatarUrl")}
                        className="w-full border-2 border-gray-300 text-gray-900"
                        placeholder="URL to your profile image"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Enter a URL to your profile picture
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <FaUserAlt className="mr-2 text-gray-500" />
                      Bio
                    </div>
                  </label>
                  <Textarea
                    id="bio"
                    rows={4}
                    {...register("bio")}
                    className="w-full border-2 border-gray-300 text-gray-900"
                    placeholder="Tell us about yourself, your interests, and background..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label
                    htmlFor="skills"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <FaCogs className="mr-2 text-gray-500" />
                      Skills
                    </div>
                  </label>
                  <div className="space-y-1">
                    <MultiSelect
                      options={suggestedSkills}
                      selected={selectedSkills}
                      onChange={setSelectedSkills}
                      placeholder="Select skills or type to add custom skills..."
                      emptyText="No matching skills. Type a new skill to add it."
                      className="border-2 border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Select from suggested skills or add your own by typing and
                      pressing Enter
                    </p>
                  </div>
                </div>

                {/* Grad Year */}
                <div>
                  <label
                    htmlFor="gradYear"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <FaGraduationCap className="mr-2 text-gray-500" />
                      Graduation Year
                    </div>
                  </label>
                  <Input
                    id="gradYear"
                    type="number"
                    min={2000}
                    max={2100}
                    {...register("gradYear", {
                      valueAsNumber: true,
                      min: { value: 2000, message: "Year must be after 2000" },
                      max: { value: 2100, message: "Year must be before 2100" },
                    })}
                    className="w-full border-2 border-gray-300 text-gray-900"
                  />
                  {errors.gradYear && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gradYear.message}
                    </p>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center">
                      <FaLinkedin className="mr-2 text-gray-500" />
                      LinkedIn Profile
                    </div>
                  </label>
                  <Input
                    id="linkedin"
                    type="text"
                    {...register("linkedin")}
                    className="w-full border-2 border-gray-300 text-gray-900"
                    placeholder="https://linkedin.com/in/your-username"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    variant="navy"
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </SmoothTransition>
    </ProtectedPage>
  );
}
