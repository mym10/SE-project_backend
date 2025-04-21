const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://myth:2TbSL11j9CECYPfo@vosscluster.mp0lp.mongodb.net/"; // Replace with your actual connection string

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("MongoDB Connection Failed!", err);
    process.exit(1);
  }
};

module.exports = connectDB;
