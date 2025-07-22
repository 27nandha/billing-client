import express from "express";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";

const productRouter = express.Router();

productRouter.get("/", ensureAuthenticated, (req, res) => {
  res.status(200).json({ success: true, message: "Products working" });
});

export default productRouter;
