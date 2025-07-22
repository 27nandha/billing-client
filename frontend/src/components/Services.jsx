import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Fetch all services
  const fetchServices = async () => {
    try {
      const { data } = await axios.get("/service", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      setServices(data.services);
    } catch (error) {
      toast.error("Failed to fetch services");
      console.error(error);
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/category", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      setCategories(data.categories);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Handle add/update form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, category } = form;

    if (!name || !price || !category)
      return toast.error("Name, Price and Category are required");

    try {
      if (editingServiceId) {
        // Update
        const { data } = await axios.put(`/service/${editingServiceId}`, form, {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        });
        toast.success("Service updated successfully");
      } else {
        // Add
        const { data } = await axios.post("/service/add", form, {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        });
        toast.success("Service added successfully");
      }

      // Reset form
      setForm({ name: "", description: "", price: "", category: "" });
      setEditingServiceId(null);
      fetchServices();
    } catch (error) {
      toast.error("Failed to save service");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/service/${id}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      toast.success("Service deleted");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  // Handle edit
  const handleEdit = (srv) => {
    setEditingServiceId(srv._id);
    setForm({
      name: srv.name,
      description: srv.description,
      price: srv.price,
      category: srv.category._id,
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Manage Services
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                {editingServiceId ? "Edit Service" : "Add New Service"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Service Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded w-full font-semibold"
                >
                  {editingServiceId ? "Update Service" : "Add Service"}
                </button>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: "", description: "", price: "", category: "" });
                      setEditingServiceId(null);
                    }}
                    className="mt-2 text-gray-500 hover:underline text-sm"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            {/* List Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                All Services
              </h2>
              <ul className="space-y-4 max-h-[500px] overflow-y-auto">
                {services.length === 0 && (
                  <li className="text-gray-500 text-center">
                    No services found.
                  </li>
                )}
                {services.map((srv) => (
                  <li
                    key={srv._id}
                    className="flex justify-between items-center border border-gray-200 rounded-lg p-4 hover:shadow transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{srv.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{srv.price} - {srv.category?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {srv.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(srv)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(srv._id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
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

export default Services;
