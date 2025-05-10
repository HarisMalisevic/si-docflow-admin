import express from "express";
import passport from 'passport';
import configurePassport from './auth/passportConfig';
import session from 'express-session';
import API_ROUTER from "./routes/apiRouter";
import { createServer } from "http";
import { Server } from "socket.io";

const APP = express();
const PORT = 5000;

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

APP.use(express.json());

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