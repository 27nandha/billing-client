import Bill from "../models/billModel.js";
import { generateBillPdf } from "../utils/generateBillPdf.js";
import Service from "../models/serviceModel.js";
import Client from "../models/clientModel.js";
import InvoiceCounter from "../models/invoiceCounterModel.js";

// Add Bill

export const addBill = async (req, res) => {
  try {
    const {
      client,
      services,
      status,
      taxRate = 18,
      taxAmount,
      subcompany,
      type = "invoice",
    } = req.body;

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

    for (const item of services) {
      const service = await Service.findById(item.service);
      if (!service) continue;

      const unitPrice = item.unitPrice ?? item.price ?? service.price;
      const quantity = item.quantity ?? 1;

      formattedServices.push({
        service: service._id,
        name: item.name || service.name,
        quantity,
        unitPrice,
      });

      totalAmount += quantity * unitPrice;
    }

    // Calculate tax if not provided
    const calculatedTaxAmount =
      typeof taxAmount === "number" ? taxAmount : (totalAmount * taxRate) / 100;

    // Get current year (last 2 digits)
    const now = new Date();
    const year = now.getFullYear();
    const yearShort = year.toString().slice(-2);

    // Find or create counter for this year
    // Separate counter per year and type (invoice or quotation)
    let counter = await InvoiceCounter.findOne({ year, type });

    if (!counter) {
      counter = await InvoiceCounter.create({ year, type, seq: 1 });
    } else {
      counter.seq += 1;
      await counter.save();
    }

    // Format invoice/quotation number
    const seqStr = counter.seq.toString().padStart(3, "0");
    const prefix = type === "quotation" ? "QT" : "INV";
    const invoiceId = `RBS/${yearShort}/${prefix}/${seqStr}`;

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
      subcompany,
      type,
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
    const { search = "", status = "all", type = "" } = req.query;

    const query = { createdBy: req.user._id };

    // ✅ Add type filtering
    if (type && ["invoice", "quotation"].includes(type)) {
      query.type = type;
    }

    // ✅ Add status filter if not "all"
    if (status !== "all") {
      query.status = status;
    }

    // ✅ Search by invoiceId or client name
    if (search.trim() !== "") {
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
        .populate("subcompany")
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
    const bill = await Bill.findById(req.params.id)
      .populate("client")
      .populate("services.service")
      .populate("subcompany"); // <-- Add this
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ bill });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const downloadBillPdf = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findOne({ _id: billId, createdBy: req.user._id })
      .populate("client")
      .populate("services.service")
      .populate("subcompany");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Get all services used in the bill
    const serviceIds = bill.services.map((s) => s.service._id || s.service);
    const servicesList = await Service.find({ _id: { $in: serviceIds } });

    res.setHeader("Content-Type", "application/pdf");
    const fileType = bill.type === "quotation" ? "Quotation" : "Invoice";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileType}-${billId}.pdf`
    );

    const client = bill.client;
    const subcompany = bill.subcompany;

    const allServices = await Service.find({}); // fetch fresh data
    generateBillPdf(res, bill, client, allServices, subcompany);
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

export const getInvoiceStats = async (req, res) => {
  try {
    const stats = await Bill.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ stats: [] });
  }
};

export const getClientStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ stats: [] });
  }
};
