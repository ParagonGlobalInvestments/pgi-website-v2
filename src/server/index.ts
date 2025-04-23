import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { scheduleRssFetcher, setSocketIO } from "./rssFetcher";

// Initialize Next.js
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with CORS configuration
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Set up Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send welcome message to let client know connection is active
    socket.emit("welcome", {
      message: "Connected to PGI server",
      timestamp: new Date(),
    });

    // Listen for specific client events like subscribing to feeds
    socket.on("subscribe", (channel) => {
      console.log(`Client ${socket.id} subscribed to ${channel}`);
      socket.join(channel);
    });

    socket.on("unsubscribe", (channel) => {
      console.log(`Client ${socket.id} unsubscribed from ${channel}`);
      socket.leave(channel);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Pass Socket.IO server to RSS fetcher
  setSocketIO(io);

  // Start the RSS fetcher scheduler
  scheduleRssFetcher();

  // Start the server
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
