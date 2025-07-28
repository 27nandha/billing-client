import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  accountHolder: String,
  accountNumber: String,
  ifscCode: String,
  bankName: String,
  branch: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Bank", bankSchema);
