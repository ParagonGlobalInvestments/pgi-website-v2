#!/usr/bin/env ts-node
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models
import Internship from "../lib/database/models/Internship";
import Chapter from "../lib/database/models/Chapter";

// Demo chapters data
const demoChapters = [
  {
    name: "Princeton University",
    slug: "princeton",
    logoUrl: "/logos/princeton.png",
  },
  {
    name: "Brown University",
    slug: "brown",
    logoUrl: "/logos/brown.png",
  },
  {
    name: "Columbia University",
    slug: "columbia",
    logoUrl: "/logos/columbia.png",
  },
  {
    name: "Yale University",
    slug: "yale",
    logoUrl: "/logos/yale.png",
  },
  {
    name: "University of Pennsylvania",
    slug: "upenn",
    logoUrl: "/logos/upenn.png",
  },
  {
    name: "New York University",
    slug: "nyu",
    logoUrl: "/logos/nyu.png",
  },
  {
    name: "University of Chicago",
    slug: "uchicago",
    logoUrl: "/logos/uchicago.png",
  },
  {
    name: "Cornell University",
    slug: "cornell",
    logoUrl: "/logos/cornell.png",
  },
];

// Demo internships data - Update chapter references to use the new chapter names
const demoInternships = [
  {
    title: "Summer Quantitative Trading Intern",
    company: "Citadel Securities",
    location: "New York, NY",
    description:
      "Join our quantitative trading team for a summer internship focused on developing and implementing trading strategies.",
    requirements: [
      "Strong programming skills in Python/C++",
      "Solid mathematics and statistics background",
      "Experience with financial markets preferred",
      "Currently pursuing BS/MS/PhD in Computer Science, Mathematics, or related field",
    ],
    applicationLink: "https://example.com/citadel-application",
    deadline: new Date("2024-12-31"),
    track: "quant",
    chapter: "New York University",
    createdBy: "clerk_user_id_1",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    title: "Investment Banking Summer Analyst",
    company: "Goldman Sachs",
    location: "New York, NY",
    description:
      "Summer analyst position in our Investment Banking Division, focusing on M&A and corporate finance.",
    requirements: [
      "Strong analytical and financial modeling skills",
      "Excellent Excel and PowerPoint skills",
      "Understanding of financial markets",
      "Currently pursuing Bachelor's degree in Finance, Economics, or related field",
    ],
    applicationLink: "https://example.com/goldman-application",
    deadline: new Date("2024-11-30"),
    track: "value",
    chapter: "Columbia University",
    createdBy: "clerk_user_id_2",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    title: "Private Equity Summer Associate",
    company: "Blackstone",
    location: "New York, NY",
    description:
      "Summer associate role working on deal execution and portfolio company monitoring.",
    requirements: [
      "Previous investment banking or consulting experience",
      "Strong financial modeling skills",
      "Excellent communication abilities",
      "MBA candidate or equivalent experience",
    ],
    applicationLink: "https://example.com/blackstone-application",
    deadline: new Date("2024-10-15"),
    track: "value",
    chapter: "Yale University",
    createdBy: "clerk_user_id_3",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    title: "Data Science & Trading Intern",
    company: "Two Sigma",
    location: "Remote",
    description:
      "Hybrid role combining data science and quantitative trading strategies.",
    requirements: [
      "Strong Python and SQL skills",
      "Experience with machine learning frameworks",
      "Understanding of statistical analysis",
      "Currently pursuing advanced degree in Computer Science, Statistics, or related field",
    ],
    applicationLink: "https://example.com/twosigma-application",
    deadline: new Date("2024-11-01"),
    track: "both",
    chapter: "Cornell University",
    createdBy: "clerk_user_id_4",
    isPaid: true,
    isRemote: true,
    isClosed: false,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in .env.local");
    }

    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");

    // Clear existing data
    await Chapter.deleteMany({});
    console.log("Cleared existing chapters");

    await Internship.deleteMany({});
    console.log("Cleared existing internships");

    // Insert demo chapters
    const insertedChapters = await Chapter.insertMany(demoChapters);
    console.log(`Successfully seeded ${insertedChapters.length} chapters`);

    // Insert demo internships
    const insertedInternships = await Internship.insertMany(demoInternships);
    console.log(
      `Successfully seeded ${insertedInternships.length} internships`
    );

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
