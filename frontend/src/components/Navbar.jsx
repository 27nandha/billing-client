import React, { useState } from "react";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { BsBoxFill } from "react-icons/bs";
import { FaPowerOff } from "react-icons/fa6";

const routeMap = {
  home: "/",
  category: "/category",
  client: "/clients",
  billing: "/billing",
  bill: "/billing",
  service: "/services",
  invoice: "/invoices",
  addCompany: "/subcompany",
  quotation: "/quotation",
};

const Navbar = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const key = search.trim().toLowerCase();
    if (routeMap[key]) {
      navigate(routeMap[key]);
      setSearch("");
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = Object.keys(routeMap).filter(
    (key) => key.startsWith(search.trim().toLowerCase()) && search.trim() !== ""
  );

  const handleSuggestionClick = (key) => {
    navigate(routeMap[key]);
    setSearch("");
    setShowSuggestions(false);
  };

  return (
    <nav className="w-full mx-4 my-6 px-6 py-4 rounded-2xl bg-white border border-gray-200 shadow-lg shadow-gray-200/20 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl">
      {/* Left: Welcome */}
      <div className="w-full lg:w-auto text-center lg:text-left">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent font-extrabold">
            {auth?.user || "Guest"}
          </span>
          <span className="text-gray-400 font-normal">!</span>
        </h1>
      </div>

      {/* Center: Search */}
      <div className="relative w-full max-w-lg">
        <form
          onSubmit={handleSearch}
          autoComplete="off"
          className="flex items-center px-4 py-2.5 rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-200/50 hover:shadow-md transition"
        >
          <IoSearchOutline
            className="text-gray-500 text-xl hidden md:block cursor-pointer hover:text-emerald-600 transition"
            onClick={handleSearch}
          />
          <input
            type="search"
            placeholder="Search pages (search)"
            className="w-full ml-3 bg-transparent text-gray-700 placeholder-gray-400 text-sm font-medium focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          />
        </form>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {filteredSuggestions.map((key) => (
              <li
                key={key}
                className="px-4 py-3 text-sm text-gray-700 font-medium cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition border-b last:border-b-0"
                onMouseDown={() => handleSuggestionClick(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Billing Button */}
        <button
          onClick={() => navigate("/billing")}
          className="flex items-center gap-2 px-4 py-2 h-11 bg-gradient-to-r from-black to-red-600 text-white text-sm font-semibold rounded-xl shadow-md hover:from-red-600 hover:to-black hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <BsBoxFill className="text-lg" />
          Billing
        </button>

        {/* Logout Button with Tooltip */}
        <div className="relative group">
          <button
            onClick={handleLogout}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-800 text-white shadow-md hover:from-red-600 hover:to-rose-600 hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <FaPowerOff className="text-lg" />
          </button>
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Logout
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
