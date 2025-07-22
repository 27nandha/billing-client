import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existingUser = await userModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new userModel({ name, email, password });
    user.password = await bcrypt.hash(password, 10);

    await user.save();
    return res.status(201).json({ success: true, message: "User registered" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "error in getting registered" });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
        success: false,
        error: true,
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS only)
      sameSite: "None", // avoid cross-site blocking issues
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      error: false,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "error in login" });
  }
};
