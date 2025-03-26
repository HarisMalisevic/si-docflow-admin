require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve React frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Example API route
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
