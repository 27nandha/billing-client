import express from "express";
import {
  addBill,
  getAllBills,
  getBillById,
  downloadBillPdf,
  updateBillStatus,
  getInvoiceStats,
  getClientStats,
} from "../controllers/billController.js";
import { ensureAuthenticated } from "../middlewares/productAuthMiddle.js";

const router = express.Router();

router.get("/stats", getInvoiceStats);
router.post("/add", ensureAuthenticated, addBill);
router.get("/all", ensureAuthenticated, getAllBills);
router.get("/:id", ensureAuthenticated, getBillById);
router.get("/pdf/:billId", ensureAuthenticated, downloadBillPdf);
router.patch("/:id/status", ensureAuthenticated, updateBillStatus);

export default router;
