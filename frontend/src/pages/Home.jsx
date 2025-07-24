import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Home = () => {
  const [recentCategories, setRecentCategories] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [recentServices, setRecentServices] = useState([]);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    axios
      .get("/category", {
        headers: { Authorization: auth?.jwtToken },
      })
      .then((res) => {
        if (res.data.categories?.length > 0) {
          setRecentCategories(res.data.categories.slice(0, 2));
        }
      });

    axios
      .get("/client", {
        headers: { Authorization: auth?.jwtToken },
      })
      .then((res) => {
        if (res.data.clients?.length > 0) {
          setRecentClients(res.data.clients.slice(0, 2));
        }
      });

    axios
      .get("/service", {
        headers: { Authorization: auth?.jwtToken },
      })
      .then((res) => {
        if (res.data.services?.length > 0) {
          setRecentServices(res.data.services.slice(0, 2));
        }
      });
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">
            Dashboard Overview
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Categories Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <h2 className="text-lg font-semibold text-gray-700 mb-5 border-b pb-2">
                Recently Added Categories
              </h2>
              {recentCategories.length > 0 ? (
                <ul className="space-y-4">
                  {recentCategories.map((cat) => (
                    <li key={cat._id} className="flex flex-col">
                      <span className="text-base font-medium text-gray-800">
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {cat.description || "No description"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm mt-2">
                  No categories found.
                </p>
              )}
            </div>

            {/* Clients Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <h2 className="text-lg font-semibold text-gray-700 mb-5 border-b pb-2">
                Recently Added Clients
              </h2>
              {recentClients.length > 0 ? (
                <ul className="space-y-4">
                  {recentClients.map((client) => (
                    <li key={client._id} className="flex flex-col">
                      <span className="text-base font-medium text-gray-800">
                        {client.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {client.email}
                      </span>
                      <span className="text-sm text-gray-500">
                        {client.phone}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm mt-2">No clients found.</p>
              )}
            </div>

            {/* Services Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <h2 className="text-lg font-semibold text-gray-700 mb-5 border-b pb-2">
                Recently Added Services
              </h2>
              {recentServices.length > 0 ? (
                <ul className="space-y-4">
                  {recentServices.map((srv) => (
                    <li key={srv._id} className="flex flex-col">
                      <span className="text-base font-medium text-gray-800">
                        {srv.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ₹{srv.price} - {srv.category?.name || "No Category"}
                      </span>
                      {srv.description && (
                        <span className="text-sm text-gray-500">
                          {srv.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm mt-2">No services found.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
