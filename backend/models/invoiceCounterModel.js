import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
