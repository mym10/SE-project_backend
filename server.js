  const express = require("express");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const connectDB = require("./db");

  // Import routes
  const authRoutes = require("./routes/authRoutes");

  const app = express();
  const PORT = 5000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Connect to MongoDB
  connectDB();

  // Use Routes
  app.use("/", authRoutes); 

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
