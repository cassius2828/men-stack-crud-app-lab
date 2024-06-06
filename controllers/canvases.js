const CanvasModel = require("../models/canvas");
const destructureReqBody = require("../utils/destructureReqBody");
const replaceTempUrlWithS3Url = require("../utils/replaceTempUrlWithS3Url");
const multer = require("multer");
const e = require("express");
const app = e();
const upload = multer({ dest: "uploads/" });

///////////////////////////
// get all canvases
///////////////////////////
const index = async (req, res) => {
  const allCanvases = await CanvasModel.find({});
  res.render("canvas/index.ejs", {
    allCanvases,
  });
};

///////////////////////////
// filtered canvases
///////////////////////////
const filter = async (req, res) => {
  let allCanvases = await CanvasModel.find({});
  // middleware to add specific filter to ejs
  const { specificFilter } = res.locals;
  console.log(specificFilter);
  const { filterBy } = req.params;

  // need to work on this logic for abc
  if (specificFilter === "a-z") {
    allCanvases.sort((a, b) => a["title"].localeCompare(b["title"]));
  } else if (specificFilter === "z-a") {
    allCanvases.sort((a, b) => b["title"].localeCompare(a["title"]));
  } else if (specificFilter === "no-filter") {
    return res.redirect("/canvases");
  } else {
    allCanvases = allCanvases.filter(
      (canvas) => canvas[filterBy] === specificFilter
    );
  }

  res.render("canvas/index.ejs", {
    allCanvases,
  });
};



///////////////////////////
// render the new canvas page
///////////////////////////
const newCanvas = (req, res) => {
  res.render("canvas/new.ejs");
};

///////////////////////////
// create new canvas
///////////////////////////
const create = async (req, res) => {
  const newCanvasData = await destructureReqBody(req.body);
  const newCanvas = await CanvasModel.create(newCanvasData);
  await replaceTempUrlWithS3Url(req, res, newCanvas._id);
  res.redirect("/canvases");
};

///////////////////////////
// uploads temp url from openai to server then s3 bucket
///////////////////////////
const uploadTempUrl = (req, res) => {};

///////////////////////////
// get single canvas by ID
///////////////////////////
const show = async (req, res) => {
  const { canvasID } = req.params;
  const canvas = await CanvasModel.findById(canvasID);
  res.render("canvas/show.ejs", { canvas, id: canvasID });
};

///////////////////////////
// show edit canvas page
///////////////////////////
const showEdit = async (req, res) => {
  const { canvasID } = req.params;
  const canvas = await CanvasModel.findById(canvasID);
  res.render("canvas/edit.ejs", { canvas, id: canvasID });
};

///////////////////////////
// edit canvas
///////////////////////////
const edit = async (req, res) => {
  const { canvasID } = req.params;
  const { title, description } = req.body;
  await CanvasModel.findByIdAndUpdate(canvasID, { title, description });
  res.redirect(`/canvases/${canvasID}`);
};

///////////////////////////
// delete canvas
///////////////////////////
const remove = async (req, res) => {
  const { canvasID } = req.params;
  await CanvasModel.deleteOne({ _id: canvasID });
  res.redirect("/canvases");
};

///////////////////////////
// Exports
///////////////////////////
module.exports = {
  index,
  filter,
  new: newCanvas,
  create,
  upload: uploadTempUrl,
  show,
  showEdit,
  edit,
  remove,
};
