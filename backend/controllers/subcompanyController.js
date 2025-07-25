import Subcompany from "../models/subcompanyModel.js";

export const addSubcompany = async (req, res) => {
  try {
    const subcompany = new Subcompany(req.body);
    await subcompany.save();
    res.status(201).json({ success: true, subcompany });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSubcompanies = async (req, res) => {
  try {
    const subcompanies = await Subcompany.find();
    res.json({ subcompanies });
  } catch (error) {
    res.status(500).json({ subcompanies: [] });
  }
};
