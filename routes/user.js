const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  checkUser,
  changePassword,
  forgotPassword,
  createPassword,
} = require("../controller/user");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", getUser);
router.get("/loggedin", loginStatus);
router.post("/checkuser", checkUser);
router.put("/changepassword", changePassword);
router.post("/forgotPassword", forgotPassword);
router.post("/createPassword", createPassword);

module.exports = router;
