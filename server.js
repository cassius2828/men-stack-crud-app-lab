const e = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const CanvasModel = require("./models/canvas");
// openai image generator API

// const openai = require("openai");
const axios = require("axios");

// server setup
const app = e();
// env setup
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(OPENAI_API_KEY);
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
  const newCanvasData = await destructureReqBody(req.body);
  const newCanvas = await CanvasModel.create(newCanvasData);
  console.log(newCanvas);
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

  const updatedCanvasInfo = await destructureReqBody(req.body);

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
app.delete("/canvases/:canvasID", async (req, res) => {
  const id = req.params.canvasID;
  const canvasToDelete = await CanvasModel.deleteOne({ _id: id });
  console.log(canvasToDelete, "deleted canvas");
  res.redirect("/canvases");
});

// run server
app.listen(3030, () => {
  //   console.log(`Listening on port 3030`);
});

///////////////////////////
// FUNCTIONS
///////////////////////////
async function destructureReqBody(reqBody) {
  const { style, mainColor, dimensions, title, description, medium } = reqBody;
  const img = await createAiImage(
    style,
    mainColor,
    dimensions,
    medium,
    title,
    description
  );
  if (img) {
    const newCanvasData = {
      style,
      img,
      mainColor,
      dimensions,
      title,
      description,
      medium,
    };
    return newCanvasData;
  } else {
    const newCanvasData = {
      style,
      mainColor,
      dimensions,
      title,
      description,
      medium,
    };
    return newCanvasData;
  }
}

// returns image_url
async function createAiImage(
  style,
  mainColor,
  dimensions,
  medium,
  title,
  description
) {
  const prompt = `Generate an image in the style of ${style}. The main color of the image should be ${mainColor}. The dimensions of the image should be ${dimensions} orientation. The medium used should be ${medium}. The image should be titled "${title}" and described as "${description}". Ensure the image captures the essence of the specified style, medium, and color while adhering to the given title and description.`;
  const payload = {
    model: "dalle-2",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  };
  const headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  };
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      payload,
      headers
    );
    const image_url = response.data[0].url;
    return image_url.toString();
  } catch (error) {
    console.log(`Error trying to generate image: `, error);
  }
}

/*

Generate an image in the style of ${style}. 
The main color of the image should be ${mainColor}. 
The dimensions of the image should be ${dimensions} orientation. 
The medium used should be ${medium}. The image should be titled "${title}" and described as "${description}". Ensure the image captures the essence of the specified style, medium, 
and color while adhering to the given title and description.

*/
