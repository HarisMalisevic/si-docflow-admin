/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import path from 'path';
import db_init from './database/DB_initialization';
import passport from 'passport';
import configurePassport from './auth/passportConfig';
import session from 'express-session';
import documentTypeRoutes from "./routes/documentType.routes";
import authRoutes from './routes/auth.routes';
import authMiddleware from "./middleware/authMiddleware";

const APP = express();
const PORT = 5000;
APP.use(express.json());


(async () => {
  await db_init();
  configurePassport(passport);
})();

APP.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
}));

APP.use(passport.initialize());
APP.use(passport.session());

// Define the path to the frontend build folder
const FRONTEND_BUILD_PATH = path.join(__dirname, "../../frontend/build");

// Serve React frontend
APP.use(express.static(FRONTEND_BUILD_PATH));

APP.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

APP.use("/auth", authRoutes);

// Example API route
APP.get("/api/message", authMiddleware as any, (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// API Routes
APP.use("/api/document-types", documentTypeRoutes);



APP.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

