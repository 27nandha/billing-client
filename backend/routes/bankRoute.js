import express from "express";
import {
  addBank,
  getAllBanks,
  setDefaultBank,
  getDefaultBank,
  deleteBank,
} from "../controllers/bankController.js";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";

const router = express.Router();

// Add a new bank account
router.post("/add", ensureAuthenticated, addBank);

// Get all bank accounts
router.get("/all", ensureAuthenticated, getAllBanks);

// Set a default bank account
router.put("/default/:id", ensureAuthenticated, setDefaultBank);

// Get the default bank account
router.get("/default", ensureAuthenticated, getDefaultBank);

// Delete a bank account
router.delete("/:id", ensureAuthenticated, deleteBank);

export default router;
