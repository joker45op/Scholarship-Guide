const mongoose = require("mongoose");
const Name = require("./item");

const dbconnect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://testuser:0QpsAQRgpJkIJfL3@cluster0.jyiybpf.mongodb.net/"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Handle error
  }
  const NAME = new Name({
    name: "12345678",
  });

  NAME.save().then((namee) => {
    console.log("Education saved:", namee);
  });
};

dbconnect();

// module.exports = dbconnect;
