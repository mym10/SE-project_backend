const express = require("express");
const router = express.Router();
const User = require("../models/User");

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  const { Username, Name, Password, Role, Branch } = req.body; // Default Name to Username if Name isn't provided.

  try {
      const existingUser = await User.findOne({ Username }).lean();
      if (existingUser) {
          return res.status(400).json({ message: "User already exists!" });
      }

      const newUser = new User({ Username, Name, Password, Role, Branch });

      await newUser.save();
      res.json({ message: "Signup successful!", redirect: `/${Username}` });
  } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { Username, Password } = req.body;

  try {
      let user = await User.findOne({ Username }).lean();

      if (!user) {
          return res.status(400).json({ message: "User not found!" });
      }

      if (user.Password !== Password) {
          return res.status(401).json({ message: "Incorrect password!" });
      }

      res.json({ message: "Login successful!", redirect: `/${Username}` });

  } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;