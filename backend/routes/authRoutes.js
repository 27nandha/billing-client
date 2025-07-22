import express from "express";
import { Login, Signup } from "../controllers/authControllers.js";
import {
  loginValidation,
  signUpValidation,
} from "../middlewares/authValidations.js";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";

const router = express.Router();

router.post("/register", signUpValidation, Signup);

router.post("/login", loginValidation, Login);

router.get("/verify", ensureAuthenticated, (req, res) => {
  res.status(200).json({ success: true, message: "Token valid" });
});

export default router;
