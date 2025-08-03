const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import middleware
const { generalRateLimit } = require("./middleware/rateLimiter");
const { errorHandler } = require("./src/utils/errorUtils"); // Import error handler

// CORS configuration
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, curl, etc.)
//     if (!origin) return callback(null, true);

//     // Allow localhost and Codespaces URLs
//     const allowed = [
//       "http://localhost",
//       "http://localhost:80",
//       "http://localhost:3000",
//       "http://localhost:5000",
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:4173",
//       process.env.FRONTEND_URL,
//     ].filter(Boolean);

//     // Allow *.app.github.dev for Codespaces
//     const githubDevRegex = /^https:\/\/.*\.app\.github\.dev$/;

//     if (allowed.includes(origin) || githubDevRegex.test(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS: " + origin));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// };

// Middleware
// app.use(cors(corsOptions)); Not using the CORS as we are not serving the backend publically we are just exposing port inside the nginx. So only nginx can make requests to this port
app.use(express.json());
app.use(generalRateLimit);

// Enhanced MongoDB connection with explicit database name
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI?.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
    );

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "devinsight",
    });

    if (conn.connection) {
      console.log(`✅ MongoDB connected successfully!`);
      console.log(`📊 Database: ${conn.connection.db.databaseName}`);
      console.log(`🌐 Host: ${conn.connection.host}`);
    } else {
      console.log("⚠️  Connected, but connection object is missing details.");
    }

    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Server will continue without database functionality");
    return false;
  }
};

// Connect to database
// connectDB();

// Routes
app.use("/api/analyze", require("./routes/analyze"));
app.use("/api/projects", require("./routes/projects"));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "DevInsight API is running!",
    version: "2.0.0",
    features: [
      "repository-analysis",
      "github-integration",
      "comprehensive-scoring",
    ],
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
connectDB()
  .then((connected) => {
    if (!connected) {
      console.warn("⚠️  Starting server without database connection.");
    }
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  });
