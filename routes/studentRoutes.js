const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// your list of collections
const collections = ["CS1101", "CS1102", "CS1103", "CS1201","CS1202", "CS1203", "CS2101", "CS2103", "CS2202", "CS2203", "CS3101", "CS3102", "CS3201", "CS3202", "CS3203", "CS3214", "HS1202", "HS2102", "MA1101", "MA2201", ];

// Helper to determine semester from course code
const getSemester = (code) => {
    if (/^..11../.test(code)) return "Sem1";
    if (/^..12../.test(code)) return "Sem2";
    if (/^..21../.test(code)) return "Sem3";
    if (/^..22../.test(code)) return "Sem4";
    if (/^..31../.test(code)) return "Sem5";
    if (/^..32../.test(code)) return "Sem6";
    if (/^..41../.test(code)) return "Sem7";
    if (/^..42../.test(code)) return "Sem8";
    return "Unknown";
  };

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  let semesterData = {};

  try {
    for (const collName of collections) {
      const model = mongoose.connection.collection(collName);
      const result = await model.findOne({ StudentID: username });

      if (result) {
        const semester = getSemester(collName);
        if (!semesterData[semester]) semesterData[semester] = [];
        semesterData[semester].push({ ...result, courseCode: collName });
      }
    }
    

    res.status(200).json(semesterData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});

module.exports = router;
