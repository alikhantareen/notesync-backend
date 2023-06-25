var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const Note = mongoose.model(
  "Note",
  new mongoose.Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      folder: { type: Schema.Types.ObjectId, ref: "Folder" },
      title: String,
      description: String,
      createdAt: Date,
      updatedAt: Date,
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Note;
