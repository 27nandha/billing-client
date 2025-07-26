import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  type: { type: String, enum: ["invoice", "quotation"], required: true },
  seq: { type: Number, default: 0 },
});

invoiceCounterSchema.index({ year: 1, type: 1 }, { unique: true });

const InvoiceCounter = mongoose.model("InvoiceCounter", invoiceCounterSchema);
export default InvoiceCounter;
