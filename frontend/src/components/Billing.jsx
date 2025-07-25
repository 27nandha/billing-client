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
  const [taxRate, setTaxRate] = useState(18);
  const [subcompanies, setSubcompanies] = useState([]);
  const [selectedSubcompany, setSelectedSubcompany] = useState("");

  const fetchClients = async () => {
    try {
      const { data } = await axios.get("/client?status=Active", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      });
      setClients(data.clients);
    } catch {
      toast.error("Failed to load clients");
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
    } catch {
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchClients();
    fetchServices();
    axios
      .get("/api/subcompany")
      .then((res) => setSubcompanies(res.data.subcompanies));
  }, []);

  const handleAddService = () => {
    if (!selectedService || quantity < 1) return;

    if (selectedServices.find((s) => s.service === selectedService)) {
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

  const printBill = async (billId) => {
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

      // Open PDF in a new tab and trigger print
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = function () {
          printWindow.focus();
          printWindow.print();
        };
      } else {
        toast.error("Popup blocked! Please allow popups for this site.");
      }
    } catch (err) {
      toast.error("PDF print failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedClient ||
      selectedServices.length === 0 ||
      !selectedSubcompany
    ) {
      toast.error("Client, services, and subcompany are required");
      return;
    }

    try {
      const subtotal = selectedServices.reduce((total, item) => {
        const srv = services.find((s) => s._id === item.service);
        return total + (srv?.price || 0) * item.quantity;
      }, 0);
      const taxAmount = (subtotal * taxRate) / 100;

      const { data } = await axios.post(
        "/api/bill/add",
        {
          client: selectedClient,
          services: selectedServices,
          status,
          taxRate,
          taxAmount,
          subcompany: selectedSubcompany, // <-- Add this line
        },
        {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
          },
        }
      );

      toast.success("Bill created successfully");
      setSelectedClient("");
      setSelectedServices([]);
      setSelectedSubcompany(""); // Optionally reset
      printBill(data.bill._id);
    } catch {
      toast.error("Failed to create bill");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
              Create New Bill
            </h1>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-8 border"
            >
              {/* Client */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2 shadow-sm"
                >
                  <option value="">-- Select Client --</option>
                  {clients
                    .filter((client) => client.status === "Active")
                    .map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Subcompany */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Subcompany
                </label>
                <select
                  value={selectedSubcompany}
                  onChange={(e) => setSelectedSubcompany(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none px-4 py-2 shadow-sm"
                >
                  <option value="">-- Select Subcompany --</option>
                  {subcompanies.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Services */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Add Services
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 px-4 py-2 shadow-sm"
                  >
                    <option value="">-- Select Service --</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-24 rounded-lg border-gray-300 px-3 py-2 shadow-sm"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow"
                  >
                    ➕ Add
                  </button>
                </div>
              </div>

              {/* Added Services List */}
              {selectedServices.length > 0 && (
                <div className="bg-gray-50 border rounded-lg p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Added Services
                  </h3>
                  <ul className="divide-y divide-gray-200">
                    {selectedServices.map((item, idx) => {
                      const srv = services.find((s) => s._id === item.service);
                      return (
                        <li
                          key={idx}
                          className="flex justify-between items-center py-2"
                        >
                          <span className="text-gray-700">
                            {srv?.name || "Unknown"} × {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedServices(
                                selectedServices.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Status & GST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Bill Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm focus:ring-blue-500"
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm"
                  />
                </div>
              </div>

              {/* Total Display */}
              {selectedServices.length > 0 &&
                (() => {
                  const subtotal = selectedServices.reduce((total, item) => {
                    const srv = services.find((s) => s._id === item.service);
                    return total + (srv?.price || 0) * item.quantity;
                  }, 0);
                  const gstAmount = (subtotal * taxRate) / 100;
                  const total = subtotal + gstAmount;

                  return (
                    <div className="text-right pt-4 border-t border-gray-200">
                      <div className="text-base text-gray-700">
                        Subtotal: ₹{subtotal.toFixed(2)}
                      </div>
                      <div className="text-base text-gray-700">
                        GST ({taxRate}%): ₹{gstAmount.toFixed(2)}
                      </div>
                      <div className="text-xl font-bold text-gray-800 mt-2">
                        Total: ₹{total.toFixed(2)}
                      </div>
                    </div>
                  );
                })()}

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-700 transition duration-200 text-white py-3 rounded-lg font-semibold text-lg shadow"
              >
                Submit Bill
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BillCreate;
