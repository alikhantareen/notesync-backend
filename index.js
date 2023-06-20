const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./Models/User.js");
const Note = require("./Models/Note.js");
const Folder = require("./Models/Folder.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
const PORT = 5050;

//Database connection
(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/mynotes");
  console.log("MongoDB connected");
})();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const folders = await Folder.find({}); 
    return res.status(200).json(folders);
  } catch (error) {
    console.log(error);
  }
});

app.post("/", async (req, res) => {
  try {
    const folder = new Folder({ ...req.body });
    const newFolder = await folder.save();
    return res.status(200).json({ newFolder });
  } catch (error) {
    return res.status(500).json({error: "Folder could not be created at this time."})
  }
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
