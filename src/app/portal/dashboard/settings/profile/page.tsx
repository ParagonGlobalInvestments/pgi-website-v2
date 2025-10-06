'use client';

import { useState, useEffect } from 'react';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import {
  FaSave,
  FaLinkedin,
  FaUser,
  FaGithub,
  FaTrash,
  FaPlus,
  FaBriefcase,
  FaCode,
  FaDesktop,
} from 'react-icons/fa';

import {
  Input,
  Textarea,
  Button,
  Card,
  CardContent,
  SmoothTransition,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
} from '@/components/ui';
import { MultiSelect } from '@/components/ui/combobox';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

// Animation variants

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const dragVariants = {
  dragging: {
    scale: 1.02,
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

interface ComboboxOption {
  label: string;
  value: string;
}

interface FormProject {
  title: string;
  description: string;
  link?: string;
  githubLink?: string;
  type: 'value' | 'quant' | 'other';
  startDate: string;
  endDate?: string;
  inProgress: boolean;
  tags: string[];
}

interface FormExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ProfileFormValues {
  personal: {
    major: string;
    bio: string;
    gradYear: number;
  };
  profile: {
    skills: string[];
    linkedin: string;
    github: string;
    avatarUrl: string;
    socialLinks: {
      twitter?: string;
      portfolio?: string;
      medium?: string;
    };
    projects: FormProject[];
    experiences: FormExperience[];
  };
}

const skillOptions: ComboboxOption[] = [
  { label: 'Python', value: 'Python' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'React', value: 'React' },
  { label: 'Data Analysis', value: 'Data Analysis' },
  { label: 'Machine Learning', value: 'Machine Learning' },
  { label: 'Financial Modeling', value: 'Financial Modeling' },
  { label: 'Quantitative Analysis', value: 'Quantitative Analysis' },
  { label: 'Investment Research', value: 'Investment Research' },
  { label: 'Portfolio Management', value: 'Portfolio Management' },
  { label: 'Risk Management', value: 'Risk Management' },
];

export default function ProfileSettingsPage() {
  const { user: supabaseUserData, isLoading } = useSupabaseUser();
  const supabase = createClient();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      personal: {
        major: '',
        bio: '',
        gradYear: new Date().getFullYear() + 1,
      },
      profile: {
        skills: [],
        linkedin: '',
        github: '',
        avatarUrl: '',
        socialLinks: {},
        projects: [],
        experiences: [],
      },
    },
    resolver: values => {
      const errors: Record<string, any> = {};

      // Validate projects
      if (values.profile.projects) {
        const projectErrors = values.profile.projects.map(project => {
          const err: Record<string, any> = {};
          if (!project.title) err.title = 'Title is required';
          if (!project.description) err.description = 'Description is required';
          if (!project.startDate) err.startDate = 'Start date is required';
          if (!project.type) err.type = 'Type is required';
          return Object.keys(err).length ? err : undefined;
        });
        if (projectErrors.some(Boolean)) {
          errors.profile = { projects: projectErrors };
        }
      }

      // Validate experiences
      if (values.profile.experiences) {
        const experienceErrors = values.profile.experiences.map(exp => {
          const err: Record<string, any> = {};
          if (!exp.company) err.company = 'Company is required';
          if (!exp.title) err.title = 'Title is required';
          if (!exp.startDate) err.startDate = 'Start date is required';
          if (!exp.description) err.description = 'Description is required';
          return Object.keys(err).length ? err : undefined;
        });
        if (experienceErrors.some(Boolean)) {
          errors.profile = { ...errors.profile, experiences: experienceErrors };
        }
      }

      return {
        values: {
          ...values,
          profile: {
            ...values.profile,
            projects: values.profile.projects.map(project => ({
              title: project.title || '',
              description: project.description || '',
              type: project.type || 'other',
              startDate:
                project.startDate || new Date().toISOString().split('T')[0],
              endDate: project.endDate,
              inProgress: Boolean(project.inProgress),
              tags: project.tags || [],
              link: project.link,
              githubLink: project.githubLink,
            })) as FormProject[],
            experiences: values.profile.experiences.map(exp => ({
              company: exp.company || '',
              title: exp.title || '',
              startDate:
                exp.startDate || new Date().toISOString().split('T')[0],
              endDate: exp.endDate,
              current: Boolean(exp.current),
              description: exp.description || '',
            })) as FormExperience[],
          },
        },
        errors: Object.keys(errors).length ? errors : {},
      };
    },
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: 'profile.projects',
    rules: {
      required: true,
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: 'profile.experiences',
    rules: {
      required: true,
    },
  });

  const appendEmptyProject = () => {
    const newProject: FormProject = {
      title: '',
      description: '',
      type: 'other',
      startDate: new Date().toISOString().split('T')[0],
      inProgress: false,
      tags: [],
    };
    appendProject(newProject);
  };

  const appendEmptyExperience = () => {
    const newExperience: FormExperience = {
      company: '',
      title: '',
      startDate: new Date().toISOString().split('T')[0],
      current: false,
      description: '',
    };
    appendExperience(newExperience);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async data => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const formattedProjects = data.profile.projects.map(project => ({
        title: project.title || '',
        description: project.description || '',
        type: project.type || 'other',
        link: project.link,
        githubLink: project.githubLink,
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate,
        inProgress: Boolean(project.inProgress),
        tags: project.tags || [],
      })) as FormProject[];

      const formattedExperiences = data.profile.experiences.map(exp => ({
        company: exp.company || '',
        title: exp.title || '',
        startDate: exp.startDate || new Date().toISOString().split('T')[0],
        endDate: exp.endDate,
        current: Boolean(exp.current),
        description: exp.description || '',
      })) as FormExperience[];

      // Update user in Supabase using flat structure
      if (!supabaseUserData?.id) {
        throw new Error('User not found');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          personal_major: data.personal.major,
          personal_bio: data.personal.bio,
          personal_grad_year: data.personal.gradYear,
          profile_skills: data.profile.skills,
          profile_linkedin: data.profile.linkedin,
          profile_github: data.profile.github,
          profile_avatar_url: data.profile.avatarUrl,
          profile_projects: JSON.stringify(formattedProjects),
          profile_experiences: JSON.stringify(formattedExperiences),
        })
        .eq('id', supabaseUserData.id);

      if (updateError) {
        throw updateError;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setSaveError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (result: DropResult, type: 'projects' | 'experiences') => {
    if (!result.destination) return;

    if (type === 'projects') {
      const items = Array.from(projectFields);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setValue('profile.projects', items as FormProject[]);
    } else {
      const items = Array.from(experienceFields);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setValue('profile.experiences', items as FormExperience[]);
    }
  };

  // Set form values when user data is loaded
  useEffect(() => {
    if (supabaseUserData) {
      setValue('personal.major', supabaseUserData.personal_major || '');
      setValue('personal.bio', supabaseUserData.personal_bio || '');
      setValue(
        'personal.gradYear',
        supabaseUserData.personal_grad_year || new Date().getFullYear() + 1
      );
      setValue('profile.skills', supabaseUserData.profile_skills || []);
      setValue(
        'profile.linkedin',
        (supabaseUserData as any).profile_linkedin || ''
      );
      setValue(
        'profile.github',
        (supabaseUserData as any).profile_github || ''
      );
      setValue('profile.avatarUrl', supabaseUserData.profile_avatar_url || '');

      // Parse and format projects
      let projects: FormProject[] = [];
      try {
        const projectsData = (supabaseUserData as any).profile_projects;
        if (typeof projectsData === 'string') {
          projects = JSON.parse(projectsData);
        } else if (Array.isArray(projectsData)) {
          projects = projectsData;
        }
      } catch (e) {
        console.error('Error parsing projects:', e);
      }

      const formattedProjects = projects.map(project => ({
        title: project.title || '',
        description: project.description || '',
        type: project.type || 'other',
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate,
        inProgress: Boolean(project.inProgress),
        tags: project.tags || [],
        link: project.link,
        githubLink: project.githubLink,
      })) as FormProject[];
      setValue('profile.projects', formattedProjects);

      // Parse and format experiences
      let experiences: FormExperience[] = [];
      try {
        const experiencesData = (supabaseUserData as any).profile_experiences;
        if (typeof experiencesData === 'string') {
          experiences = JSON.parse(experiencesData);
        } else if (Array.isArray(experiencesData)) {
          experiences = experiencesData;
        }
      } catch (e) {
        console.error('Error parsing experiences:', e);
      }

      const formattedExperiences = experiences.map(exp => ({
        company: exp.company || '',
        title: exp.title || '',
        startDate: exp.startDate || new Date().toISOString().split('T')[0],
        endDate: exp.endDate,
        current: Boolean(exp.current),
        description: exp.description || '',
      })) as FormExperience[];
      setValue('profile.experiences', formattedExperiences);
    }
  }, [supabaseUserData, setValue]);

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
        className="space-y-4 p-4 mx-auto text-navy"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account, profile, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger
              value="account"
              className="flex items-center gap-2"
              onClick={() => router.push('/portal/dashboard/settings')}
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Profile Settings
            </h2>
            <p className="text-gray-600">
              Update your professional information
            </p>
          </div>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            variant="navy"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="animate-spin h-4 w-4 border-t-2 border-white rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        {(saveError || saveSuccess) && (
          <AnimatePresence>
            {saveError && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-50 p-3 rounded-lg text-red-800 text-sm"
              >
                {saveError}
              </motion.div>
            )}
            {saveSuccess && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-green-50 p-3 rounded-lg text-green-800 text-sm"
              >
                Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <Card>
          <CardContent className="p-4 sm:p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FaUser className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <FaLinkedin className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-2"
                >
                  <FaCode className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="flex items-center gap-2"
                >
                  <FaBriefcase className="h-4 w-4" />
                  Experience
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      {...register('personal.major')}
                      className="mt-1"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradYear">Graduation Year</Label>
                    <Input
                      id="gradYear"
                      type="number"
                      {...register('personal.gradYear')}
                      className="mt-1"
                      min={2000}
                      max={2100}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register('personal.bio')}
                    className="mt-1"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <Label>Skills</Label>
                  <Controller
                    name="profile.skills"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect
                        options={skillOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select or type to add skills"
                        className="mt-1"
                      />
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <FaLinkedin className="text-[#0077B5]" />
                      LinkedIn
                    </Label>
                    <Input
                      {...register('profile.linkedin')}
                      className="mt-1"
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <FaGithub className="text-gray-900" />
                      GitHub
                    </Label>
                    <Input
                      {...register('profile.github')}
                      className="mt-1"
                      placeholder="GitHub profile URL"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={appendEmptyProject}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    Add Project
                  </Button>
                </div>
                <DragDropContext
                  onDragEnd={result => onDragEnd(result, 'projects')}
                >
                  <Droppable droppableId="projects">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {projectFields.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(provided: DraggableProvided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  variants={itemVariants}
                                  initial="hidden"
                                  animate={
                                    snapshot.isDragging ? 'dragging' : 'visible'
                                  }
                                  exit="exit"
                                  className="border rounded-lg p-4 space-y-4 bg-white"
                                >
                                  <div className="flex justify-between items-start">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-2"
                                    >
                                      <h3 className="text-lg font-semibold">
                                        Project {index + 1}
                                      </h3>
                                      <span className="text-gray-400 cursor-move">
                                        ⋮⋮
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => removeProject(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <FaTrash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Title</Label>
                                      <Input
                                        {...register(
                                          `profile.projects.${index}.title`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Type</Label>
                                      <Select
                                        onValueChange={value =>
                                          setValue(
                                            `profile.projects.${index}.type`,
                                            value as 'value' | 'quant' | 'other'
                                          )
                                        }
                                        defaultValue={field.type}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue placeholder="Select project type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="value">
                                            Value
                                          </SelectItem>
                                          <SelectItem value="quant">
                                            Quant
                                          </SelectItem>
                                          <SelectItem value="other">
                                            Other
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        {...register(
                                          `profile.projects.${index}.description`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Project Link</Label>
                                      <Input
                                        {...register(
                                          `profile.projects.${index}.link`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>GitHub Link</Label>
                                      <Input
                                        {...register(
                                          `profile.projects.${index}.githubLink`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Start Date</Label>
                                      <Input
                                        type="date"
                                        {...register(
                                          `profile.projects.${index}.startDate`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>End Date</Label>
                                      <Input
                                        type="date"
                                        {...register(
                                          `profile.projects.${index}.endDate`
                                        )}
                                        className="mt-1"
                                        disabled={watch(
                                          `profile.projects.${index}.inProgress`
                                        )}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        {...register(
                                          `profile.projects.${index}.inProgress`
                                        )}
                                        onCheckedChange={checked => {
                                          setValue(
                                            `profile.projects.${index}.inProgress`,
                                            checked
                                          );
                                          if (checked) {
                                            setValue(
                                              `profile.projects.${index}.endDate`,
                                              undefined
                                            );
                                          }
                                        }}
                                      />
                                      <Label>In Progress</Label>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={appendEmptyExperience}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    Add Experience
                  </Button>
                </div>
                <DragDropContext
                  onDragEnd={result => onDragEnd(result, 'experiences')}
                >
                  <Droppable droppableId="experiences">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {experienceFields.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(provided: DraggableProvided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  variants={itemVariants}
                                  initial="hidden"
                                  animate={
                                    snapshot.isDragging ? 'dragging' : 'visible'
                                  }
                                  exit="exit"
                                  className="border rounded-lg p-4 space-y-4 bg-white"
                                >
                                  <div className="flex justify-between items-start">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-2"
                                    >
                                      <h3 className="text-lg font-semibold">
                                        Experience {index + 1}
                                      </h3>
                                      <span className="text-gray-400 cursor-move">
                                        ⋮⋮
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => removeExperience(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <FaTrash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Company</Label>
                                      <Input
                                        {...register(
                                          `profile.experiences.${index}.company`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Title</Label>
                                      <Input
                                        {...register(
                                          `profile.experiences.${index}.title`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>Start Date</Label>
                                      <Input
                                        type="date"
                                        {...register(
                                          `profile.experiences.${index}.startDate`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label>End Date</Label>
                                      <Input
                                        type="date"
                                        {...register(
                                          `profile.experiences.${index}.endDate`
                                        )}
                                        className="mt-1"
                                        disabled={watch(
                                          `profile.experiences.${index}.current`
                                        )}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        {...register(
                                          `profile.experiences.${index}.current`
                                        )}
                                        onCheckedChange={checked => {
                                          setValue(
                                            `profile.experiences.${index}.current`,
                                            checked
                                          );
                                          if (checked) {
                                            setValue(
                                              `profile.experiences.${index}.endDate`,
                                              undefined
                                            );
                                          }
                                        }}
                                      />
                                      <Label>Current Position</Label>
                                    </div>
                                    <div className="md:col-span-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        {...register(
                                          `profile.experiences.${index}.description`
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </SmoothTransition>
    </ProtectedPage>
  );
}
