import express from 'express';
import path from 'path';

const APP = express();
const PORT = 5000;

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
APP.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});