import React from "react";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
} from "react-icons/io5";
import {
  MdLanguage,
  MdDarkMode,
} from "react-icons/md";
import {
  BsBoxFill,
} from "react-icons/bs";
import {
  FaRegBell,
  FaRegUserCircle,
} from "react-icons/fa";
import {
  FaPowerOff,
} from "react-icons/fa6";

const Navbar = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <nav className="w-full shadow-md bg-white m-3 p-4 rounded-md flex flex-col md:flex-row items-center justify-between gap-y-3">
      {/* Left: Welcome message */}
      <div className="w-full md:w-auto flex justify-between items-center md:justify-start">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Welcome,{" "}
          <span className="text-teal-500">
            {auth?.user || "Guest"}
          </span>
          !
        </h1>
      </div>

      {/* Center: Search */}
      <div className="flex items-center flex-grow max-w-md bg-gray-100 rounded px-2 py-1">
        <IoSearchOutline className="text-black text-lg" />
        <input
          type="search"
          placeholder="Search (Ctrl+/)"
          className="text-sm bg-transparent w-full text-gray-600 focus:outline-none pl-2"
        />
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4 text-xl">
    
        <FaPowerOff
          onClick={handleLogout}
          title="Logout"
          className="w-8 h-8 p-1 bg-red-400 cursor-pointer hover:bg-red-200 text-black rounded-full flex items-center justify-center text-xl shadow-sm transition duration-200"
        />
      </div>
    </nav>
  );
};

export default Navbar;
