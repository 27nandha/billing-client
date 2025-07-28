import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Select from "react-select";

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
  const [type, setType] = useState("invoice");
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [sgst, setSgst] = useState(9);
  const [cgst, setCgst] = useState(9);
  const [igst, setIgst] = useState(0);

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

    // Fetch categories for inline add-service
    axios
      .get("/category", {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("auth"))?.jwtToken,
        },
      })
      .then((res) => setCategories(res.data.categories))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (selectedClient && selectedSubcompany) {
      const clientObj = clients.find((c) => c._id === selectedClient);
      const subcompanyObj = subcompanies.find(
        (s) => s._id === selectedSubcompany
      );

      if (clientObj && subcompanyObj) {
        if (clientObj.state === subcompanyObj.state) {
          setSgst(9);
          setCgst(9);
          setIgst(0);
        } else {
          setSgst(0);
          setCgst(0);
          setIgst(18);
        }
      }
    }
  }, [selectedClient, selectedSubcompany, clients, subcompanies]);
  const handleAddService = () => {
    if (!selectedService || quantity < 1) return;

    if (selectedServices.find((s) => s.service === selectedService)) {
      toast.error("Service already added");
      return;
    }
    const srv = services.find((s) => s._id === selectedService);
    if (!srv) return toast.error("Selected service not found");

    setSelectedServices([
      ...selectedServices,
      {
        service: selectedService,
        quantity: parseInt(quantity),
        price: srv.price, // ⬅ snapshot the price now
      },
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
      const auth = JSON.parse(localStorage.getItem("auth"));
      const user = auth?.user;

      const subtotal = selectedServices.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const taxType = igst > 0 ? "IGST" : "CGST_SGST";
      const taxAmount = (subtotal * taxRate) / 100;
      const finalServices = selectedServices.map((item) => {
        const srv = services.find((s) => s._id === item.service);
        return {
          service: item.service,
          quantity: item.quantity,
          unitPrice: item.price, // <- This should match the field used in backend
          name: srv?.name || "Service",
        };
      });

      const { data } = await axios.post(
        "/api/bill/add",
        {
          client: selectedClient,
          services: finalServices,
          status: type === "invoice" ? status : undefined,
          subcompany: selectedSubcompany,
          type,
          taxRate,
          taxAmount,
          cgstRate: cgst,
          sgstRate: sgst,
          igstRate: igst,
          taxType, // <-- important!
        },
        {
          headers: {
            Authorization: auth?.jwtToken,
          },
        }
      );

      toast.success("Bill created successfully");
      setSelectedClient("");
      setSelectedServices([]);
      setSelectedSubcompany("");
      printBill(data.bill._id);
    } catch {
      toast.error("Failed to create bill");
    }
  };

  const clientOptions = clients.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.email})`,
  }));

  const serviceOptions = services.map((s) => ({
    value: s._id,
    label: `${s.name} - ₹${s.price}`,
  }));

  const subcompanyOptions = subcompanies.map((sc) => ({
    value: sc._id,
    label: sc.name,
  }));
  const categoryOptions = categories.map((cat) => ({
    value: cat._id, // or cat.name based on your schema
    label: cat.name,
  }));
  const subtotal = selectedServices.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const gstAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + gstAmount;
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
                <Select
                  options={clientOptions}
                  value={
                    selectedClient
                      ? clientOptions.find(
                          (opt) => opt.value === selectedClient
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setSelectedClient(selected?.value || "")
                  }
                  className="flex-1"
                  placeholder="Select Client"
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      padding: "2px",
                      boxShadow: "none",
                      borderColor: "#d1d5db",
                      "&:hover": { borderColor: "#3b82f6" },
                    }),
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowAddClientForm(!showAddClientForm)}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  {showAddClientForm
                    ? "− Hide Add Client"
                    : "➕ Add New Client"}
                </button>
                {showAddClientForm && (
                  <div className="bg-gray-50 p-4 rounded mt-4 border space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Add Client
                    </h4>
                    <input
                      type="text"
                      placeholder="Client Name"
                      value={newClient.name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="email"
                      placeholder="Client Email"
                      value={newClient.email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Client Phone"
                      value={newClient.phone}
                      onChange={(e) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                    <button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      onClick={async () => {
                        const { name, email, phone } = newClient;
                        if (!name || !email || !phone) {
                          toast.error("Name, email, and phone are required");
                          return;
                        }

                        try {
                          const res = await axios.post(
                            "/client/add",
                            {
                              ...newClient,
                              gstnumber: "",
                              clientType: "Individual",
                              status: "Active",
                            },
                            {
                              headers: {
                                Authorization: JSON.parse(
                                  localStorage.getItem("auth")
                                )?.jwtToken,
                              },
                            }
                          );

                          toast.success("Client added");
                          setNewClient({ name: "", email: "", phone: "" });
                          setShowAddClientForm(false);
                          fetchClients(); // refresh dropdown
                          setSelectedClient(res.data.client._id); // ✅ Now this works
                        } catch (error) {
                          toast.error("Failed to add client");
                        }
                      }}
                    >
                      Add Client
                    </button>
                  </div>
                )}
              </div>

              {/* Subcompany */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Subcompany
                </label>
                <Select
                  className="w-full"
                  options={subcompanyOptions}
                  value={
                    subcompanyOptions.find(
                      (opt) => opt.value === selectedSubcompany
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    setSelectedSubcompany(selectedOption?.value)
                  }
                  placeholder="-- Select Subcompany --"
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      padding: "2px",
                      boxShadow: "none",
                      borderColor: "#d1d5db", // Tailwind border-gray-300
                      "&:hover": { borderColor: "#3b82f6" }, // Tailwind blue-500
                    }),
                  }}
                />
              </div>

              {/* Services */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Add Services
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <Select
                    className="flex-1"
                    options={serviceOptions}
                    value={
                      serviceOptions.find(
                        (opt) => opt.value === selectedService
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setSelectedService(selectedOption?.value)
                    }
                    placeholder="-- Select Service --"
                    isSearchable
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        padding: "2px",
                        boxShadow: "none",
                        borderColor: "#d1d5db", // Tailwind border-gray-300
                        "&:hover": { borderColor: "#3b82f6" }, // Tailwind blue-500
                      }),
                    }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={quantity || 1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuantity(val > 0 ? val : 1);
                    }}
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
                {/* Toggle Add Service Form */}
                <div className=" mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {showAddServiceForm
                      ? "− Hide Add Service"
                      : "➕ Add New Service"}
                  </button>
                </div>

                {showAddServiceForm && (
                  <div className="mt-4 border p-4 rounded-lg bg-gray-50 space-y-3">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm">
                      Add Service
                    </h4>

                    <input
                      type="text"
                      placeholder="Service Name"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />

                    <textarea
                      placeholder="Description"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded"
                    />

                    <input
                      type="number"
                      placeholder="Price"
                      value={newService.price}
                      onChange={(e) =>
                        setNewService({ ...newService, price: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />

                    <Select
                      className="w-full"
                      value={
                        categoryOptions.find(
                          (option) => option.value === newService.category
                        ) || null
                      }
                      onChange={(selected) =>
                        setNewService({
                          ...newService,
                          category: selected?.value || "",
                        })
                      }
                      options={categoryOptions}
                      placeholder="Select Category"
                      isSearchable
                      styles={{
                        control: (base) => ({
                          ...base,
                          padding: "2px",
                          borderRadius: "0.375rem",
                          borderColor: "#d1d5db", // Tailwind border-gray-300
                          boxShadow: "none",
                          "&:hover": { borderColor: "#3b82f6" }, // Tailwind blue-500
                        }),
                      }}
                    />

                    <button
                      type="button"
                      onClick={async () => {
                        const { name, price, category } = newService;
                        if (!name || !price || !category) {
                          toast.error("Name, Price & Category are required");
                          return;
                        }

                        try {
                          const res = await axios.post(
                            "/service/add",
                            {
                              ...newService,
                              category,
                            },
                            {
                              headers: {
                                Authorization: JSON.parse(
                                  localStorage.getItem("auth")
                                )?.jwtToken,
                              },
                            }
                          );

                          toast.success("Service added");
                          setNewService({
                            name: "",
                            description: "",
                            price: "",
                          });
                          setShowAddServiceForm(false);
                          fetchServices();
                          setSelectedService(res.data.service._id); // ✅ Now this works
                        } catch (error) {
                          toast.error("Failed to add service");
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Add Service
                    </button>
                  </div>
                )}
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
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <span className="text-gray-700 font-medium">
                              {srv?.name || "Unknown"}
                            </span>
                            <span className="text-gray-600 text-sm flex items-center gap-1">
                              {/* Decrease button */}
                              <button
                                type="button"
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => {
                                  const updated = [...selectedServices];
                                  if (updated[idx].quantity > 1) {
                                    updated[idx].quantity -= 1;
                                    setSelectedServices(updated);
                                  }
                                }}
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              {/* Quantity display */}
                              {item.quantity}
                              {/* Increase button */}
                              <button
                                type="button"
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => {
                                  const updated = [...selectedServices];
                                  updated[idx].quantity += 1;
                                  setSelectedServices(updated);
                                }}
                              >
                                +
                              </button>
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...selectedServices];
                                updated[idx].price = parseFloat(e.target.value);
                                setSelectedServices(updated);
                              }}
                              className="w-24 px-2 py-1 border rounded shadow-sm"
                            />
                          </div>

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
                    Document Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm"
                  >
                    <option value="invoice">Invoice</option>
                    <option value="quotation">Quotation</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    GST Rate (%)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={igst > 0 ? `${igst}` : `${cgst + sgst}`}
                    className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    GST Type
                  </label>
                  <select
                    value={igst > 0 ? "IGST" : "CGST_SGST"}
                    onChange={(e) => {
                      if (e.target.value === "IGST") {
                        setIgst(18);
                        setCgst(0);
                        setSgst(0);
                      } else {
                        setIgst(0);
                        setCgst(9);
                        setSgst(9);
                      }
                    }}
                    className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm"
                  >
                    <option value="CGST_SGST">CGST/SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>
                {igst === 0 && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        CGST Rate (%)
                      </label>
                      <input
                        type="number"
                        value={cgst}
                        onChange={(e) => setCgst(Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        SGST Rate (%)
                      </label>
                      <input
                        type="number"
                        value={sgst}
                        onChange={(e) => setSgst(Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm"
                      />
                    </div>
                  </>
                )}
                {igst > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      IGST Rate (%)
                    </label>
                    <input
                      type="number"
                      value={igst}
                      onChange={(e) => setIgst(Number(e.target.value))}
                      className="w-full rounded-lg border-gray-300 px-4 py-2 shadow-sm"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-700">
                {sgst > 0 && (
                  <div className="flex justify-between">
                    <span>SGST ({sgst}%)</span>
                    <span>Rs. {((subtotal * sgst) / 100).toFixed(2)}</span>
                  </div>
                )}
                {cgst > 0 && (
                  <div className="flex justify-between">
                    <span>CGST ({cgst}%)</span>
                    <span>Rs. {((subtotal * cgst) / 100).toFixed(2)}</span>
                  </div>
                )}
                {igst > 0 && (
                  <div className="flex justify-between">
                    <span>IGST ({igst}%)</span>
                    <span>Rs. {((subtotal * igst) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Display */}
              {selectedServices.length > 0 &&
                (() => {
                  const subtotal = selectedServices.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  );

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
