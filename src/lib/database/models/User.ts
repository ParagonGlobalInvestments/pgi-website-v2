import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  chapterId: mongoose.Types.ObjectId;
  role: "admin" | "lead" | "member";
  track: "quant" | "value" | "both";
  isManager: boolean;
  isAlumni: boolean;
  gradYear: number;
  skills: string[];
  bio?: string;
  projects?: mongoose.Types.ObjectId[];
  linkedin?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "lead", "member"],
      default: "member",
      required: true,
    },
    track: {
      type: String,
      enum: ["quant", "value", "both"],
      required: true,
    },
    isManager: {
      type: Boolean,
      default: false,
    },
    isAlumni: {
      type: Boolean,
      default: false,
    },
    gradYear: {
      type: Number,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    bio: {
      type: String,
    },
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    linkedin: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ clerkId: 1 });
UserSchema.index({ chapterId: 1 });

export default mongoose.models.User ||
  mongoose.model<UserDocument>("User", UserSchema);
