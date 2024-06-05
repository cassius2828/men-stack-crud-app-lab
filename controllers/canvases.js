const CanvasModel = require("../models/canvas");
const destructureReqBody = require("../utils/destructureReqBody");
const replaceTempUrlWithS3Url = require("../utils/replaceTempUrlWithS3Url");
const multer = require("multer");
const session = require("express-session");
const e = require("express");
const app = e();
const upload = multer({ dest: "uploads/" });
///////////////////////////
// Set Up Cookies Sessions
///////////////////////////
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
///////////////////////////
// get all canvases
///////////////////////////
const index = async (req, res) => {
  const specificFilter = false

  const allCanvases = await CanvasModel.find({});
  res.render("canvas/index.ejs", { allCanvases, user: req.session.user,specificFilter });
};

///////////////////////////
// filtered canvases
///////////////////////////
const filter = async (req, res) => {
  const allCanvases = await CanvasModel.find({});
  const { filterBy } = req.params;
  const specificFilter = req.query[filterBy];
  console.log(filterBy);
  console.log(specificFilter);

  const filteredCanvases = allCanvases.filter(
    (canvas) => canvas[filterBy] === specificFilter
  );

  if (specificFilter === "no-filter") {
    return res.redirect("/canvases");
  }

  res.render("canvas/index.ejs", {
    allCanvases: filteredCanvases,
    user: req.session.user,specificFilter
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
