import express from "express";
import path from 'path';
import db_init from './database/DB_initialization';
import passport from 'passport';
import configurePassport from './auth/passportConfig';
import session from 'express-session';
import documentTypeRoutes from "./routes/documentType.routes";
import authRoutes from './routes/auth.routes';
import AuthMiddleware from "./middleware/AuthMiddleware";

const APP = express();
const PORT = 5000;
APP.use(express.json());


(async () => {
  //await db_init(); SKLONITI KOMENTAR KADA PRVI PUT INICIJALIZIRAS BAZU ili kad ti treba restrart stanja
  configurePassport(passport); // Zakomentarisi ovu linijiu kada prvi put inicijaliziras bazu
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
APP.get("/api/message", AuthMiddleware.isLoggedIn, AuthMiddleware.isSuperAdmin, (req, res) => {
  const cookies = req.headers.cookie;
  const jwtCookie = cookies?.split("; ").find(cookie => cookie.startsWith("jwt="))?.split("=")[1];
  console.log("Extracted JWT:", jwtCookie);

  res.json({ message: "Hello from backend!" });
});

// API Routes
APP.use("/api/document-types", documentTypeRoutes);

APP.get("/api/auth/status", AuthMiddleware.isLoggedIn, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

// Serve React frontend for any unknown routes
APP.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

APP.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

