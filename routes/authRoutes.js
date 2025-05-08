const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ProfessorUser = require("../models/ProfessorUser");

// UTILITY: Get correct model based on role
const getModelByRole = (role) => {
    if (role === "Professor") return ProfessorUser;
    return User; // default to Student
};

// 🔐 SIGNUP ROUTE
router.post("/signup", async (req, res) => {
    const { Username, Name = Username, Password, Role = "Student", Branch } = req.body;

    if (!Username || !Password || !Branch) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    const validRoles = ["Student", "Professor"];
    if (!validRoles.includes(Role)) {
        return res.status(400).json({ message: "Invalid role specified." });
    }

    try {
        const Model = getModelByRole(Role);

        // Check both collections to avoid username collisions
        const studentExists = await User.findOne({ Username }).lean();
        const profExists = await ProfessorUser.findOne({ professorID: Username }).lean();

        if (studentExists || profExists) {
            return res.status(400).json({ message: "User already exists!" });
        }

        let newUser;

        if (Role === "Professor") {
            // For professors, use the Username as the professorID
            newUser = new ProfessorUser({
                professorID: Username, // Setting professorID to be the same as Username
                Name,
                Password,
                Role,
                Branch,
            });
        } else {
            // For students, use the usual model
            newUser = new User({
                Username,
                Name,
                Password,
                Role,
                Branch,
            });
        }

        await newUser.save();

        res.json({
            message: `${Role} signup successful!`,
            redirect: `/${Username}`,
            role: Role,
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 🔐 LOGIN ROUTE
router.post("/login", async (req, res) => {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Check student first
        let user = await User.findOne({ Username }).lean();
        let role = "Student";

        // If not student, check professor
        if (!user) {
            user = await ProfessorUser.findOne({ professorID: Username }).lean(); // searching by professorID
            role = "Professor";
        }

        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        if (user.Password !== Password) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        res.json({
            message: `${role} login successful!`,
            redirect: `/${role.toLowerCase()}/${Username}`,
            role,
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
