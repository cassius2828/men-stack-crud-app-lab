const mongoose = require("mongoose");

const paintingSchema = new mongoose.Schema({
  style: String,
  img: String,
  mainColor: String,
  dimensions: String,
  title: String,
  description: String,
});

const PaintingModel = mongoose.model("Painting", paintingSchema);

module.exports = PaintingModel;
