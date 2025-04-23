import mongoose, { Schema, Document } from "mongoose";

export interface IInternship extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  applicationLink: string;
  applicationUrl: string;
  deadline: Date;
  track: "quant" | "value" | "both";
  chapter: string;
  schoolTargets: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPaid: boolean;
  isRemote: boolean;
  isClosed: boolean;
  posterUrl: string | null;
  companyLogoUrl: string | null;
  threadId: string | null;
}

const InternshipSchema = new Schema<IInternship>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    applicationLink: {
      type: String,
      required: [true, "Application link is required"],
    },
    applicationUrl: {
      type: String,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    track: {
      type: String,
      required: [true, "Track is required"],
      enum: ["quant", "value", "both"],
      default: "both",
    },
    chapter: {
      type: String,
      required: [true, "Chapter is required"],
    },
    schoolTargets: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: [true, "Creator ID is required"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    posterUrl: {
      type: String,
      default: null,
    },
    companyLogoUrl: {
      type: String,
      default: null,
    },
    threadId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Check if model exists to prevent overwriting during hot reloads in development
const Internship =
  mongoose.models.Internship ||
  mongoose.model<IInternship>("Internship", InternshipSchema);

export default Internship;
