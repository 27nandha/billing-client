import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const BillCreate = () => {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState("");

  const fetchClients = async () => {
    try {
      const { data } = await axios.get("/client", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      setClients(data.clients);
    } catch (err) {
      toast.error("Failed to load clients");
    }
  };
  const downloadBill = async (billId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/bill/pdf/${billId}`,
        {
          responseType: "blob",
          withCredentials: true,
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${billId}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("PDF download failed");
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get("/service", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      setServices(data.services);
    } catch (err) {
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchClients();
    fetchServices();
  }, []);

  const handleAddService = () => {
    if (!selectedService || quantity < 1) return;
    const exists = selectedServices.find((s) => s.service === selectedService);
    if (exists) {
      toast.error("Service already added");
      return;
    }

    setSelectedServices([
      ...selectedServices,
      { service: selectedService, quantity: parseInt(quantity) },
    ]);
    setSelectedService("");
    setQuantity(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient || selectedServices.length === 0) {
      toast.error("Client and services are required");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/bill/add",
        {
          client: selectedClient,
          services: selectedServices,
          status,
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        }
      );

      toast.success("Bill created successfully");

      // Reset form
      setSelectedClient("");
      setSelectedServices([]);

      // Automatically open PDF
      downloadBill(data.bill._id);
    } catch (err) {
      toast.error("Failed to create bill");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Bill</h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow space-y-6"
          >
            {/* Client dropdown */}
            <div>
              <label className="block text-gray-700 mb-1">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service selector */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-24 border border-gray-300 p-2 rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddService}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Display selected services */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Selected Services
              </h3>
              {selectedServices.length === 0 && (
                <p className="text-sm text-gray-500">No services added yet.</p>
              )}
              <ul className="space-y-2">
                {selectedServices.map((item, idx) => {
                  const srv = services.find((s) => s._id === item.service);
                  return (
                    <li
                      key={idx}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <span>
                        {srv?.name || "Unknown"} × {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedServices(
                            selectedServices.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <label className="block mb-1">Bill Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">Select Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
            </select>
            {selectedServices.length > 0 && (
              <div className="text-right text-lg font-semibold text-gray-700">
                Total: ₹
                {selectedServices.reduce((total, item) => {
                  const srv = services.find((s) => s._id === item.service);
                  return total + (srv?.price || 0) * item.quantity;
                }, 0)}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Submit Bill
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default BillCreate;
