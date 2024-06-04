const e = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const CanvasModel = require("./models/canvas");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const axios = require("axios");

// server setup
const app = e();
// env setup
dotenv.config();
// mongoDB
const DB_URI = process.env.DB_URI;
// openAI DALL-E
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// AWS S3 BUCKET
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
// console.log(
//   AWS_ACCESS_KEY_ID,
//   AWS_SECRET_ACCESS_KEY,
//   AWS_REGION,
//   S3_BUCKET_NAME

// );
// aws s3 setups
const upload = multer({ dest: "uploads/" });
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

///////////////////////////
// Connect to MongoDB
///////////////////////////

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

app.get("/canvases/filter", (req, res) => {
  console.log("filter hello");
  res.send("hello filter");
});

// filtered canvases
app.get("/canvases/filter/:filterBy", async (req, res) => {
  // get all canvases
  const allCanvases = await CanvasModel.find({});
  // get the filterby from the url
  const { filterBy } = req.params;
  // get the specific filter from the req query
  const specificFilter = req.query.style;
  console.log(specificFilter, "why are you undefined?");
  // filter the canvases
  const filteredCanvases = allCanvases.filter(
    // ex: if canvas.syle === abstract
    (canvas) => {
      console.log(canvas[filterBy], " <-- canvas filter by");
      console.log(specificFilter, " <-- specificFilter");
      return canvas[filterBy] === specificFilter;
    }
  );
  console.log(filteredCanvases, " <-- filtered canvases");
  // give the value of the filtered canvases to the ejs
  res.render("canvas/index.ejs", { allCanvases: filteredCanvases });
});

//   view page of creaqting a new painting
app.get("/canvases/new", (req, res) => {
  res.render("canvas/new.ejs");
});

//   create new painting
app.post("/canvases/new", async (req, res) => {
  const newCanvasData = await destructureReqBody(req.body);
  const newCanvas = await CanvasModel.create(newCanvasData);
  // actions to ensure our db gets the permanent link for the images
  await replaceTempUrlWithS3Url(req, res, newCanvas._id);
  console.log(newCanvas);
  res.redirect("/canvases");
});

// uploads temp url from openai to server then s3 bucket
app.post("/upload", upload.single("file"));

//   get single painting
app.get("/canvases/:canvasID/edit", async (req, res) => {
  const id = req.params.canvasID;
  const canvas = await CanvasModel.findById(id);
  // console.log(canvas);
  res.render("canvas/edit.ejs", { canvas, id });
});

//   update painting | only edit title and description
app.put("/canvases/:canvasID/edit", async (req, res) => {
  // console.log("test update");
  const id = req.params.canvasID;

  const { title, description } = req.body;

  const updatedCanvas = await CanvasModel.findByIdAndUpdate(id, {
    title,
    description,
  });
  console.log(updatedCanvas);
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
// end of mvp
///////////////////////////

///////////////////////////
// FUNCTIONS
///////////////////////////
async function destructureReqBody(reqBody) {
  const { style, mainColor, dimensions, title, description, medium } = reqBody;
  const selectedCanvas = await CanvasModel.findOne({
    description: description,
  });
  // if there is an img present and the length of it is more than
  //  0 then do NOT create a new img, use the original one
  if (selectedCanvas.img && selectedCanvas.img.length > 0) {
    const newCanvasData = {
      style,
      img: selectedCanvas.img,
      mainColor,
      dimensions,
      title,
      description,
      medium,
    };
    return newCanvasData;
  }
  // otherwise create a new img
  else {
    const img = await createAiImage(
      style,
      mainColor,
      dimensions,
      medium,
      title,
      description
    );
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
    model: "dall-e-3",
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
  let isLoading = false;
  try {
    isLoading = true;
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      payload,
      headers
    );
    // ! review this
    if (response.data && response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      return imageUrl.toString();
    } else {
      console.error("No image URL found in the response");
      return null;
    }
  } catch (error) {
    console.error(
      `Error trying to generate image: `,
      error.response ? error.response.data : error.message
    );
    return null;
  } finally {
    isLoading = false;
  }
}

// download image to server
async function downloadImage(url, dest) {
  const response = await axios({
    url,
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// action to replace the tempUrl with a permanent url from s3 bucket
async function replaceTempUrlWithS3Url(req, res, id) {
  const { tempUrl } = req.body;
  const fileName = `image_${Date.now()}.png`;
  const filePath = path.join(__dirname, "uploads", fileName);
  try {
    await downloadImage(tempUrl, filePath);
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: fs.createReadStream(filePath),
      ACL: "public-read",
    };
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(data);
    const newImageUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    await CanvasModel.findByIdAndUpdate({ _id: id, img: newImageUrl });
    console.log("Updated canvas with new URL:", newImageUrl);
    fs.unlinkSync(filePath); // Clean up local file
  } catch (error) {
    console.error(
      `Error updating document with permanent link from S3 bucket: ${error}`
    );
  }
}

/*

Generate an image in the style of ${style}. 
The main color of the image should be ${mainColor}. 
The dimensions of the image should be ${dimensions} orientation. 
The medium used should be ${medium}. The image should be titled "${title}" and described as "${description}". Ensure the image captures the essence of the specified style, medium, 
and color while adhering to the given title and description.

*/
