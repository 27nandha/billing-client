import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { RxGithubLogo } from "react-icons/rx";
import { FaBuilding } from "react-icons/fa";
import { TbCircleLetterRFilled } from "react-icons/tb";
import {
  MdMenuOpen,
  MdCategory,
  MdDesignServices,
  MdPeople,
} from "react-icons/md";
import { RiBillFill } from "react-icons/ri";
import { IoCash } from "react-icons/io5";
import { BiSolidCategory } from "react-icons/bi";
import { RiShoppingCartFill } from "react-icons/ri";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`transition-all duration-300 ${
        open ? "w-full md:w-64" : "w-20"
      } h-screen bg-white shadow-xl border-r border-gray-200 p-4 pt-3 relative`}
    >
      {/* Toggle Button */}
      <MdMenuOpen
        className={`text-3xl absolute top-3 cursor-pointer text-gray-600 transition-transform ${
          open ? "right-4" : "-right-3 bg-white rounded-full p-1 shadow"
        } ${!open && "rotate-180"}`}
        onClick={() => setOpen(!open)}
      />

      {/* Logo */}
      <div
        className={`flex items-center ${
          open ? "justify-start gap-3" : "justify-center"
        } mb-6`}
      >
        <TbCircleLetterRFilled
          className="text-red-700 text-3xl cursor-pointer transition-transform hover:scale-105"
          onClick={() => navigate("/")}
        />
        {open && (
          <h1 className="text-gray-800 font-bold text-2xl tracking-wide">
            Redback
          </h1>
        )}
      </div>

      {/* Menu List */}
      <ul className="space-y-2 text-sm font-medium text-gray-700">
        {/* Offerings */}
        <li
          className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-red-50 transition"
          onClick={() => {
            if (!open) setOpen(true);
            setSubmenuOpen((prev) => !prev);
          }}
        >
          <div className="flex items-center gap-3">
            <RiShoppingCartFill className="text-xl text-red-500" />
            {open && <span className="text-gray-700">Offerings</span>}
          </div>
          {open && (
            <IoIosArrowDown
              className={`text-gray-600 transition-transform duration-300 ${
                submenuOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </li>

        {/* Offerings Submenu */}
        {submenuOpen && open && (
          <ul className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3">
            <li
              className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => {
                navigate("/category");
                if (window.innerWidth < 768) setOpen(false);
              }}
            >
              <BiSolidCategory className="text-base text-red-500" />
              <span>Categories</span>
            </li>
            <li
              className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => {
                navigate("/services");
                if (window.innerWidth < 768) setOpen(false);
              }}
            >
              <MdDesignServices className="text-base text-red-500" />
              <span>Services</span>
            </li>
          </ul>
        )}

        {/* Clients */}
        <li
          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-red-50 transition"
          onClick={() => {
            navigate("/clients");
            if (window.innerWidth < 768) setOpen(false);
          }}
        >
          <MdPeople className="text-xl text-red-500" />
          {open && <span className="text-gray-700">Clients</span>}
        </li>

        {/* Billing */}
        <li
          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-red-50 transition"
          onClick={() => {
            navigate("/billing");
            if (window.innerWidth < 768) setOpen(false);
          }}
        >
          <IoCash className="text-xl text-red-500" />
          {open && <span className="text-gray-700">Billing</span>}
        </li>

        {/* Invoice */}
        <li
          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-red-50 transition"
          onClick={() => {
            navigate("/invoices");
            if (window.innerWidth < 768) setOpen(false);
          }}
        >
          <RiBillFill className="text-xl text-red-500" />
          {open && <span className="text-gray-700">Invoice</span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
