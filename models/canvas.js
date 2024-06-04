const mongoose = require("mongoose");

const canvasSchema = new mongoose.Schema({
  style: String,
  img: String,
  color: String,
  dimensions: String,
  title: String,
  description: String,
  medium:String
});

const CanvasModel = mongoose.model("Painting", canvasSchema);

module.exports = CanvasModel;
