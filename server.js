const e = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = e();

dotenv.config();

const DB_URI = process.env.DB_URI;
console.log(DB_URI);
async function connect() {
  await mongoose.connect(DB_URI);
  mongoose.connection.on("connected", () =>
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`)
  );
}
connect();

// home page
app.get("/", (req, res) => {
  res.render("home/index.ejs");
});
// get all paintings
app.get("/canvases", (req, res) => {
  res.render("canvas/index.ejs");
});
//   create new painting
app.post("/canvases/new", (req, res) => {
  res.redirect("canvas/index.ejs");
});

//   update painting
app.put("/canvases:canvasID", (req, res) => {
  res.render("canvas/show.ejs");
});


// run server
app.listen(3030, () => {
  console.log(`Listening on port 3030`);
});
