const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendMail");

// generate jwt token
// id =>db user id
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2d" });
};

// Register User

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400).json({ error: "Please fill in all required fields" });
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ error: "Email has already been registered" });
  }

  // Create new user
  const user = await User.create({
    // name:name ==> name from db and name from req.body
    name,
    email,
    password,
  });

  //   generate jwt token
  // db user id
  const token = generateToken(user._id);

  //   mostly we token save in localstorage in our frontend . now we send token only the http-only cookie

  // Send token in HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpsOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    // sameSite: "none",
    // secure: true
  });

  //   some times its does'nt show postmon res.cookie because we set secure=true

  if (user) {
    const { _id, name, email } = user;
    res.status(201).json({
      _id,
      name,
      email,
      token,
    });
  } else {
    res.status(400).json({ error: "Invalid User data" });
  }
};

// login user

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // validate request
  if (!email || !password) {
    res.status(400).json({ error: "Please Add email & password" });
  }

  // check if user exist

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    (" User doesn't exist .Please register");
  }

  // check password

  // password from body user.password from db {user come from above code}
  const passwordIsCrt = await bcrypt.compare(password, user.password);

  if (!passwordIsCrt) {
    res.status(400).json({ error: " Invalid password" });
  }

  //   Generate Token
  const token = generateToken(user._id);

  if (passwordIsCrt) {
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      // sameSite: "none",
      // secure: process.env.NODE_ENV !== "development",
      // secure: true,
    });
  }

  if (user && passwordIsCrt) {
    const { _id, name, email } = user;
    res.status(201).json({
      _id,
      name,
      email,
      token,
    });
  } else {
    res.status(400).json({ error: "Invalid email or password" });
  }
};

// logout user
exports.logoutUser = async (req, res) => {
  // in this time we not remove or delete cookie we just expire that
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    // sameSite: "none",
    // secure: process.env.NODE_ENV !== "development",
    // secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
};

// getUser profile or data

exports.getUser = async (req, res) => {
  // inthis case req.user._id ==> req.user from request of middleware and thats's a exact user(db) so
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email } = user;
    res.status(200).json({
      _id,
      name,
      email,
    });
  } else {
    res.status(400).json({ error: "User Not Found" });
  }
};

// get user status (like if user loggedIn or not )

exports.loginStatus = async (req, res) => {
  // you already learn from protect middleware below
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
};

exports.checkUser = async (req, res) => {
  const { email } = req.body;

  const user = await User.find({ email });

  if (!user) {
    res.status(400).json({ error: "User doesn't exist" });
  } else {
    res.status(200).json("User exist");
  }
};

exports.changePassword = async (req, res) => {
  // req.user._id come from middleware
  const { email, newpassword } = req.body;

  const user = await User.find({ email });

  if (user) {
    // password save to db
    await User.updateOne(
      { email },
      {
        $set: {
          password: newpassword,
        },
      }
    );

    res.status(200).send("Password change successful");
  } else {
    res.status(400).json({ error: " password not changed" });
  }
};

// forgot password

exports.forgotPassword = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ errror: "User does not exist" });
  }

  // Construct Reset Url {this link we send in the mail} without hashed token ...but in db is hashed token encoded
  const resetOTP = otp;

  // Reset Email message we send too url (above link)
  const message = `
       <h2>Hello ${user.name}</h2>
       <p>Please use the OTP below to reset your password</p>  
       <h1>${resetOTP}</h1>
       <p>Regards...</p>
       <p>LezDo Team</p>
     `;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendMail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500).json({ error: "Email not sent, please try again" });
  }
};

// create Password

exports.createPassword = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    res.status(404).json({ error: "User Already have a account" });
  }

  // Construct Reset Url {this link we send in the mail} without hashed token ...but in db is hashed token encoded
  const resetOTP = otp;

  // Reset Email message we send too url (above link)
  const message = `
         <h2>Hello ${email}</h2>
         <p>Please use the OTP below to reset your password</p>  
         <h1>${resetOTP}</h1>
         <p>Regards...</p>
         <p>LezDo Team</p>
       `;
  const subject = "Password Reset Request";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendMail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500).json({ error: "Email not sent, please try again" });
  }
};
