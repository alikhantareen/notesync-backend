var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const Folder = mongoose.model(
  "Folder",
  new mongoose.Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      title: String,
      createdAt: Date,
      updatedAt: Date,
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Folder;
