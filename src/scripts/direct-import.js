// Direct MongoDB import script
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load .env.local file
const envPath = path.resolve(process.cwd(), ".env.local");
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

// MongoDB connection URI
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://ap7564:jpegMafia15@pgi-site.dm5i9fs.mongodb.net/?retryWrites=true&w=majority&appName=pgi-site";

if (!MONGODB_URI) {
  console.error("MongoDB URI is required");
  process.exit(1);
}

// Define the Internship schema directly
const InternshipSchema = new mongoose.Schema(
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

// Create the model
const Internship = mongoose.model("Internship", InternshipSchema);

// Define the new internship data
const internships = [
  {
    _id: new mongoose.Types.ObjectId("6808fcb28af6df767069a229"),
    title: "Quantitative Analyst Intern",
    company: "OptionMetrics",
    location: "New York, NY (Hybrid)",
    description:
      "Internship opportunity for students interested in quantitative analysis.",
    requirements: ["Strong mathematical background", "Programming skills"],
    track: "quant",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://earnbetter.com/jobs/click/01JSG5P4NHNRCTH1MHCDGE9HBG/?utm_source=perplexity",
    applicationLink:
      "https://earnbetter.com/jobs/click/01JSG5P4NHNRCTH1MHCDGE9HBG/?utm_source=perplexity",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb22f874e919f63dcc3"),
    threadId: null,
    chapter: "NYU",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2b417e64e104efae3"),
    title: "Quantitative Trading Internship",
    company: "Optiver",
    location: "Chicago, IL",
    description: "Internship focusing on quantitative trading strategies.",
    requirements: ["Statistics knowledge", "Python or C++ experience"],
    track: "quant",
    schoolTargets: ["University of Chicago"],
    applicationUrl:
      "https://optiver.com/working-at-optiver/career-opportunities/7854592002/",
    applicationLink:
      "https://optiver.com/working-at-optiver/career-opportunities/7854592002/",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2b1218575fdc518aa"),
    threadId: null,
    chapter: "University of Chicago",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb251986380672a5477"),
    title: "Quantitative Analyst Internship",
    company: "Weiss Asset Management",
    location: "Boston, MA",
    description: "Analyst internship at a leading asset management firm.",
    requirements: ["Quantitative background", "Financial modeling experience"],
    track: "quant",
    schoolTargets: [
      "NYU",
      "Brown University",
      "University of Pennsylvania",
      "Yale University",
      "Princeton University",
      "Columbia University",
      "University of Chicago",
      "Cornell University",
    ],
    applicationUrl: "https://lnkd.in/eH9kbAWi",
    applicationLink: "https://lnkd.in/eH9kbAWi",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2bcea56ed82948f1b"),
    threadId: null,
    chapter: "Brown University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb223b03e6e7c3cda06"),
    title: "Quantitative Researcher Intern",
    company: "Tower Research Capital",
    location: "New York, NY",
    description: "Research internship with focus on quantitative analysis.",
    requirements: ["Statistical analysis", "Machine learning experience"],
    track: "quant",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl: "https://openquant.co/?level=Internship",
    applicationLink: "https://openquant.co/?level=Internship",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2a8d863fb8b73729e"),
    threadId: null,
    chapter: "Columbia University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb27bacf3c97ae49a4c"),
    title: "Winter Intern 2026 - Quantitative Trader",
    company: "Five Rings Capital",
    location: "New York, NY",
    description: "Winter internship program for aspiring quantitative traders.",
    requirements: ["Programming skills", "Interest in financial markets"],
    track: "quant",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "http://job-boards.greenhouse.io/fiveringsllc/jobs/4521138008",
    applicationLink:
      "http://job-boards.greenhouse.io/fiveringsllc/jobs/4521138008",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb226ecda9f695297b9"),
    threadId: null,
    chapter: "NYU",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb23d71698a0276d9f9"),
    title: "Summer Associate Internship – Quantitative Research & Trading",
    company: "BNP Paribas",
    location: "New York, NY",
    description:
      "Summer associate program with focus on quantitative research and trading.",
    requirements: ["Quantitative skills", "Financial knowledge"],
    track: "quant",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://earnbetter.com/jobs/click/01JM17CNVH8JXMN8HEVMQDGE7T/?utm_source=perplexity",
    applicationLink:
      "https://earnbetter.com/jobs/click/01JM17CNVH8JXMN8HEVMQDGE7T/?utm_source=perplexity",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2739eab7d95906db9"),
    threadId: null,
    chapter: "Columbia University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2d9a192751235b8ab"),
    title: "Data Science & Analytics Intern",
    company: "NBCUniversal",
    location: "New York, NY",
    description: "Data science internship with focus on analytics.",
    requirements: ["Python", "Data analysis experience"],
    track: "quant",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://earnbetter.com/jobs/click/01JSG7G4M6ZPXJQTSFWZJ6DW82/?utm_source=perplexity",
    applicationLink:
      "https://earnbetter.com/jobs/click/01JSG7G4M6ZPXJQTSFWZJ6DW82/?utm_source=perplexity",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2462eee6873a92a15"),
    threadId: null,
    chapter: "NYU",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2dc841a532ebd2c68"),
    title: "Investment Engineer Intern",
    company: "Bridgewater Associates",
    location: "New York, NY",
    description: "Engineering internship with focus on investment tools.",
    requirements: ["Strong coding skills", "Financial interest"],
    track: "both",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl: "https://openquant.co/?level=Internship",
    applicationLink: "https://openquant.co/?level=Internship",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb20f7b13b4ea626bb1"),
    threadId: null,
    chapter: "Columbia University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2e1f3521eb37e848f"),
    title: "Investment Banking Summer Analyst",
    company: "Oppenheimer & Co.",
    location: "New York, NY",
    description: "Summer analyst program in investment banking.",
    requirements: ["Finance background", "Excel skills"],
    track: "both",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://careerservices.fas.harvard.edu/jobs/oppenheimer-co-2026-investment-banking-summer-internship/",
    applicationLink:
      "https://careerservices.fas.harvard.edu/jobs/oppenheimer-co-2026-investment-banking-summer-internship/",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb24c6d943716a34e5b"),
    threadId: null,
    chapter: "NYU",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2207873321e16b90e"),
    title: "Investment Banking Summer Analyst",
    company: "Guggenheim Securities",
    location: "New York, NY",
    description: "Summer analyst role at Guggenheim Securities.",
    requirements: ["Financial analysis", "Communication skills"],
    track: "both",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    applicationLink:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb26be50af126dee436"),
    threadId: null,
    chapter: "Columbia University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb215474c9b17eabe8a"),
    title: "Investment Banking Summer Analyst",
    company: "Moelis & Company",
    location: "New York, NY",
    description: "Summer analyst program at a leading investment bank.",
    requirements: ["Finance coursework", "Analytical skills"],
    track: "both",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    applicationLink:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb201e8bc221dbb30d0"),
    threadId: null,
    chapter: "NYU",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb21b193557c8e38955"),
    title: "Investment Banking Summer Analyst",
    company: "Nomura",
    location: "New York, NY",
    description: "Summer analyst position at Nomura.",
    requirements: ["Financial knowledge", "Excel proficiency"],
    track: "both",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    applicationLink:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb21066438b51a3ca30"),
    threadId: null,
    chapter: "Columbia University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb252271ec977514b81"),
    title: "Investment Banking Summer Analyst",
    company: "UBS",
    location: "New York, NY",
    description: "Summer analyst program at UBS.",
    requirements: ["Finance major", "Strong academics"],
    track: "both",
    schoolTargets: ["NYU", "Columbia University"],
    applicationUrl:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    applicationLink:
      "https://www.fe.training/free-resources/careers-in-finance/investment-banking-summer-analyst-2026-open-applications/",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2d84a6a411e4cc2e3"),
    threadId: null,
    chapter: "NYU",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb280621d93c5d00d2d"),
    title: "Investment Banking Summer Analyst",
    company: "Wells Fargo",
    location: "Various",
    description: "Summer analyst program across various locations.",
    requirements: ["Finance or related field", "Analytical mindset"],
    track: "both",
    schoolTargets: [
      "NYU",
      "Brown University",
      "University of Pennsylvania",
      "Yale University",
      "Princeton University",
      "Columbia University",
      "University of Chicago",
      "Cornell University",
    ],
    applicationUrl:
      "https://www.indeed.com/q-investment-banking-internship-2026-jobs.html",
    applicationLink:
      "https://www.indeed.com/q-investment-banking-internship-2026-jobs.html",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb200f4a44745da0fa7"),
    threadId: null,
    chapter: "Yale University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2d41a464e2d0153d7"),
    title: "Quantitative Trading Intern",
    company: "Fidelity",
    location: "Chicago, IL",
    description: "Trading internship with quantitative focus.",
    requirements: ["Math/CS background", "Programming experience"],
    track: "quant",
    schoolTargets: ["University of Chicago"],
    applicationUrl: "https://openquant.co/?level=Internship",
    applicationLink: "https://openquant.co/?level=Internship",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2132ff6fbbe3b213b"),
    threadId: null,
    chapter: "University of Chicago",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
  {
    _id: new mongoose.Types.ObjectId("6808fcb2348b4183c9bc59f2"),
    title: "Quantitative Strategist Intern",
    company: "MGIC",
    location: "Wisconsin, US",
    description: "Strategy internship with quantitative focus.",
    requirements: ["Statistical modeling", "Problem-solving skills"],
    track: "quant",
    schoolTargets: [
      "NYU",
      "Brown University",
      "University of Pennsylvania",
      "Yale University",
      "Princeton University",
      "Columbia University",
      "University of Chicago",
      "Cornell University",
    ],
    applicationUrl: "https://openquant.co/?level=Internship",
    applicationLink: "https://openquant.co/?level=Internship",
    deadline: null,
    posterUrl: null,
    companyLogoUrl: null,
    createdBy: new mongoose.Types.ObjectId("6808fcb2a5656fe402242e10"),
    threadId: null,
    chapter: "Cornell University",
    isPaid: true,
    isRemote: false,
    isClosed: false,
  },
];

// Connect to MongoDB
async function importInternships() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing internships
    console.log("Deleting existing internships...");
    await Internship.deleteMany({});
    console.log("Existing internships deleted");

    // Import new internships
    console.log("Importing new internships...");
    await Internship.insertMany(internships);
    console.log(`${internships.length} internships imported successfully`);

    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

// Run the import function
importInternships();
