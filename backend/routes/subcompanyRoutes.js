import express from "express";
import {
  addSubcompany,
  getSubcompanies,
  updateSubcompany,
} from "../controllers/subcompanyController.js";

const router = express.Router();

router.post("/add", addSubcompany);
router.get("/", getSubcompanies);
router.put("/:id", updateSubcompany); // 🔄 update

export default router;
