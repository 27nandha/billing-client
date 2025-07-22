import express from "express";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";
import {
  addService,
  getAllServices,
  deleteService,
  updateService,
} from "../controllers/servicesControllers.js";

const router = express.Router();

router.post("/add", ensureAuthenticated, addService);
router.get("/", ensureAuthenticated, getAllServices);
router.delete("/:id", ensureAuthenticated, deleteService);
router.put("/:id", ensureAuthenticated, updateService);

export default router;
