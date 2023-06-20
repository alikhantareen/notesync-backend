var mongoose = require("mongoose");

const Folder = mongoose.model(
  "Folder",
  new mongoose.Schema(
    {
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
