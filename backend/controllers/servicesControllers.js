import Service from "../models/serviceModel.js";

// Add Service
export const addService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const service = new Service({ name, description, price, category });
    await service.save();

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({}).populate("category", "name");
    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Service
export const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Service deleted" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Service
export const updateService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Service updated",
      service: updated,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
