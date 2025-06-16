'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaLink,
  FaCalendarAlt,
  FaInfo,
  FaList,
  FaCheckCircle,
  FaTimes,
  FaGraduationCap,
} from 'react-icons/fa';
import { z } from 'zod';
import ProtectedPage from '@/components/auth/ProtectedPage';
import type { UserRole } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SmoothTransition } from '@/components/ui/SmoothTransition';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
};

const staggerFormItems = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Zod schema for validation
const internshipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional(),
  applicationLink: z.string().url('Please enter a valid URL'),
  applicationUrl: z.string().url('Please enter a valid URL').optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  track: z.enum(['quant', 'value', 'both']),
  chapter: z.string().min(1, 'Chapter is required'),
  schoolTargets: z.string().optional(),
  isPaid: z.boolean().optional(),
  isRemote: z.boolean().optional(),
});

type InternshipFormValues = z.infer<typeof internshipSchema>;

export default function NewInternshipPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [chapters, setChapters] = useState<{ _id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InternshipFormValues>();

  // Get user metadata
  const userRole = (user?.publicMetadata?.role as UserRole) || 'member';
  const userChapter =
    (user?.publicMetadata?.chapter as string) || 'Yale University';

  // Fetch chapters for the dropdown
  useEffect(() => {
    if (!isLoaded) return;

    const fetchChapters = async () => {
      try {
        const response = await fetch('/api/chapters');
        if (response.ok) {
          const data = await response.json();
          setChapters(data);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    fetchChapters();
  }, [isLoaded]);

  // Check if user has permission
  if (isLoaded && userRole !== 'admin' && userRole !== 'lead') {
    router.push('/portal/dashboard/internships');
    return null;
  }

  const onSubmit: SubmitHandler<InternshipFormValues> = async data => {
    try {
      setSubmitting(true);
      setError('');

      // Process the data
      const formattedData = {
        ...data,
        // Convert comma-separated requirements to array
        requirements: data.requirements
          ? data.requirements
              .split(',')
              .map(req => req.trim())
              .filter(Boolean)
          : [],
        // Convert comma-separated school targets to array
        schoolTargets: data.schoolTargets
          ? data.schoolTargets
              .split(',')
              .map(school => school.trim())
              .filter(Boolean)
          : [],
        // Ensure deadline is a valid date
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
        // Use applicationUrl as applicationLink if not provided
        applicationLink: data.applicationLink || data.applicationUrl,
      };

      // Submit to API
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create internship');
      }

      // Show success message then redirect
      setSuccess(true);
      setTimeout(() => {
        router.push('/portal/dashboard/internships');
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003E6B]"></div>
      </div>
    );
  }

  return (
    <ProtectedPage
      requiredRole={['admin', 'lead']}
      redirectTo="/portal/dashboard/internships"
    >
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-4 lg:pt-0 text-navy"
      >
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="mr-3 text-gray-500"
            asChild
          >
            <Link href="/portal/dashboard/internships">
              <FaArrowLeft size={14} />
            </Link>
          </Button>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800"
          >
            Post New Internship
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-sm lg:text-base text-center lg:text-left px-4 lg:px-0"
        >
          Fill out the form below to create a new internship opportunity for
          your chapter.
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 flex items-center"
          >
            <FaTimes className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-800 flex items-center"
          >
            <FaCheckCircle className="mr-2 flex-shrink-0" />
            <span>Internship created successfully! Redirecting...</span>
          </motion.div>
        )}

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white p-8 rounded-xl shadow-md"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <motion.div
              variants={staggerFormItems}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Basic Information Section */}
              <motion.div
                variants={fadeIn}
                className="border-b border-gray-200 pb-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaInfo className="mr-2 text-[#003E6B]" /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className=" text-sm font-medium text-gray-700 mb-1 flex items-center"
                    >
                      <FaBriefcase className="mr-1 text-gray-400" /> Job Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      {...register('title', { required: true })}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                      placeholder="e.g. Summer Analyst"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label
                      htmlFor="company"
                      className=" text-sm font-medium text-gray-700 mb-1 flex items-center"
                    >
                      <FaBuilding className="mr-1 text-gray-400" /> Company *
                    </label>
                    <input
                      id="company"
                      type="text"
                      {...register('company', { required: true })}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                      placeholder="e.g. Goldman Sachs"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.company.message}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700 mb-1 flex items-center"
                    >
                      <FaMapMarkerAlt className="mr-1 text-gray-400" /> Location
                      *
                    </label>
                    <input
                      id="location"
                      type="text"
                      {...register('location', { required: true })}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                      placeholder="e.g. New York, NY"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Application Links */}
                  <motion.div variants={fadeIn} className="space-y-4">
                    <div>
                      <label
                        htmlFor="applicationLink"
                        className=" text-sm font-medium text-gray-700 mb-1 flex items-center"
                      >
                        <FaLink className="mr-2 text-gray-400" />
                        Application Link*
                      </label>
                      <input
                        type="url"
                        id="applicationLink"
                        {...register('applicationLink')}
                        className={`w-full p-2 border ${
                          errors.applicationLink
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#003E6B]'
                        } rounded-md focus:outline-none focus:ring-2`}
                        placeholder="https://example.com/apply"
                      />
                      {errors.applicationLink && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.applicationLink.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="applicationUrl"
                        className="text-sm font-medium text-gray-700 mb-1 flex items-center"
                      >
                        <FaLink className="mr-2 text-gray-400" />
                        Direct Application URL
                      </label>
                      <input
                        type="url"
                        id="applicationUrl"
                        {...register('applicationUrl')}
                        className={`w-full p-2 border ${
                          errors.applicationUrl
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#003E6B]'
                        } rounded-md focus:outline-none focus:ring-2`}
                        placeholder="https://example.com/direct-apply"
                      />
                      {errors.applicationUrl && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.applicationUrl.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Provide the direct application URL if different from the
                        standard application link
                      </p>
                    </div>
                  </motion.div>

                  {/* Deadline */}
                  <div>
                    <label
                      htmlFor="deadline"
                      className="text-sm font-medium text-gray-700 mb-1 flex items-center"
                    >
                      <FaCalendarAlt className="mr-1 text-gray-400" />{' '}
                      Application Deadline *
                    </label>
                    <input
                      id="deadline"
                      type="date"
                      {...register('deadline', { required: true })}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.deadline.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Details Section */}
              <motion.div
                variants={fadeIn}
                className="border-b border-gray-200 pb-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaList className="mr-2 text-[#003E6B]" /> Details
                </h2>

                {/* Description */}
                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    {...register('description', { required: true })}
                    rows={5}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                    placeholder="Enter a detailed description of the internship..."
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <label
                    htmlFor="requirements"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Requirements (comma-separated)
                  </label>
                  <textarea
                    id="requirements"
                    {...register('requirements')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                    placeholder="e.g. Strong analytical skills, Excel proficiency, Finance background"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    Separate requirements with commas
                  </p>
                </div>
              </motion.div>

              {/* School Targets */}
              <motion.div variants={fadeIn}>
                <label
                  htmlFor="schoolTargets"
                  className="text-sm font-medium text-gray-700 mb-1 flex items-center"
                >
                  <FaGraduationCap className="mr-2 text-gray-400" />
                  Target Schools
                </label>
                <input
                  type="text"
                  id="schoolTargets"
                  {...register('schoolTargets')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003E6B]"
                  placeholder="NYU, Columbia University, etc. (comma-separated)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list of target schools for this internship
                </p>
              </motion.div>

              {/* Classification Section */}
              <motion.div
                variants={fadeIn}
                className="border-b border-gray-200 pb-6"
              >
                <h2 className="text-xl font-semibold mb-4">Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Track */}
                  <div>
                    <label
                      htmlFor="track"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Track *
                    </label>
                    <select
                      id="track"
                      {...register('track', { required: true })}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                    >
                      <option value="">Select a track</option>
                      <option value="quant">Quantitative</option>
                      <option value="value">Value</option>
                      <option value="both">Both Tracks</option>
                    </select>
                    {errors.track && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.track.message || 'Track is required'}
                      </p>
                    )}
                  </div>

                  {/* Chapter */}
                  <div>
                    <label
                      htmlFor="chapter"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Chapter *
                    </label>
                    <select
                      id="chapter"
                      {...register('chapter', { required: true })}
                      defaultValue={userChapter}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                    >
                      <option value="">Select a chapter</option>
                      {chapters.map(chapter => (
                        <option key={chapter._id} value={chapter.name}>
                          {chapter.name}
                        </option>
                      ))}
                    </select>
                    {errors.chapter && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.chapter.message || 'Chapter is required'}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Additional Options */}
              <motion.div variants={fadeIn} className="pb-4">
                <h2 className="text-xl font-semibold mb-4">
                  Additional Options
                </h2>
                <div className="flex flex-wrap gap-6">
                  {/* Is Paid */}
                  <div className="flex items-center">
                    <input
                      id="isPaid"
                      type="checkbox"
                      {...register('isPaid')}
                      className="h-4 w-4 text-[#003E6B] focus:ring-[#003E6B] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isPaid"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Paid Internship
                    </label>
                  </div>

                  {/* Is Remote */}
                  <div className="flex items-center">
                    <input
                      id="isRemote"
                      type="checkbox"
                      {...register('isRemote')}
                      className="h-4 w-4 text-[#003E6B] focus:ring-[#003E6B] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isRemote"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remote Work Available
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={fadeIn}
                className="flex justify-end"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  variant="navy-accent"
                  className="px-6"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Internship'
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </SmoothTransition>
    </ProtectedPage>
  );
}
