import express from "express";
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import db_init from './database/DB_initialization';
import documentTypeRoutes from "./routes/documentType.routes";

const APP = express();
const PORT = 5000;

APP.use(express.json());

//db_init()

// Define the path to the frontend build folder
const FRONTEND_BUILD_PATH = path.join(__dirname, "../../frontend/build");

// Serve React frontend
APP.use(express.static(FRONTEND_BUILD_PATH));

APP.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

// Example API route
APP.get("/api/message", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// API Routes
APP.use("/api/document-types", documentTypeRoutes);


APP.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

