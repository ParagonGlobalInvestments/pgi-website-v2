import mongoose from 'mongoose';

/**
 * Global mongoose connection state
 * - 0: disconnected
 * - 1: connected
 * - 2: connecting
 * - 3: disconnecting
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

// Initialize global connection cache
global.mongoose = global.mongoose || { conn: null, promise: null };

/**
 * MongoDB connection options
 */
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false,
};

/**
 * Connects to MongoDB database using cached connection when possible
 *
 * This function creates a database connection and caches it globally to avoid
 * creating multiple connections during development with hot reloading.
 *
 * @returns Promise resolving to mongoose instance
 * @throws Error if MONGODB_URI is not defined or if connection fails
 *
 * @example
 * ```typescript
 * // In an API route:
 * export async function GET(req: Request) {
 *   try {
 *     await connectToDatabase();
 *     const users = await User.find();
 *     return Response.json(users);
 *   } catch (error) {
 *     return Response.json({ error: 'Failed to connect to database' }, { status: 500 });
 *   }
 * }
 * ```
 */
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // Use cached connection if available
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // If a connection is being established, wait for it
  if (!global.mongoose.promise) {
    // Create new connection
    global.mongoose.promise = mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
  }

  try {
    // Wait for connection
    global.mongoose.conn = await global.mongoose.promise;

    // Log success on initial connection only
    if (
      mongoose.connection.readyState === 1 &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.log('MongoDB connected successfully');
    }

    return global.mongoose.conn;
  } catch (error) {
    // Reset promise to allow retry
    global.mongoose.promise = null;
    throw error;
  }
}

/**
 * Disconnects from MongoDB database
 * Useful for testing and graceful shutdowns
 *
 * @returns Promise resolving when disconnection is complete
 */
export async function disconnectFromDatabase() {
  if (global.mongoose.conn) {
    await mongoose.disconnect();
    global.mongoose.conn = null;
    global.mongoose.promise = null;
  }
}
