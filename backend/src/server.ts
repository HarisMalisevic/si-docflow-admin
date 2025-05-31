import express from "express";
import passport from 'passport';
import configurePassport from './auth/passportConfig';
import session from 'express-session';
import API_ROUTER from './router';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

// Set the default port for the server
const DEFAULT_PORT = 5000;

const APP = express();
APP.use(express.json());

// Get the port from environment variables or use the default port
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

// Create the HTTP server using Express
const httpServer = createServer(APP);

// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allows any domain to connect 
    methods: ["GET", "POST"], // The allowed HTTP methods for WebSocket connections
  }
});

// Define namespaces
export const processingNamespace = io.of("/processing");
export const logsNamespace = io.of("/logs");

processingNamespace.on("connection", (socket: Socket) => {
  console.log(`New socket connected: ${socket.id}`);

  // Send the socket ID back to the client, they will send this with the processing command
  socket.emit("connected", socket.id);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

logsNamespace.on("connection", (socket: Socket) => {
  console.log(`New socket connected to /logs: ${socket.id}`);
  socket.emit("connected_logs");
  socket.on("disconnect", () => {
    console.log(`Socket disconnected from /logs: ${socket.id}`);
  });
});


try {
  configurePassport(passport);
} catch (error) {
  console.error("Error configuring passport: Run 'npm run seed' in ./backend to fill sso_providers table", error);
}

APP.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
}));

APP.use(passport.initialize());
APP.use(passport.session());

APP.use("/", API_ROUTER);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});