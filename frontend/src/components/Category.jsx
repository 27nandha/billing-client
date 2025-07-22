import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Category = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);

  // Fetch categories
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
      console.error(error);
    }
  };

  // Add new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Name is required");

    try {
      const { data } = await axios.post(
        "/category/add",
        { name, description },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        }
      );

      if (data.success) {
        toast.success("Category added");
        setName("");
        setDescription("");
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding category");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/category/${id}`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Manage Categories
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Add New Category
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded w-full font-semibold"
                >
                  Add Category
                </button>
              </form>
            </div>
            {/* Categories List */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                All Categories
              </h2>
              <ul className="space-y-4 max-h-[400px] overflow-y-auto">
                {categories.length === 0 && (
                  <li className="text-gray-500 text-center">
                    No categories found.
                  </li>
                )}
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex justify-between items-center border border-gray-200 rounded-lg p-4 hover:shadow transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{cat.name}</p>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
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

export default Category;
