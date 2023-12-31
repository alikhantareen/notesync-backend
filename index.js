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
  await mongoose.connect("mongodb+srv://alikhantareen:Pakistan786@cluster0.po7h8av.mongodb.net/?retryWrites=true&w=majority");
  console.log("MongoDB connected");
})();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


//api to get user's folders
app.get("/whiteboard/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const folders = await Folder.find({ user: id });
    return res.status(200).json(folders);
  } catch (error) {
    console.log(error);
  }
});

//api to get notes of a specific folder
app.get("/myfolder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const folderTitle = await Folder.findById(id);
    const notes = await Note.find({ folder: id });
    return res.status(200).json({notes, folderTitle});
  } catch (error) {
    console.log(error);
  }
});

//api to delete a note
app.delete("/note/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const note = await Note.deleteOne({_id: id});
    return res.status(200).json({success: "note deleted"})
  } catch (error) {
    return res.status(500).json({error: "could not delete"})
  }
})


//api to delete a folder
app.delete("/folder/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const folder = await Folder.deleteOne({_id: id});
    return res.status(200).json({success: "folder deleted"})
  } catch (error) {
    return res.status(500).json({error: "could not delete"})
  }
})

//api to return a specific note
app.get("/myfolder/mynote/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    return res.status(200).json(note);
  } catch (error) {
    return res.status(404).json({ error: "note not found" });
  }
});

//api to add a note
app.post("/myfolder/addnote/:id", async (req, res) => {
  const token = req.body.token;
  let flag = false;
  if (token) {
    flag = jwt.verify(token, process.env.JWT_SECRET);
  }
  if (flag) {
    try {
      const note = new Note({ ...req.body });
      const newNote = await note.save();
      return res.status(200).json({ newNote });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Note could not be created at this time." });
    }
  } else {
    return res.status(500).json({ error: "Unauthorized user request" });
  }
});

//api to create a folder
app.post("/whiteboard/:id", async (req, res) => {
  const token = req.body.token;
  let flag = false;
  if (token) {
    flag = jwt.verify(token, process.env.JWT_SECRET);
  }
  if (flag) {
    try {
      const folder = new Folder({ ...req.body });
      const newFolder = await folder.save();
      return res.status(200).json({ newFolder });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Folder could not be created at this time." });
    }
  } else {
    return res.status(500).json({ error: "Unauthorized user request" });
  }
});

//api to update a note
app.put("/update-note/:id", async (req, res) => {
  const token = req.body.token;
  let flag = false;
  if (token) {
    flag = jwt.verify(token, process.env.JWT_SECRET);
  }
  if(flag) {
    try {
      const { id } = req.params;
      const filter = { _id: id };
      const update = req.body;
      await Note.findOneAndUpdate(filter, update);
      const updateNote = await Note.findById(id);
      return res.status(200).json(updateNote);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Note can not be updated at this time." });
    }
  } else {
    return res.status(500).json({ error: "Unauthorized user request" });
  }
});

// Handling user signup
const signUp = async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({
      message: "Please Provide Required Information.",
    });
  }

  const hash_password = await bcrypt.hash(password, 10);

  const userData = {
    username,
    email,
    hash_password,
  };

  const user = await User.findOne({ email });
  const name = await User.findOne({ username });
  if (user) {
    return res.status(400).json({
      message: "User already registered.",
    });
  } else if (name) {
    return res.status(400).json({
      message: "Username already taken.",
    });
  } else {
    User.create(userData).then((data, err) => {
      if (err) res.status(400).json({ err });
      else res.status(200).json({ message: "User created Successfully." });
    });
  }
};

const signIn = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email: req.body.email });
    const authenticated = await user.authenticate(req.body.password);

    if (user) {
      if (authenticated) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        const { _id, email, username } = user;
        res.status(200).json({
          token,
          user: { _id, email, username },
        });
      } else {
        res.status(400).json({
          message: "Something went wrong!",
        });
      }
    } else {
      res.status(404).json({
        message: "User does not exist..!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

//api's for login and signup
app.post("/", signIn);
app.post("/signup", signUp);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
