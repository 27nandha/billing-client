// models/billModel.js
import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Partially Paid"],
      validate: {
        validator: function (value) {
          // Only validate if type is invoice
          return this.type === "invoice" ? !!value : true;
        },
        message: "Status is required for invoices.",
      },
    },

    taxRate: {
      type: Number,
      default: 18, // Default GST 18%
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    invoiceId: {
      type: String,
      unique: true,
      required: true,
    },
    subcompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcompany",
      required: true,
    },
    type: {
      type: String,
      enum: ["invoice", "quotation"],
      default: "invoice",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Bill", billSchema);
