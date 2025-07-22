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

    // Fetch most recent categories
    axios
      .get("/category", {
        headers: { Authorization: auth?.jwtToken },
      })
      .then((res) => {
        if (res.data.categories?.length > 0) {
          setRecentCategories(res.data.categories.slice(0, 2));
        }
      });

    // Fetch most recent clients
    axios
      .get("/client", {
        headers: { Authorization: auth?.jwtToken },
      })
      .then((res) => {
        if (res.data.clients?.length > 0) {
          setRecentClients(res.data.clients.slice(0, 2));
        }
      });

    // Fetch most recent services
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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recently Added Categories */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Recently Added Categories
              </h2>
              {recentCategories.length > 0 ? (
                <ul className="space-y-3">
                  {recentCategories.map((cat, idx) => (
                    <li key={cat._id} className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {cat.name}
                      </span>
                      {idx === 0 && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          New
                        </span>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        {cat.description}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No categories found.</p>
              )}
            </div>

            {/* Recently Added Clients */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Recently Added Clients
              </h2>
              {recentClients.length > 0 ? (
                <ul className="space-y-3">
                  {recentClients.map((client, idx) => (
                    <li key={client._id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {client.name}
                        </span>
                        {idx === 0 && (
                          <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            New
                          </span>
                        )}
                      </div>
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
                <p className="text-gray-400">No clients found.</p>
              )}
            </div>
          </div>

          {/* Recently Added Services */}
          <div className="mt-10 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Recently Added Services
            </h2>
            {recentServices.length > 0 ? (
              <ul className="space-y-3">
                {recentServices.map((srv, idx) => (
                  <li key={srv._id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {srv.name}
                      </span>
                      {idx === 0 && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          New
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      ₹{srv.price} - {srv.category?.name}
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
              <p className="text-gray-400">No services found.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
