import cron from 'node-cron';
// connectDB import is no longer needed here as the lib handles its own connection.
// Import the model and the specific fetch function from the lib
import {
  RssItem,
  fetchMarketWatchRSS as fetchMarketWatchRSSFromLib,
} from '@/lib/rss/rssFetcher';
import { Server as SocketIOServer } from 'socket.io';

// Keep a reference to the Socket.IO server for emitting events
let io: SocketIOServer | null = null;

// Set the Socket.IO server reference
export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

// This function now primarily handles the result and socket emission
async function processAndEmitMarketWatchFeed() {
  try {
    console.log('Fetching MarketWatch RSS feed via library function...');
    // Call the library function
    const insertedItems = await fetchMarketWatchRSSFromLib(); // This function in the lib already saves to DB

    if (insertedItems && insertedItems.length > 0) {
      console.log(
        `Server: ${insertedItems.length} new items processed from MarketWatch.`
      );
      if (io) {
        const currentIO = io; // Assign to a new variable within the non-null scope
        insertedItems.forEach(item => {
          currentIO.emit('new-item', item); // Use the new non-null variable
          console.log(`Server: Emitted new-item event for ${item.title}`);
        });
      }
    } else {
      console.log('Server: No new items from MarketWatch to process or emit.');
    }
    return insertedItems;
  } catch (error) {
    console.error('Server: Error in processAndEmitMarketWatchFeed:', error);
    // Do not re-throw, let cron handle its errors if needed
  }
}

// Schedule the RSS fetcher to run every 10 minutes
export const scheduleRssFetcher = () => {
  console.log('Server: Scheduling MarketWatch RSS fetcher (using library)...');

  // Run immediately on startup
  processAndEmitMarketWatchFeed().catch(console.error);

  // Then schedule to run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    processAndEmitMarketWatchFeed().catch(console.error);
  });

  console.log(
    'Server: MarketWatch RSS fetcher scheduled to run every 10 minutes.'
  );
};
