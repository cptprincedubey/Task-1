const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendMail = require("../services/mail.service");
const { resetPassTemplate, emailTemplate } = require("../utils/email.template");
const crypto = require("crypto");

const registerController = async (req, res) => {
  try {

    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    let existingUser = await UserModel.findOne({ email });

    if (existingUser && existingUser.isVerified)
      return res.status(422).json({
        message: "Email already registered",
      });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let newUser = await UserModel.create({
      name,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: tokenExpiry,
      isVerified: false,
    });

    // Send verification email
    const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;
    const emailTemp = emailTemplate(name, verificationLink);
    await sendMail(email, "Verify Your Email", emailTemp);
    
    return res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      email: email,
    });

  } catch (error) {
    console.log("error in register", error);
    return res.status(500).json({
      message: "Registration failed: " + error.message,
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

    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify your email first. Check your inbox for the verification link.",
        email: email,
      });

    let cp = await user.comparePass(password);

    if (!cp)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    let token = await user.generateToken();

    return res.status(200).json({
      message: "Login successful",
      token: token,
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

const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.log("error in verify email", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};

const resendVerificationEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified. Please login instead.",
      });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save();

    // Send verification email
    const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;
    const emailTemp = emailTemplate(user.name, verificationLink);
    await sendMail(email, "Verify Your Email", emailTemp);

    return res.status(200).json({
      message: "Verification email sent! Check your inbox.",
      email: email,
    });
  } catch (error) {
    console.log("error in resend verification email", error);
    return res.status(500).json({
      message: "Failed to resend verification email",
      error: error.message,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  forgotPasswordController,
  updatePasswordController,
  verifyEmailController,
  resendVerificationEmailController,
  profileController: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      return res.status(200).json({
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      console.log("error in profile", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error,
      });
    }
  },
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
