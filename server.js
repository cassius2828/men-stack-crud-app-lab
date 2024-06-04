const e = require("express");

const methodOverride = require("method-override");
const path = require("path");

// canvas controller export
const canvasesCtrl = require('./controllers/canvases')

// server setup
const app = e();
// env setup
const dotenv = require("dotenv");
dotenv.config();

///////////////////////////
// Connect to MongoDB
///////////////////////////

require("./config/db");

///////////////////////////
// Middleware
///////////////////////////
app.use(e.urlencoded({ extended: false }));
// serve static files from server
app.use(e.static(path.join(__dirname, "public")));
// Override with POST having ?_method=PUT
app.use(methodOverride("_method"));


// app.use('/canvases', canvasesCtrl)
///////////////////////////
// Landing Page
///////////////////////////
// home page
app.get("/", (req, res) => {
  res.render("home/index.ejs");
});

///////////////////////////
// Canvas Controllers
///////////////////////////
app.get("/canvases", canvasesCtrl.index);
app.get("/canvases/filter/:filterBy", canvasesCtrl.filter);
app.get("/canvases/new", canvasesCtrl.new);
app.post("/canvases/new", canvasesCtrl.create);
app.post("/upload", canvasesCtrl.upload);
app.get("/canvases/:canvasID/edit", canvasesCtrl.showEdit);
app.put("/canvases/:canvasID/edit", canvasesCtrl.edit);
app.get("/canvases/:canvasID", canvasesCtrl.show);
app.delete("/canvases/:canvasID", canvasesCtrl.remove);

// run server
app.listen(3030, () => {
  //   console.log(`Listening on port 3030`);
});

