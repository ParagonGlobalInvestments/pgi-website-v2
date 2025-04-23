import Parser from "rss-parser";
import cron from "node-cron";
import { connectDB } from "@/lib/database/mongodb";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";

// Define the RSS item schema for MongoDB
const RssItemSchema = new mongoose.Schema({
  source: { type: String, required: true },
  guid: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
  contentSnippet: { type: String },
  categories: [String],
  creator: String,
  isoDate: Date,
  content: String,
  fetchedAt: { type: Date, default: Date.now },
});

// Create a compound index on source and guid for uniqueness
RssItemSchema.index({ source: 1, guid: 1 }, { unique: true });

// Initialize the model (or get it if it already exists)
const RssItem =
  mongoose.models.RssItem || mongoose.model("RssItem", RssItemSchema);

// Configure the RSS parser
const parser = new Parser({
  customFields: {
    item: ["creator", "categories", "content"],
  },
});

// Keep a reference to the Socket.IO server for emitting events
let io: SocketIOServer | null = null;

// Set the Socket.IO server reference
export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

// Fetch and process the RSS feed
export const fetchMarketWatchRSS = async () => {
  try {
    console.log("Fetching MarketWatch RSS feed...");
    const feed = await parser.parseURL(
      "https://www.marketwatch.com/rss/topstories"
    );

    // Connect to MongoDB if not already connected
    await connectDB();

    const insertedItems = [];

    // Process each item in the feed
    for (const item of feed.items) {
      try {
        // Process categories to handle complex objects like those from Seeking Alpha
        let processedCategories = item.categories || [];

        // Handle case where categories is a string (possibly a JSON string)
        if (typeof processedCategories === "string") {
          try {
            // Try to parse it as JSON
            const parsed = JSON.parse(processedCategories);
            if (Array.isArray(parsed)) {
              processedCategories = parsed;
              console.log(
                `Successfully parsed categories string as JSON array: ${processedCategories}`
              );
            } else {
              // If it's not an array after parsing, make it a single-item array
              processedCategories = [processedCategories];
            }
          } catch (e) {
            // If it can't be parsed as JSON, treat it as a single category string
            console.log(
              `Could not parse categories as JSON, using as string: ${processedCategories}`
            );
            processedCategories = [processedCategories];
          }
        }

        // Check if categories contains complex objects (like from Seeking Alpha)
        if (
          processedCategories.length > 0 &&
          typeof processedCategories[0] === "string"
        ) {
          // If it's already a string array, use as is
          processedCategories = processedCategories;
        } else if (processedCategories.length > 0) {
          try {
            // Log the original categories for debugging
            console.log(
              `Processing complex categories for item "${item.title}" from marketwatch-top:`,
              typeof processedCategories === "string"
                ? processedCategories
                : JSON.stringify(processedCategories, null, 2)
            );

            // For complex objects, try to extract the category name from the "_" property
            processedCategories = processedCategories.map((cat: any) => {
              if (typeof cat === "object" && cat !== null) {
                // If it's a complex object with "_" property, use that
                return cat._ || JSON.stringify(cat);
              }
              return String(cat); // Convert any other type to string
            });

            console.log(`Processed categories result:`, processedCategories);
          } catch (e) {
            console.warn(
              `Error processing categories for item "${item.title}":`,
              e
            );
            processedCategories = []; // Reset to empty array if there's an error
          }
        }

        // Prepare the item data
        const rssItem = {
          source: "marketwatch-top",
          guid: item.guid || item.link,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          contentSnippet: item.contentSnippet,
          categories: processedCategories,
          creator: item.creator,
          isoDate: item.isoDate ? new Date(item.isoDate) : undefined,
          content: item.content,
          fetchedAt: new Date(),
        };

        // Use findOneAndUpdate with upsert to avoid duplicates
        const result = await RssItem.findOneAndUpdate(
          { source: rssItem.source, guid: rssItem.guid },
          rssItem,
          { upsert: true, new: true }
        );

        // Check if this was a new insertion (not an update)
        if (
          result &&
          result.fetchedAt?.getTime() === rssItem.fetchedAt.getTime()
        ) {
          insertedItems.push(result);
          console.log(`New RSS item added: ${result.title}`);

          // Emit socket event for new items if Socket.IO is configured
          if (io) {
            io.emit("new-item", result);
          }
        }
      } catch (itemError) {
        console.error("Error processing RSS item:", itemError);
      }
    }

    console.log(
      `MarketWatch RSS fetch complete. Added ${insertedItems.length} new items.`
    );
    return insertedItems;
  } catch (error) {
    console.error("Error fetching MarketWatch RSS:", error);
    throw error;
  }
};

// Schedule the RSS fetcher to run every 10 minutes
export const scheduleRssFetcher = () => {
  console.log("Scheduling MarketWatch RSS fetcher...");

  // Run immediately on startup
  fetchMarketWatchRSS().catch(console.error);

  // Then schedule to run every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    fetchMarketWatchRSS().catch(console.error);
  });

  console.log("MarketWatch RSS fetcher scheduled to run every 10 minutes");
};
