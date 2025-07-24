import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 5; // entries per page

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstnumber: "",
    clientType: "Individual",
    status: "Active",
  });
  const [editingId, setEditingId] = useState(null);

  const auth = JSON.parse(localStorage.getItem("auth"));

  // 🔃 Fetch all clients
  const fetchClients = async () => {
    try {
      const { data } = await axios.get(
        `/client?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`,
        {
          headers: { Authorization: auth?.jwtToken },
        }
      );
      setClients(data.clients);
      setTotal(data.total);
    } catch (error) {
      toast.error("Error loading clients");
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, [page, search]);

  // 📝 Handle Input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Add or Update Client
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone } = formData;
    if (!name || !email || !phone) {
      return toast.error("Name, email and phone are required");
    }

    try {
      if (editingId) {
        // update
        const { data } = await axios.put(`/client/${editingId}`, formData, {
          headers: { Authorization: auth?.jwtToken },
        });
        toast.success(data.message);
        setEditingId(null);
      } else {
        // create
        const { data } = await axios.post("/client/add", formData, {
          headers: { Authorization: auth?.jwtToken },
        });
        toast.success(data.message);
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        gstnumber: "",
        clientType: "Individual",
        status: "Active",
      });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // 🗑️ Delete client
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/client/${id}`, {
        headers: { Authorization: auth?.jwtToken },
      });
      toast.success("Client deleted");
      fetchClients();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ✏️ Edit
  const handleEdit = (client) => {
    setFormData({ ...client });
    setEditingId(client._id);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
              {editingId ? "Edit Client" : "Add Client"}
            </h1>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-white p-8 rounded-xl shadow"
            >
              <input
                type="text"
                name="name"
                placeholder="Client Name"
                value={formData.name}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Client Email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="gstnumber"
                placeholder="GST Number (optional)"
                value={formData.gstnumber}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Individual</option>
                <option>Company</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <button
                type="submit"
                className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded font-semibold mt-2"
              >
                {editingId ? "Update Client" : "Add Client"}
              </button>
            </form>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">
                Client List
              </h2>
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded focus:outline-none"
                style={{ minWidth: 220 }}
              />
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow">
              <table className="min-w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 font-medium text-gray-700">Name</th>
                    <th className="p-3 font-medium text-gray-700">Email</th>
                    <th className="p-3 font-medium text-gray-700">Phone</th>
                    <th className="p-3 font-medium text-gray-700">Type</th>
                    <th className="p-3 font-medium text-gray-700">Status</th>
                    <th className="p-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No clients found.
                      </td>
                    </tr>
                  )}
                  {clients.map((client) => (
                    <tr
                      key={client._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{client.name}</td>
                      <td className="p-3">{client.email}</td>
                      <td className="p-3">{client.phone}</td>
                      <td className="p-3">{client.clientType}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            client.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => (prev < total / limit ? prev + 1 : prev))
                }
                disabled={page >= total / limit}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Client;
