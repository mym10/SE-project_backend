const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// List of known course collections
const collections = ["CS1101", "CS1102", "CS1103", "CS1201","CS1202", "CS1203", "CS2101", "CS2103", "CS2202", "CS2203", "CS3101", "CS3102", "CS3201", "CS3202", "CS3203", "CS3214", "HS1202", "HS2102", "MA1101", "MA2201", ];

// Helper: Get semester from course code
const getSemesterFromCode = (code) => {
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

// STATIC ROUTE FIRST: GPA Distribution (avoids being overridden)
router.get("/gpa-distribution/:semNumber", async (req, res) => {
  const { semNumber } = req.params;

  const allCollections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = allCollections.map(c => c.name);

  // Filter only those belonging to current semester
  const targetCollections = collectionNames.filter(name => getSemesterFromCode(name) === `Sem${semNumber}`);

  const distribution = {
    '0.0-1.0': 0,
    '1.1-2.0': 0,
    '2.1-3.0': 0,
    '3.1-4.0': 0,
    '4.1-5.0': 0,
    '5.1-6.0': 0,
    '6.1-7.0': 0,
    '7.1-8.0': 0,
    '8.1-9.0': 0,
    '9.1-10.0': 0,
  };

  const allGPAs = {};

  for (const collName of targetCollections) {
    const coll = mongoose.connection.collection(collName);
    const students = await coll.find().toArray();

    for (const student of students) {
      const id = student.StudentID;
      const total = (
        student.Minor1 * student["Minor1_Weightage (%)"] +
        student.Minor2 * student["Minor2_Weightage (%)"] +
        student.EndSem * student["EndSem_Weightage (%)"]
      ) / 100;

      let gradePoint = 0;
      if (total >= 90) gradePoint = 10;
      else if (total >= 80) gradePoint = 9;
      else if (total >= 70) gradePoint = 8;
      else if (total >= 60) gradePoint = 7;
      else if (total >= 50) gradePoint = 6;
      else if (total >= 40) gradePoint = 5;
      else gradePoint = 0;

      if (!allGPAs[id]) allGPAs[id] = [];
      allGPAs[id].push({ gradePoint, credit: student.credit || 3 });
    }
  }

  for (const id in allGPAs) {
    const entries = allGPAs[id];
    const totalCredits = entries.reduce((acc, e) => acc + e.credit, 0);
    const totalWeighted = entries.reduce((acc, e) => acc + e.credit * e.gradePoint, 0);
    const gpa = totalCredits ? totalWeighted / totalCredits : 0;

    const bucket = Object.keys(distribution).find(range => {
      const [low, high] = range.split('-').map(Number);
      return gpa >= low && gpa <= high;
    });

    if (bucket) distribution[bucket]++;
  }
  res.json(Object.entries(distribution).map(([range, students]) => ({ range, students })));
});

// DYNAMIC ROUTE AFTER
router.get("/:username/:semNumber", async (req, res) => {
  const { username, semNumber } = req.params;
  const targetSemester = `Sem${semNumber}`;
  const semesterData = {};

  for (const collName of collections) {
    try {
      const model = mongoose.connection.collection(collName);
      const student = await model.findOne({ StudentID: username });

      if (student) {
        const semester = getSemesterFromCode(collName);
        if (!semesterData[semester]) semesterData[semester] = [];
        semesterData[semester].push({ ...student, courseCode: collName });
      }
    } catch (err) {
      console.error(`Error reading from ${collName}:`, err.message);
    }
  }

  const filteredSemesterData = {};
  if (semesterData[targetSemester]) {
    filteredSemesterData[targetSemester] = semesterData[targetSemester];
  }

  res.json(filteredSemesterData);
});

module.exports = router;
