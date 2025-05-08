const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/:courseCode", async (req, res) => {
  const { courseCode } = req.params;

  try {
    const profCollection = mongoose.connection.collection("prof_data");

    const professor = await profCollection.findOne({
      Courses: courseCode  
    });

    if (!professor) {
      return res.status(404).json({ error: "No professor found for this course" });
    }

    res.status(200).json(professor);
  } catch (error) {
    console.error("Error fetching professor:", error);
    res.status(500).json({ error: "Failed to fetch professor data" });
  }
});

// Get professor by professorID
router.get("/by-id/:profID", async (req, res) => {
    const { profID } = req.params;
  
    try {
  
      const profCollection = mongoose.connection.collection("prof_data");
      const professor = await profCollection.findOne({
        professorID: { $regex: `^${profID}$`, $options: "i" } // case-insensitive match
      });
  
      if (!professor) {
        return res.status(404).json({ error: "No professor found with that ID" });
      }
  
      res.status(200).json(professor);
    } catch (error) {
      console.error("Error fetching professor by ID:", error);
      res.status(500).json({ error: "Failed to fetch professor" });
    }
  });
  

module.exports = router;
