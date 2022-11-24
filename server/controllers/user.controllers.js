import User from "../models/User.model.js";
import sendJWTToken from "../utils/sendToken.js";

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 8 characters long",
    });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  const user = await User.create({ email, password });

  user.password = undefined;

  sendJWTToken(res, user, 201);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Email or password is incorrect or user does not exist",
    });
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: "Email or password is incorrect or user does not exist",
    });
  }

  user.password = undefined;

  sendJWTToken(res, user, 200);
};

export const logoutUser = async (_req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully",
  });
};

export const isLoggedIn = async (req, res) => {
  const user = await User.findById(req.user);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Unauthorized",
    });
  }

  res.status(200).json({
    success: true,
    message: "Welcome",
    user,
  });
};
