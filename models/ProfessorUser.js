const mongoose = require("mongoose");

const ProfessorSchema = new mongoose.Schema({
  professorID: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Password: { type: String, required: true },
  Role: { type: String, required: true, enum: ["Professor"] },
  Branch: { type: String, required: true },
  Courses: { type: [String], default: [] },
});

module.exports = mongoose.model("ProfessorUser", ProfessorSchema, "prof_data");
