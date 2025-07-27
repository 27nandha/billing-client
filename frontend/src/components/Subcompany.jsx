import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Subcompany = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    gstNumber: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [subcompanies, setSubcompanies] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/subcompany/${editingId}`, form);
        toast.success("Subcompany updated successfully");
      } else {
        await axios.post("/api/subcompany/add", form);
        toast.success("Subcompany added successfully");
      }

      setForm({
        name: "",
        address: "",
        gstNumber: "",
        phone: "",
        email: "",
      });
      setEditingId(null);
      fetchSubcompanies(); // refresh list
    } catch {
      toast.error("Failed to submit");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (sub) => {
    setForm({
      name: sub.name,
      address: sub.address,
      gstNumber: sub.gstNumber,
      phone: sub.phone,
      email: sub.email,
    });
    setEditingId(sub._id);
  };
  const handleCancelEdit = () => {
    setForm({
      name: "",
      address: "",
      gstNumber: "",
      phone: "",
      email: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    fetchSubcompanies();
  }, []);

  const fetchSubcompanies = async () => {
    try {
      const res = await axios.get("/api/subcompany");
      setSubcompanies(res.data.subcompanies);
    } catch (err) {
      toast.error("Failed to load subcompanies");
    }
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-50 min-h-screen">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
              Add Subcompany
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcompany Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter subcompany name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="Enter GST number"
                  value={form.gstNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="mb-4 text-sm text-blue-600 underline"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-all duration-200"
              >
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                  ? "Update Subcompany"
                  : "Add Subcompany"}
              </button>
            </form>

            <h3 className="text-xl font-semibold mt-10 mb-4 text-gray-700">
              All Subcompanies
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">GST</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcompanies.map((sub) => (
                    <tr key={sub._id} className="border-b">
                      <td className="p-2">{sub.name}</td>
                      <td className="p-2">{sub.email}</td>
                      <td className="p-2">{sub.phone}</td>
                      <td className="p-2">{sub.gstNumber}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Subcompany;
