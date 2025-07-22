import express from "express";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js"; // assuming middleware
import {
  addClient,
  deleteClient,
  getAllClients,
  updateClient,
} from "../controllers/clientControllers.js";

const router = express.Router();

router.post("/add", ensureAuthenticated, addClient);
router.get("/", ensureAuthenticated, getAllClients);
router.delete("/:id", ensureAuthenticated, deleteClient);
router.put("/:id", ensureAuthenticated, updateClient);

export default router;