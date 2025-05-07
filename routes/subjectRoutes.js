const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Route to fetch subject and student data
router.get('/:studentID/:semNumber/:subjectCode', async (req, res) => {
    const { studentID, subjectCode } = req.params;

    try {
        // Accessing the collection dynamically using the subject code
        const collection = mongoose.connection.db.collection(subjectCode);
        
        // Fetching student data based on student ID
        const studentData = await collection.findOne({ StudentID: studentID });

        // If student data is not found
        if (!studentData) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetching all students' data for class-wise distribution
        const classData = await collection.find({}).toArray();

       // Generic distribution calculator for a given key (e.g., 'Minor1')
const getDistribution = (data, key) => {
    const distribution = {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0
    };

    data.forEach(item => {
        const marks = item[key] || 0;
        const binIndex = Math.floor(marks / 10);
        const binLabel = `${binIndex * 10}-${(binIndex + 1) * 10}`;
        if (distribution[binLabel] !== undefined) {
            distribution[binLabel] += 1;
        }
    });

    return Object.keys(distribution).map(key => ({
        marks: key,
        students: distribution[key]
    }));
};

// Overall distribution using weighted total
const getOverallDistribution = (data) => {
    const distribution = {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0
    };

    data.forEach(item => {
        const totalMarks = (
            (item.Minor1 || 0) * (item["Minor1_Weightage (%)"] || 0) +
            (item.Minor2 || 0) * (item["Minor2_Weightage (%)"] || 0) +
            (item.EndSem || 0) * (item["EndSem_Weightage (%)"] || 0)
        ) / 100;

        const binIndex = Math.floor(totalMarks / 10);
        const binLabel = `${binIndex * 10}-${(binIndex + 1) * 10}`;
        if (distribution[binLabel] !== undefined) {
            distribution[binLabel] += 1;
        }
    });

    return Object.keys(distribution).map(key => ({
        marks: key,
        students: distribution[key]
    }));
};
const classDistribution = {
    "Overall": getOverallDistribution(classData),
    "Minor 1": getDistribution(classData, "Minor1"),
    "Minor 2": getDistribution(classData, "Minor2"),
    "Endsem": getDistribution(classData, "EndSem")
};


        // Structure of response data
        const response = {
            name: studentData.StudentName,
            marks: [
                { name: 'Minor 1', marks: studentData.Minor1, total: 100, contribution: studentData["Minor1_Weightage (%)"] },
                { name: 'Minor 2', marks: studentData.Minor2, total: 100, contribution: studentData["Minor2_Weightage (%)"] },
                { name: 'Endsem',  marks: studentData.EndSem,  total: 100, contribution: studentData["EndSem_Weightage (%)"] }
            ],
            classDistribution // now includes all four distributions
        };
        

        // Sending the response
        res.json(response);
    } catch (err) {
        console.error("Error fetching subject data:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
