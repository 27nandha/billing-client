import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const PAGE_SIZE = 10;

const Invoices = ({ type = "invoice" }) => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false); // Add this

  const fetchBills = async () => {
    try {
      setLoading(true);
      const auth = JSON.parse(localStorage.getItem("auth"));
      const { data } = await axios.get(
        `/api/bill/all?search=${searchTerm}&status=${statusFilter}&type=${type}&page=${page}&limit=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: auth?.jwtToken,
          },
        }
      );
      setBills(data.bills);
      setTotal(data.total);
      setPages(Math.ceil(data.total / PAGE_SIZE));
    } catch (err) {
      console.error("Error fetching bills:", err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, searchTerm, statusFilter]);

  const handleViewInvoice = async (id) => {
    setPdfLoading(true); // Start loading
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.get(`/api/bill/pdf/${id}`, {
        responseType: "blob",
        headers: {
          Authorization: auth?.jwtToken,
        },
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Optionally revoke the object URL after some time
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch {
      toast.error("Failed to preview PDF");
    } finally {
      setPdfLoading(false); // Stop loading
    }
  };

  const exportToCSV = () => {
    const headers = ["Invoice ID", "Client", "Date", "Status", "Amount"];
    const rows = bills.map((b) => [
      b.invoiceId,
      b.client?.name,
      new Date(b.createdAt).toLocaleDateString(),
      b.status,
      `₹${b.totalAmount.toFixed(2)}`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "invoices.csv";
    link.click();
  };

  const highlight = (text, term) =>
    term ? (
      <span
        dangerouslySetInnerHTML={{
          __html: text.replace(
            new RegExp(`(${term})`, "gi"),
            "<mark class='bg-yellow-200'>$1</mark>"
          ),
        }}
      />
    ) : (
      text
    );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              {type === "invoice" ? "Invoices" : "Quotations"}
            </h1>

            {/* PDF Loading Spinner */}
            {pdfLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow flex flex-col items-center">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span className="text-gray-700">Loading PDF preview...</span>
                </div>
              </div>
            )}

            {/* 🔍 Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by Invoice ID or Client Name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border rounded w-full md:w-48"
              >
                <option value="all">All</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>

            {/* 📄 Table */}
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Loading invoices...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                      <th className="p-3 border-b">Invoice #</th>
                      <th className="p-3 border-b">Client</th>
                      <th className="p-3 border-b">Subcompany</th>
                      <th className="p-3 border-b">Date</th>
                      {type === "invoice" && (
                        <th className="p-3 border-b">Status</th>
                      )}
                      <th className="p-3 border-b">Total</th>
                      <th className="p-3 border-b">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.length > 0 ? (
                      bills.map((bill) => (
                        <tr
                          key={bill._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td
                            className="p-3 text-blue-600 underline cursor-pointer"
                            onClick={() => handleViewInvoice(bill._id)}
                          >
                            {highlight(bill.invoiceId, searchTerm)}
                          </td>
                          <td className="p-3">
                            {highlight(bill.client?.name, searchTerm)}
                          </td>
                          <td className="p-3">
                            {bill.subcompany?.name || "Redback"}
                          </td>
                          <td className="p-3">
                            {new Date(bill.createdAt).toLocaleDateString()}
                          </td>
                          {type === "invoice" && (
                            <td className="p-3">
                              <select
                                value={bill.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const auth = JSON.parse(
                                      localStorage.getItem("auth")
                                    );
                                    await axios.patch(
                                      `/api/bill/${bill._id}/status`,
                                      { status: newStatus },
                                      {
                                        headers: {
                                          Authorization: auth?.jwtToken,
                                        },
                                      }
                                    );
                                    // Update status locally
                                    setBills((prev) =>
                                      prev.map((b) =>
                                        b._id === bill._id
                                          ? { ...b, status: newStatus }
                                          : b
                                      )
                                    );
                                    toast.success("Status updated");
                                  } catch {
                                    toast.error("Failed to update status");
                                  }
                                }}
                                className={`px-2 py-1 rounded-full text-xs font-semibold
              ${
                bill.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : bill.status === "Unpaid"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
                              >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Partially Paid">
                                  Partially Paid
                                </option>
                              </select>
                            </td>
                          )}

                          <td className="p-3 font-medium">
                            ₹{bill.totalAmount.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={async () => {
                                try {
                                  const auth = JSON.parse(
                                    localStorage.getItem("auth")
                                  );
                                  const response = await axios.get(
                                    `/api/bill/pdf/${bill._id}`,
                                    {
                                      responseType: "blob",
                                      headers: {
                                        Authorization: auth?.jwtToken,
                                      },
                                    }
                                  );
                                  const blob = new Blob([response.data], {
                                    type: "application/pdf",
                                  });
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `Invoice-${bill.invoiceId}.pdf`;
                                  link.click();
                                  window.URL.revokeObjectURL(url);
                                } catch {
                                  toast.error("Failed to download PDF");
                                }
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-10 text-center text-gray-500"
                        >
                          {type === "invoice"
                            ? "No invoices match your filters."
                            : "No quotations match your filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && bills.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pages} — {total} invoices
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(p + 1, pages))}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invoices;
