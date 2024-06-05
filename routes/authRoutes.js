const e = require("express");
const UserModel = require("../models/user");
const router = e.Router();
const bcrypt = require("bcrypt");
///////////////////////////
// get login
///////////////////////////
router.get("/login", (req, res) => {
  res.render("auth/login.ejs");
});

///////////////////////////
// post login
///////////////////////////
router.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await UserModel.findOne({ username: username });
    console.log(user, " <-- found the user");
      // session obj
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

///////////////////////////
// get register
///////////////////////////
router.get("/register", (req, res) => {
  res.render("auth/register.ejs");
});

///////////////////////////
// post register
///////////////////////////
router.post("/register", async (req, res) => {
  // vars from req.body
  const { username, confirmPassword } = req.body;
  let password = req.body.password;

  //   search db for existing user
  const findUser = await UserModel.findOne({ username: username });
  if (findUser) {
    return res.send(`Username already exists`);
  }
  if (confirmPassword !== req.body.password) {
    return res.send(`Passwords do not match`);
  }
  //   has the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  password = hashedPassword;

  // store info for new user
  const newUser = {
    username,
    password: password,
  };

  try {
    // create new user with new password hash
    await UserModel.create(newUser);
    console.log(newUser, " <-- found the newUser");

    // session obj
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


router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });






module.exports = router;
