const e = require("express");

const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");

// server setup
const app = e();
// env setup
const dotenv = require("dotenv");
dotenv.config();
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
// Connect to MongoDB
///////////////////////////

require("./config/db");
app.use(e.urlencoded({ extended: false }));
app.use(e.json());
///////////////////////////
// Canvas Router
///////////////////////////
const authRouter = require("./routes/authRoutes");
const canvasRouter = require("./routes/canvasRoutes");

app.use("/auth", authRouter);
app.use("/canvases", canvasRouter);

///////////////////////////
// Middleware
///////////////////////////

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
  console.log(req.session, " <-- req.session");
// includes cookie session as user
  res.render("home/index.ejs", { user: req.session.user });
});

// app.post("/upload", canvasesCtrl.upload);
// run server
app.listen(3030, () => {
  //   console.log(`Listening on port 3030`);
});
