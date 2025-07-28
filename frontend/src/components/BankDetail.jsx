import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const BankDetail = () => {
  const [form, setForm] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
  });

  const [banks, setBanks] = useState([]);

  const fetchBanks = async () => {
    try {
      const { data } = await axios.get("/api/bank/all", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      setBanks(data);
    } catch (err) {
      toast.error("Failed to fetch bank accounts");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { accountHolder, accountNumber, ifscCode, bankName, branch } = form;
    if (!accountHolder || !accountNumber || !ifscCode || !bankName || !branch) {
      return toast.error("All fields are required");
    }

    try {
      const { data } = await axios.post("/api/bank/add", form, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });

      toast.success("Bank account added");
      setForm({
        accountHolder: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branch: "",
      });
      fetchBanks();
    } catch (err) {
      toast.error("Error adding bank");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/bank/${id}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      toast.success("Bank deleted");
      fetchBanks();
    } catch (err) {
      toast.error("Error deleting bank");
    }
  };

  const setAsDefault = async (id) => {
    try {
      await axios.put(
        `/api/bank/default/${id}`,
        {},
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        }
      );
      toast.success("Set as default bank");
      fetchBanks();
    } catch (err) {
      toast.error("Failed to set default");
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
            Manage Bank Details
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Bank Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Add New Bank Account
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  "accountHolder",
                  "accountNumber",
                  "ifscCode",
                  "bankName",
                  "branch",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${field}`}
                      value={form[field]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-800 transition text-white py-2 rounded-md font-medium shadow-md"
                >
                  + Add Bank Account
                </button>
              </form>
            </div>

            {/* Bank List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Existing Bank Accounts
              </h2>
              <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {banks.length === 0 && (
                  <li className="text-gray-500 text-center py-8">
                    No bank accounts found.
                  </li>
                )}
                {banks.map((bank) => (
                  <li
                    key={bank._id}
                    className="flex justify-between items-start gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow transition-all"
                  >
                    <div className="flex-1 text-sm">
                      <p className="text-lg font-medium text-gray-800">
                        {bank.accountHolder}
                      </p>
                      <p>Account No: {bank.accountNumber}</p>
                      <p>IFSC: {bank.ifscCode}</p>
                      <p>Bank: {bank.bankName}</p>
                      <p>Branch: {bank.branch}</p>
                      {bank.isDefault && (
                        <span className="inline-block mt-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!bank.isDefault && (
                        <button
                          onClick={() => setAsDefault(bank._id)}
                          className="text-blue-600 hover:text-blue-800 text-xs border border-blue-100 rounded-md px-3 py-1 hover:bg-blue-50"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(bank._id)}
                        className="text-red-600 hover:text-red-700 text-xs border border-red-100 rounded-md px-3 py-1 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BankDetail;
