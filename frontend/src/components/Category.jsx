import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Category = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);

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
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding category");
    }
  };

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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
            Manage Categories
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Category Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Add New Category
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium shadow-md"
                >
                  + Add Category
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Existing Categories
              </h2>
              <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {categories.length === 0 && (
                  <li className="text-gray-500 text-center py-8">
                    No categories found.
                  </li>
                )}
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex justify-between items-start gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow transition-all"
                  >
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-800">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-600 hover:text-red-700 transition font-medium text-sm px-3 py-1 border border-red-100 rounded-md hover:bg-red-50"
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
