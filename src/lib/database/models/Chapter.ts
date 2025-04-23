import mongoose, { Schema, Document } from "mongoose";

export interface IChapter extends Document {
  name: string;
  slug: string;
  logoUrl: string;
  leaders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    name: {
      type: String,
      required: [true, "Chapter name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Chapter slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    logoUrl: {
      type: String,
      default: "", // Default empty logo URL
    },
    leaders: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "User", // Will reference User model when it's created
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster lookups
ChapterSchema.index({ slug: 1 });

// Check if model exists to prevent overwriting during hot reloads in development
const Chapter =
  mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);

export default Chapter;
