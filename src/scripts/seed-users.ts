#!/usr/bin/env ts-node
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models
import User from "../lib/database/models/User";
import Chapter from "../lib/database/models/Chapter";

// Define types for team members
interface TeamMember {
  name: string;
  university: string;
  linkedin?: string;
}

// Quant team members
const quantResearchCommittee: TeamMember[] = [
  { name: "Soupy De", university: "University of Chicago" },
  { name: "William Vietor", university: "Columbia University" },
  { name: "Samuel Henriques", university: "Princeton University" },
  { name: "Ronak Datta", university: "University of Chicago" },
  { name: "Anirudh Pottammal", university: "New York University" },
  { name: "Sahishnu Hanumolu", university: "University of Pennsylvania" },
  { name: "Dominic Olaguera-Delogu", university: "University of Pennsylvania" },
  { name: "Matthew Neissen", university: "Yale University" },
  { name: "Daniel Siegel", university: "Yale University" },
  { name: "Ethan Chang", university: "Columbia University" },
];

const quantAnalysts: TeamMember[] = [
  { name: "Aakshay Gupta", university: "Cornell University" },
  { name: "Andrew Da", university: "Cornell University" },
  { name: "Ann Li", university: "New York University" },
  { name: "Anthony Wong", university: "Cornell University" },
  { name: "Atishay Narayanan", university: "Princeton University" },
  { name: "Aurora Wang", university: "Columbia University" },
  { name: "Benjamin Weber", university: "Princeton University" },
  { name: "Benjamin Zhou", university: "Princeton University" },
  { name: "Brianna Wang", university: "Columbia University" },
  { name: "Connor Brown", university: "Princeton University" },
  { name: "Edward Stan", university: "Columbia University" },
  { name: "Joonseok Jung", university: "Cornell University" },
  { name: "Kayla Shan", university: "Cornell University" },
  { name: "Linglong Dai", university: "Cornell University" },
  { name: "Meghana Kesanapalli", university: "Cornell University" },
  { name: "Mikul Saravanan", university: "Columbia University" },
  { name: "Rohan Sabu", university: "New York University" },
  { name: "Siddharth Shastry", university: "University of Chicago" },
  { name: "Srirag Tavarti", university: "Columbia University" },
  { name: "Robert Liu", university: "University of Chicago" },
  { name: "Flynn Kelleher", university: "Cornell University" },
  { name: "Anupam Bhakta", university: "Columbia University" },
  { name: "Kaiji Uno", university: "Columbia University" },
  { name: "Lucas Tucker", university: "University of Chicago" },
  { name: "Sohini Banerjee", university: "University of Chicago" },
  { name: "Pranav Mishra", university: "Cornell University" },
  { name: "Helen Ho", university: "New York University" },
  { name: "Ece Tumer", university: "University of Chicago" },
  { name: "Aman Dhillon", university: "University of Chicago" },
  { name: "Nico Roth", university: "University of Chicago" },
  { name: "Nikhil Reddy", university: "University of Chicago" },
  { name: "Anthony Luo", university: "University of Chicago" },
  { name: "Farrell Wenardy", university: "University of Chicago" },
  { name: "William Li", university: "University of Chicago" },
  { name: "Kabir Buch", university: "University of Chicago" },
  { name: "Ishaan Sareen", university: "University of Chicago" },
  { name: "Koren Gila", university: "University of Chicago" },
  { name: "Yoyo Zhang", university: "University of Chicago" },
  { name: "Lars Barth", university: "University of Chicago" },
  { name: "Benjamin Levi", university: "University of Chicago" },
  { name: "Arav Saksena", university: "University of Chicago" },
];

// Value team members
const investmentCommittee: TeamMember[] = [
  { name: "Philip Bardon", university: "Columbia University" },
  { name: "Jayanth Mammen", university: "University of Pennsylvania" },
  { name: "Clara Ee", university: "University of Chicago" },
  { name: "John Otto", university: "University of Pennsylvania" },
  { name: "Eli Soffer", university: "Princeton University" },
  { name: "Ashish Pothireddy", university: "University of Pennsylvania" },
  { name: "Sean Oh", university: "University of Pennsylvania" },
  { name: "Myles Spiess", university: "University of Chicago" },
  { name: "Matthew Weng", university: "Columbia University" },
  { name: "Jason Ciptonugroho", university: "Princeton University" },
  { name: "Stoyan Angelov", university: "New York University" },
  { name: "John Yi", university: "New York University" },
];

const portfolioManagers: TeamMember[] = [
  { name: "Philip Weaver", university: "Columbia University" },
  { name: "Aryaman Rakhecha", university: "Columbia University" },
  { name: "Matthew Geiling", university: "University of Chicago" },
  { name: "Benson Wang", university: "Columbia University" },
  { name: "Joshua Donovan", university: "Yale University" },
  { name: "Jack Stemerman", university: "Yale University" },
  { name: "Aetant Prakash", university: "University of Chicago" },
];

const valueAnalysts: TeamMember[] = [
  { name: "Risha Bhat", university: "University of Pennsylvania" },
  { name: "Aparna Vagvala", university: "New York University" },
  { name: "Braden Queen", university: "University of Chicago" },
  { name: "Justin Burks", university: "Columbia University" },
  { name: "Siena Verprauskus", university: "University of Chicago" },
  { name: "Aurian Azghandi", university: "University of Chicago" },
  { name: "Nicolas Tchkotoua", university: "University of Chicago" },
  { name: "Noor Kaur", university: "University of Chicago" },
  { name: "Tommy Soltanian", university: "Columbia University" },
  { name: "Nana Agyeman", university: "Princeton University" },
  { name: "Daniel Kim", university: "Princeton University" },
  { name: "Seoyun Kang", university: "Princeton University" },
  { name: "Bill Zhang", university: "Columbia University" },
  { name: "Sarang Kothari", university: "University of Chicago" },
  { name: "Julian Sweet", university: "University of Chicago" },
  { name: "Oliver Treen", university: "University of Chicago" },
  { name: "Marcella Rogerson", university: "University of Chicago" },
  { name: "Lucas Lu", university: "Cornell University" },
  { name: "Kartik Arora", university: "New York University" },
  { name: "Joshua Lou", university: "University of Chicago" },
  { name: "Andrew Chen", university: "Columbia University" },
  { name: "Max Ting", university: "University of Chicago" },
  { name: "Ivan Mikhaylov", university: "University of Chicago" },
  { name: "Riley Gilsenan", university: "University of Chicago" },
  { name: "Finnur Christianson", university: "Brown University" },
  { name: "Samuel Hwang", university: "University of Chicago" },
  { name: "David Chen", university: "Columbia University" },
  { name: "Nicholas Simon", university: "Columbia University" },
  { name: "Jessica Wang", university: "Columbia University" },
  { name: "Dylan Berretta", university: "Princeton University" },
  { name: "Robert Zhang", university: "University of Chicago" },
  { name: "Raghav Mohindra", university: "University of Chicago" },
];

// Map university names to their short names as used in the chapters collection
const universityToSlugMap: Record<string, string> = {
  "Princeton University": "princeton",
  "Brown University": "brown",
  "Columbia University": "columbia",
  "Yale University": "yale",
  "University of Pennsylvania": "upenn",
  "New York University": "nyu",
  "University of Chicago": "uchicago",
  "Cornell University": "cornell",
};

// Default skills by role and track
type Role = "lead" | "member";
type Track = "quant" | "value";

const defaultSkills: Record<Track, Record<Role, string[]>> = {
  quant: {
    lead: [
      "Quantitative Analysis",
      "Algorithm Development",
      "Statistical Modeling",
      "Python",
      "Data Science",
    ],
    member: ["Data Analysis", "Mathematics", "Statistics", "Programming"],
  },
  value: {
    lead: [
      "Financial Modeling",
      "Valuation",
      "Investment Analysis",
      "Due Diligence",
      "Market Research",
    ],
    member: ["Financial Analysis", "Research", "Excel", "Company Analysis"],
  },
};

// Utility function to generate a default email
function generateEmail(name: string, university: string): string {
  // Extract first name and last name
  const nameParts = name.split(" ");
  const firstName = nameParts[0].toLowerCase();
  const lastName =
    nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";

  // Generate university domain based on university name
  let domain = "";
  if (university === "Princeton University") domain = "princeton.edu";
  else if (university === "Brown University") domain = "brown.edu";
  else if (university === "Columbia University") domain = "columbia.edu";
  else if (university === "Yale University") domain = "yale.edu";
  else if (university === "University of Pennsylvania") domain = "upenn.edu";
  else if (university === "New York University") domain = "nyu.edu";
  else if (university === "University of Chicago") domain = "uchicago.edu";
  else if (university === "Cornell University") domain = "cornell.edu";
  else domain = "example.com";

  return `${firstName}.${lastName}@${domain}`;
}

// Generate a placeholder bio based on role and track
function generateBio(
  name: string,
  role: Role,
  track: Track,
  university: string
): string {
  const roleTitle =
    role === "lead"
      ? track === "quant"
        ? "Quantitative Research Committee Member"
        : track === "value"
        ? name.includes("Manager")
          ? "Portfolio Manager"
          : "Investment Committee Member"
        : "Committee Member"
      : "Analyst";

  return `${name} is a ${roleTitle} at Paragon Global Investments, studying at ${university}. ${
    track === "quant"
      ? "Their focus is on algorithmic trading strategies and data-driven investment approaches."
      : "Their focus is on fundamental analysis and long-term investment strategies."
  }`;
}

async function seedUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not defined in .env.local");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully");

    // Get all chapters from database
    const chapters = await Chapter.find({});
    const chapterMap: Record<string, mongoose.Types.ObjectId> = {};

    // Create a mapping of university names to chapter IDs
    chapters.forEach((chapter) => {
      chapterMap[chapter.name] = chapter._id;

      // Also map by slug
      if (chapter.slug) {
        const universityName = Object.keys(universityToSlugMap).find(
          (key) => universityToSlugMap[key] === chapter.slug
        );
        if (universityName) {
          chapterMap[universityName] = chapter._id;
        }
      }
    });

    console.log("Chapter mapping:", chapterMap);

    // Function to create user documents
    const createUsers = async (
      members: TeamMember[],
      role: Role,
      track: Track,
      isManager = false
    ) => {
      const users = [];

      for (const member of members) {
        // Find the chapter ID for this university
        const chapterId = chapterMap[member.university];

        if (!chapterId) {
          console.warn(`No chapter found for university: ${member.university}`);
          continue;
        }

        // Generate an email based on name
        const email = generateEmail(member.name, member.university);

        // Skip creating user if email matches existing admin
        if (email === 'ap7564@nyu.edu') {
          console.log(`Skipping creation of user with email ${email}`);
          continue;
        }

        // Create a placeholder clerkId (will be updated when real user signs up)
        const placeholderClerkId = `placeholder_${new mongoose.Types.ObjectId().toString()}`;

        // Generate default skills based on role and track
        const skills = defaultSkills[track][role] || [];

        // Generate a placeholder bio
        const bio = generateBio(member.name, role, track, member.university);

        // Determine graduation year (random between current year and current year + 4)
        const currentYear = new Date().getFullYear();
        const gradYear = currentYear + Math.floor(Math.random() * 5);

        users.push({
          name: member.name,
          email,
          chapterId,
          role,
          track,
          isManager,
          isAlumni: false,
          gradYear,
          skills,
          bio,
          linkedin: member.linkedin || "",
          resumeUrl: "",
          avatarUrl: "",
          clerkId: placeholderClerkId,
        });
      }

      if (users.length > 0) {
        // Create the users in bulk
        return await User.insertMany(users);
      }
      return [];
    };

    // Confirm before deleting existing users
    console.log(
      "WARNING: This will delete all existing users in the database."
    );
    console.log("Press Ctrl+C now to cancel if you do not want to proceed.");

    // Wait 5 seconds to allow for cancellation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create users for each group
    console.log("Creating Quantitative Research Committee members...");
    const researchCommitteeUsers = await createUsers(
      quantResearchCommittee,
      "lead",
      "quant",
      true
    );
    console.log(
      `Created ${researchCommitteeUsers.length} Quant Research Committee members`
    );

    console.log("Creating Quant Analysts...");
    const quantAnalystsUsers = await createUsers(
      quantAnalysts,
      "member",
      "quant",
      false
    );
    console.log(`Created ${quantAnalystsUsers.length} Quant Analysts`);

    console.log("Creating Investment Committee members...");
    const investmentCommitteeUsers = await createUsers(
      investmentCommittee,
      "lead",
      "value",
      true
    );
    console.log(
      `Created ${investmentCommitteeUsers.length} Investment Committee members`
    );

    console.log("Creating Portfolio Managers...");
    const portfolioManagersUsers = await createUsers(
      portfolioManagers,
      "lead",
      "value",
      true
    );
    console.log(`Created ${portfolioManagersUsers.length} Portfolio Managers`);

    console.log("Creating Value Analysts...");
    const valueAnalystsUsers = await createUsers(
      valueAnalysts,
      "member",
      "value",
      false
    );
    console.log(`Created ${valueAnalystsUsers.length} Value Analysts`);

    // Log success
    const totalUsers =
      researchCommitteeUsers.length +
      quantAnalystsUsers.length +
      investmentCommitteeUsers.length +
      portfolioManagersUsers.length +
      valueAnalystsUsers.length;

    console.log(`Successfully created ${totalUsers} users`);

    // Close connection
    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
