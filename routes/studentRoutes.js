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

// Dynamic student profile route
router.get("/:username/studentProfile", async (req, res) => {
  const { username } = req.params;

  try {
    const studentCollection = mongoose.connection.collection("student_users"); // adjust name if needed
    const student = await studentCollection.findOne({ Username: username });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json(student);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ error: "Failed to fetch student profile" });
  }
});

//calculate gpa of the student
router.get("/:username/gpa", async (req, res) => {
  const { username } = req.params;

  let totalWeightedScore = 0;
  let totalCredits = 0;

  try {
    for (const course of collections) {
      const model = mongoose.connection.collection(course);
      const student = await model.findOne({ StudentID: username });

      if (student) {
        const minor1 = student.Minor1 ?? 0;
        const minor2 = student.Minor2 ?? 0;
        const endsem = student.EndSem ?? 0;

        const w1 = student["Minor1_Weightage (%)"] ?? 0;
        const w2 = student["Minor2_Weightage (%)"] ?? 0;
        const w3 = student["EndSem_Weightage (%)"] ?? 0;

        const credit = student.Credits ?? 3; // default to 3 credits if missing

        const totalPercentage = (minor1 * w1 + minor2 * w2 + endsem * w3) / 100;
        const courseGPA = totalPercentage / 10;


        totalWeightedScore += courseGPA * credit;
        totalCredits += credit;
      }
    }

    const gpa = totalCredits ? (totalWeightedScore / totalCredits).toFixed(2) : 0;

    res.status(200).json({ gpa: gpa || "0.00" });
  } catch (error) {
    console.error("GPA calculation failed:", error);
    res.status(500).json({ error: "Failed to calculate GPA" });
  }
});




module.exports = router;
