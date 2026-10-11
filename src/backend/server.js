const path = require("path");
const fs = require("fs");
// Load environment variables from backend or root .env
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const awardRoutes = require("./routes/awardRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const loanRoutes = require("./routes/loanRoutes");
const { seedDatabase } = require("./seed");

const app = express();

// CORS configuration supporting local dev and deployed frontends (Vercel, Netlify, Render, Railway, etc.)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin static requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_ALL_ORIGINS === "true" ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".railway.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/awards", awardRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/loans", loanRoutes);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    dbState: mongoose.connection.readyState === 1 ? "connected" : "connecting/disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ScholarshipConnect AI backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static build if available (All-in-one deployment)
const distPath = path.resolve(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Client-side routing fallback: send index.html for non-API routes
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
} else {
  // If dist is not built (e.g. standalone API service), provide root health response
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "ScholarshipConnect AI backend is running and connected to MongoDB",
      timestamp: new Date().toISOString(),
    });
  });
}

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://sinchanas_db_user:Kotari1806@cluster0.tngt184.mongodb.net/scholarshipconnect?appName=Cluster0";

// Start HTTP server immediately so cloud platforms can verify port binding
const server = app.listen(PORT, () => {
  console.log(`🚀 ScholarshipConnect AI server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn("⚠️ Database seed warning:", seedErr.message);
    }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });