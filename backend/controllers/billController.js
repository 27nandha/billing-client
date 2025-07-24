import Bill from "../models/billModel.js";
import { generateBillPdf } from "../utils/generateBillPdf.js";
import Service from "../models/serviceModel.js";
import Client from "../models/clientModel.js";
import InvoiceCounter from "../models/invoiceCounterModel.js";

// Add Bill

export const addBill = async (req, res) => {
  try {
    const { client, services, status, taxRate = 18, taxAmount } = req.body;

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

    // Calculate tax if not provided
    const calculatedTaxAmount =
      taxAmount !== undefined
        ? taxAmount
        : (totalAmount * (taxRate || 18)) / 100;

    // Get current year (last 2 digits)
    const now = new Date();
    const year = now.getFullYear();
    const yearShort = year.toString().slice(-2);

    // Find or create counter for this year
    let counter = await InvoiceCounter.findOne({ year });
    if (!counter) {
      counter = await InvoiceCounter.create({ year, seq: 1 });
    } else {
      counter.seq += 1;
      await counter.save();
    }

    // Format the sequence as 3 digits, e.g., 001, 002
    const seqStr = counter.seq.toString().padStart(3, "0");
    const invoiceId = `RBS/${yearShort}/QT/${seqStr}`;

    // Create the bill with the generated invoiceId
    const bill = new Bill({
      client,
      services: formattedServices,
      totalAmount: totalAmount + calculatedTaxAmount,
      createdBy: req.user._id,
      status: status || "Unpaid",
      taxRate: taxRate || 18,
      taxAmount: calculatedTaxAmount,
      invoiceId,
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search = "", status = "all" } = req.query;

    const query = { createdBy: req.user._id };

    if (status !== "all") {
      query.status = status;
    }

    if (search.trim() !== "") {
      // Fix: search by client name via client IDs
      const matchingClients = await Client.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const clientIds = matchingClients.map((c) => c._id);

      query.$or = [
        { invoiceId: { $regex: search, $options: "i" } },
        { client: { $in: clientIds } },
      ];
    }

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .populate("client")
        .populate("services.service")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bill.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      bills,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
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

export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.status = status;
    await bill.save();

    res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
