import Bill from "../models/billModel.js";
import { generateBillPdf } from "../utils/generateBillPdf.js";
import Service from "../models/serviceModel.js";
import Client from "../models/clientModel.js";

// Add Bill

export const addBill = async (req, res) => {
  try {
    const { client, services, status } = req.body;

    if (!client || !services || services.length === 0) {
      return res
        .status(400)
        .json({ message: "Client and services are required" });
    }

    // Validate status if provided
    const validStatuses = ["Paid", "Unpaid", "Partially Paid"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid bill status" });
    }

    let totalAmount = 0;
    const formattedServices = [];

    for (let item of services) {
      const service = await Service.findById(item.service);
      if (!service) {
        return res
          .status(404)
          .json({ message: "One or more services not found" });
      }
      const subtotal = service.price * item.quantity;
      totalAmount += subtotal;

      formattedServices.push({
        service: service._id,
        quantity: item.quantity,
      });
    }

    const bill = new Bill({
      client,
      services: formattedServices,
      totalAmount,
      createdBy: req.user._id,
      status: status || "Unpaid", // use provided or default
    });

    await bill.save();

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Bills
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({ createdBy: req.user._id })
      .populate("client")
      .populate("services.service")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bills });
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Single Bill
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findOne({ _id: id, createdBy: req.user._id })
      .populate("client")
      .populate("services.service");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({ success: true, bill });
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const downloadBillPdf = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findOne({ _id: billId, createdBy: req.user._id })
      .populate("client")
      .populate("services.service");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Get all services used in the bill
    const serviceIds = bill.services.map((s) => s.service._id || s.service);
    const servicesList = await Service.find({ _id: { $in: serviceIds } });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${billId}.pdf`
    );

    generateBillPdf(res, bill, bill.client, servicesList);
  } catch (error) {
    console.error("Error generating PDF:", error); // This will show the real error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
