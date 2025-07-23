import express from "express";
import {
  addBill,
  getAllBills,
  getBillById,
  downloadBillPdf,
} from "../controllers/billController.js";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";

const router = express.Router();

router.post("/add", ensureAuthenticated, addBill);
router.get("/all", ensureAuthenticated, getAllBills);
router.get("/:id", ensureAuthenticated, getBillById);
router.get("/pdf/:billId", ensureAuthenticated, downloadBillPdf);

export default router;
