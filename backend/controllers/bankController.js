import Bank from "../models/bankModel.js";

// @desc    Add a new bank account
// @route   POST /api/bank/add
// @access  Private
export const addBank = async (req, res) => {
  try {
    const { accountHolder, accountNumber, ifscCode, bankName, branch } =
      req.body;

    const newBank = new Bank({
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      branch,
    });

    await newBank.save();

    res
      .status(201)
      .json({ message: "Bank account added successfully", bank: newBank });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add bank account", error: err.message });
  }
};

// @desc    Get all bank accounts
// @route   GET /api/bank/all
// @access  Private
export const getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.find().sort({ isDefault: -1 }); // default on top
    res.status(200).json(banks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch banks", error: err.message });
  }
};

// @desc    Set a default bank account
// @route   PUT /api/bank/default/:id
// @access  Private
export const setDefaultBank = async (req, res) => {
  try {
    const { id } = req.params;

    // First unset all defaults
    await Bank.updateMany({}, { isDefault: false });

    // Then set the new default
    const updatedBank = await Bank.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true }
    );

    if (!updatedBank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res
      .status(200)
      .json({ message: "Default bank set successfully", bank: updatedBank });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to set default bank", error: err.message });
  }
};

// @desc    Get the default bank account
// @route   GET /api/bank/default
// @access  Private
export const getDefaultBank = async (req, res) => {
  try {
    const defaultBank = await Bank.findOne({ isDefault: true });

    if (!defaultBank) {
      return res.status(404).json({ message: "No default bank found" });
    }

    res.status(200).json(defaultBank);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch default bank", error: err.message });
  }
};

// @desc    Delete a bank account
// @route   DELETE /api/bank/:id
// @access  Private
export const deleteBank = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBank = await Bank.findByIdAndDelete(id);

    if (!deletedBank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete bank", error: err.message });
  }
};
