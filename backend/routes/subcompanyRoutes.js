import express from "express";
import {
  addSubcompany,
  getSubcompanies,
} from "../controllers/subcompanyController.js";
const router = express.Router();

router.post("/add", addSubcompany);
router.get("/", getSubcompanies);

export default router;
