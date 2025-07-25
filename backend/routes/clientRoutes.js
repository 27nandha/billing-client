import express from "express";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";
import {
  addClient,
  deleteClient,
  getAllClients,
  updateClient,
  getClientStats,
} from "../controllers/clientControllers.js";

const router = express.Router();

router.get("/stats", getClientStats); // <-- This should be BEFORE any /:id route
router.post("/add", ensureAuthenticated, addClient);
router.get("/", ensureAuthenticated, getAllClients);
router.delete("/:id", ensureAuthenticated, deleteClient);
router.put("/:id", ensureAuthenticated, updateClient);

export default router;
