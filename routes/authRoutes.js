const e = require("express");
const UserModel = require("../models/user");
const router = e.Router();
const bcrypt = require("bcrypt");
const app = e();
const session = require("express-session");

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
// Routes
///////////////////////////

// Get login
router.get("/login", (req, res) => {
  res.render("auth/login.ejs");
});

// Post login
router.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await UserModel.findOne({ username: username });
    console.log(user, " <-- found the user");
    // Session object
    req.session.user = {
      username: user.username,
      _id: user._id,
    };
    return res.redirect("/canvases");
  } catch (error) {
    console.log(error);
  }
  return res.send("Error logging in user");
});

// Get register
router.get("/register", (req, res) => {
  res.render("auth/register.ejs");
});

// Post register
router.post("/register", async (req, res) => {
  // Vars from req.body
  const { username, confirmPassword } = req.body;
  let password = req.body.password;

  // Search DB for existing user
  const findUser = await UserModel.findOne({ username: username });
  if (findUser) {
    return alert(`Username already exists`);
  }
  if (confirmPassword !== req.body.password) {
    return alert(`Passwords do not match`);
  }
  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  password = hashedPassword;

  // Store info for new user
  const newUser = {
    username,
    password: password,
  };

  try {
    // Create new user with new password hash
    await UserModel.create(newUser);
    console.log(newUser, " <-- found the newUser");

    // Session object
    req.session.user = {
      username: newUser.username,
      _id: newUser._id,
    };
    return res.redirect("/canvases");
  } catch (error) {
    console.log(error);
  }

  return res.send("Error registering user");
});

// Try to view profile page
router.get("/profile", (req, res) => {
  const id = req.session.user?._id;
  const username = req.session.user?.username;
  if (id) {
    return res.redirect(`/auth/profile/${username}`);
  } else {
    return res.redirect(`/auth/login`);
  }
});

// View user profile page
router.get("/profile/:username", async (req, res) => {
  const id = req.session.user?._id;
  const user = await UserModel.findById(id);
  res.render("auth/profile.ejs", { username: user.username });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
