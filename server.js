
  const express = require("express");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const connectDB = require("./db");

  // Import routes
  const authRoutes = require("./routes/authRoutes");
  const semesterRoutes = require("./routes/semesterRoutes");
  const studentRoutes = require("./routes/studentRoutes");
  const subjectRoutes = require("./routes/subjectRoutes");
  const professorRoutes = require("./routes/professorRoutes");


  const app = express();
  const PORT = 5000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Connect to MongoDB
  connectDB();

  // Use Routes
  app.use("/gpa-distribution", semesterRoutes);
  app.use("/professors", professorRoutes); 
  app.use("/", authRoutes); 
  app.use("/", studentRoutes);
  app.use("/", semesterRoutes);
  app.use("/", subjectRoutes);


  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
