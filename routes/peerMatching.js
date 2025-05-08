const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/match-peers/:courseCode", async (req, res) => {
    const courseCode = req.params.courseCode.toUpperCase(); // e.g., CS1202
    const studentID = req.query.studentID; // Optional query parameter

    try {
        // Access the dynamic model for the course
        const ScoreModel = mongoose.connection.collection(courseCode);

        // Fetch all score documents in the course
        const allScores = await ScoreModel.find({}).toArray();
        console.log("All scores fetched:", allScores);

        const failingStudents = [];
        const goodStudents = [];

        // Categorize students
        allScores.forEach(student => {
            const weightedScore = (
                (student.Minor1 || 0) * (student["Minor1_Weightage (%)"] || 0) +
                (student.Minor2 || 0) * (student["Minor2_Weightage (%)"] || 0) +
                (student.EndSem || 0) * (student["EndSem_Weightage (%)"] || 0)
            ) / 100;

            console.log(`Student: ${student.StudentName}, Weighted Score: ${weightedScore}`);

            if (weightedScore < 40) {
                failingStudents.push({ ...student, FinalScore: weightedScore });
            } else if (weightedScore >= 75) {
                goodStudents.push({ ...student, FinalScore: weightedScore });
            }
        });

        console.log("Failing students:", failingStudents);
        console.log("Good students:", goodStudents);

        // Handle cases where there are no good students
        if (goodStudents.length === 0) {
            return res.status(400).json({
                message: "No good students available for pairing.",
                totalFailing: failingStudents.length,
                totalGood: goodStudents.length
            });
        }

        // Handle cases where there are no failing students
        if (failingStudents.length === 0) {
            return res.status(400).json({
                message: "No failing students available for pairing.",
                totalFailing: failingStudents.length,
                totalGood: goodStudents.length
            });
        }

        // Filter failing students for the specific studentID if provided
        const filteredFailingStudents = studentID
            ? failingStudents.filter(student => student.StudentID === studentID)
            : failingStudents;

        // Create pairings: each failing student gets matched with 1 or more good students
        const matchedPairs = filteredFailingStudents.map((failingStudent, index) => {
            const helper = goodStudents[index % goodStudents.length];
            return {
                strugglingStudent: {
                    id: failingStudent.StudentID,
                    name: failingStudent.StudentName,
                    finalScore: failingStudent.FinalScore.toFixed(2),
                },
                mentor: {
                    id: helper.StudentID,
                    name: helper.StudentName,
                    finalScore: helper.FinalScore.toFixed(2),
                },
            };
        });

        console.log("Matched pairs:", matchedPairs);

        res.json({
            course: courseCode,
            totalFailing: filteredFailingStudents.length,
            totalGood: goodStudents.length,
            matches: matchedPairs,
        });
    } catch (error) {
        console.error("Peer matching error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;