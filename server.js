const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const passUserToView = require("./middleware/pass-user-to-view");
// Load environment variables from .env file
dotenv.config();

// Server setup
const app = express();

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
// Middleware
///////////////////////////

// Serve static files from server
app.use(express.static(path.join(__dirname, "public")));
// Override with POST having ?_method=PUT
app.use(methodOverride("_method"));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// makes a global session user in every ejs file (locals obj)
app.use(passUserToView);

///////////////////////////
// Connect to MongoDB
///////////////////////////
require("./config/db");

///////////////////////////
// Routers
///////////////////////////
const authRouter = require("./routes/authRoutes");
const canvasRouter = require("./routes/canvasRoutes");

app.use("/auth", authRouter);
app.use("/canvases", canvasRouter);

///////////////////////////
// Landing Page
///////////////////////////
// Home page
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/canvases");
  } else {
    res.render("home/index.ejs", { user: req.session.user });
  }
});

///////////////////////////
// Start Server
///////////////////////////
app.listen(3030, () => {
  console.log(`Listening on port 3030`);
});
