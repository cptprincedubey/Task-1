const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let res = await mongoose.connect(process.env.MONGO_URI);

    if (res) {
      console.log("MongoDB Connected successfully");
    }
  } catch (error) {
    console.log("error while connecting DATABASE",error);
  }
};


module.exports = connectDB

