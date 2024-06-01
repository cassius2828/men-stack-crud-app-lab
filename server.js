const e = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const CanvasModel = require("./models/canvas");

// server setup
const app = e();
// env setup
dotenv.config();

///////////////////////////
// Connect to MongoDB
///////////////////////////
const DB_URI = process.env.DB_URI;

async function connect() {
  await mongoose.connect(DB_URI);
  //   mongoose.connection.on("connected", () =>
  //     console.log(`Connected to MongoDB: ${mongoose.connection.name}`)
  //   );
}
connect();

///////////////////////////
// Middleware
///////////////////////////
app.use(e.urlencoded({ extended: false }));
// serve static files from server
app.use(e.static(path.join(__dirname, "public")));
// Override with POST having ?_method=PUT
app.use(methodOverride("_method"));
///////////////////////////
// Routes
///////////////////////////

// home page
app.get("/", (req, res) => {
  res.render("home/index.ejs");
});
// get all paintings
app.get("/canvases", async (req, res) => {
  const allCanvases = await CanvasModel.find({});
  // console.log(allCanvases)
  res.render("canvas/index.ejs", { allCanvases });
});
//   view page of creaqting a new painting
app.get("/canvases/new", (req, res) => {
  res.render("canvas/new.ejs");
});

//   create new painting
app.post("/canvases/new", async (req, res) => {
  const newCanvasData = destructureReqBody(req.body);
  const newCanvas = await CanvasModel.create(newCanvasData);
  // console.log(newCanvas);
  res.redirect("/canvases");
});

//   get single painting
app.get("/canvases/:canvasID/edit", async (req, res) => {
  const id = req.params.canvasID;
  const canvas = await CanvasModel.findById(id);
  // console.log(canvas);
  res.render("canvas/edit.ejs", { canvas, id });
});
//   update painting
app.put("/canvases/:canvasID/edit", async (req, res) => {
  // console.log("test update");
  const id = req.params.canvasID;

  const updatedCanvasInfo = destructureReqBody(req.body);

  await CanvasModel.findByIdAndUpdate(id, updatedCanvasInfo);
  
  res.redirect(`/canvases/${id}`);
});
//   get single painting
app.get("/canvases/:canvasID", async (req, res) => {
  const id = req.params.canvasID;
  const canvas = await CanvasModel.findById(id);
  // console.log(canvas);
  res.render("canvas/show.ejs", { canvas, id });
});

// delete painting
app.delete("/canvases/:canvasID", (req, res) => {
  const id = req.params.canvasID;
  // console.log("deleted canvas --> ", id);
  // res.redirect("/canvases");
});

// run server
app.listen(3030, () => {
  //   console.log(`Listening on port 3030`);
});

///////////////////////////
// FUNCTIONS
///////////////////////////
function destructureReqBody(reqBody) {
  const { style, img, mainColor, dimensions, title, description, medium } =
    reqBody;
  const newCanvasData = {
    style,
    // img,
    mainColor,
    dimensions,
    title,
    description,
    medium,
  };
  return newCanvasData;
}
