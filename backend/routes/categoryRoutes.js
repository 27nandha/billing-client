import express from "express";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";
import { addCategory, deleteCategory, getAllCategories } from "../controllers/categoryControllers.js";

const router = express.Router();

router.post("/add", ensureAuthenticated, addCategory);
router.get("/", ensureAuthenticated, getAllCategories);
router.delete("/:id", ensureAuthenticated, deleteCategory);

export default router;
