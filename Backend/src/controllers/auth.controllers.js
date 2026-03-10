const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendMail = require("../services/mail.service");
const { resetPassTemplate } = require("../utils/email.template");

const registerController = async (req, res) => {
  try {

    let { fullname, email, password, mobile ,} = req.body;

    if (!fullname || !email || !password || !mobile ) {
      return res.status(404).json({
        message: "All fields are required",
      });
    }

    let existingUser = await UserModel.findOne({ email });

    if (existingUser)
      return res.status(422).json({
        message: "User already exists",
      });

    let newUser = await UserModel.create({
      fullname,
      email,
      mobile,
      password,
    });

    let token = newUser.generateToken();

    res.cookie("token", token);
    console.log(req.body);
    return res.status(201).json({

      message: "user registered",
      user: newUser,
    });

  } catch (error) {
    console.log("error in register", error);
    return res.status(500).json({
      message: "Internal server error ",
      error: error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({
        message: "All fields are required",
      });
    }

    let user = await UserModel.findOne({ email });

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    let cp = await user.comparePass(password);

    if (!cp)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    let token = await user.generateToken();

    res.cookie("token", token);

    return res.status(200).json({
      message: "user logged in",
      user: user,
    });
  } catch (error) {
    console.log("error in login", error);
    return res.status(500).json({
      message: "Internal server error ",
      error: error,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
        
      });
    }

    await cacheInstance.set(token, "blacklisted");

    res.clearCookie("token");

    return res.status(200).json({
      message: "User logged out",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email)
      return res.status(400).json({
        message: "Email is required",
      });

    let user = await UserModel.findOne({ email });

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    let rawToken = jwt.sign({ id: user._id }, process.env.JWT_RAW_SECRET, {
      expiresIn: "2min",
    });

    let resetLink = `http://localhost:3000/api/auth/reset-password/${rawToken}`;

    let emailTemp = resetPassTemplate(user.fullname, resetLink);

    await sendMail(email, "Reset Password", emailTemp);

    return res.status(200).json({
      message: "Reset link sent",
    });
  } catch (error) {
    console.log("error in fp", error);
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};

const updatePasswordController = async (req, res) => {
  try {
    let user_id = req.params.id;
    let { password } = req.body;
    console.log("password from ejs", password);

    if (!user_id || !password)
      return res.status(400).json({
        message: "User ID and password are required",
      });

    const bcrypt = require("bcrypt");
    let hashedPassword = await bcrypt.hash(password, 10);

    let updateUser = await UserModel.findByIdAndUpdate(
      { _id: user_id },
      {
        password: hashedPassword,
      }
    );

    return res.status(200).json({
      message: "User password updated",
      user: updateUser,
    });
  } catch (error) {
    console.log("error in UP", error);
    return res.status(500).json({
      message: "internal server error",
      error: error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  forgotPasswordController,
  updatePasswordController,
  meController: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      return res.status(200).json({
        user: user,
      });
    } catch (error) {
      console.log("error in me", error);
      return res.status(500).json({
        message: "internal server error",
        error: error,
      });
    }
  },
};
