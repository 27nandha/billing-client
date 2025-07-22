import Client from "../models/clientModel.js";

export const addClient = async (req, res) => {
  try {
    const { name, email, phone, gstnumber, clientType, status } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Client Already exist" });
    }
    const client = new Client({
      name,
      email,
      phone,
      gstnumber,
      clientType,
      status,
    });
    await client.save();
    res
      .status(201)
      .json({ success: true, message: "Client added successfully", client });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching clients" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting client" });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedClient = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedClient) {
      return res.status(404).json({ message: "Client Not Found" });
    }
    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update client",
    });
  }
};
