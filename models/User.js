const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Password: { type: String, required: true },
  Role: { type: String, required: true },
  Branch: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema, "student_users");
