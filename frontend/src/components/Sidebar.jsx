import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { RxGithubLogo } from "react-icons/rx";
import { MdMenuOpen, MdCategory, MdDesignServices, MdPeople } from "react-icons/md";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`p-5 mt-4 pt-2 shadow-lg ${
        open ? "w-full md:w-60 h-screen" : "w-20 h-auto"
      } relative duration-300`}
    >
      {/* Toggle Button */}
      <MdMenuOpen
        className={`text-3xl absolute ${
          open ? "right-3" : "-right-2 bg-white shadow-slate-600"
        } top-3.5 cursor-pointer duration-300 ${!open && "rotate-180"}`}
        onClick={() => setOpen(!open)}
      />

      {/* Logo */}
      <div className="inline-flex items-center">
        <RxGithubLogo
          className={`text-customPurple text-3xl cursor-pointer ml-1 mr-3 duration-500 ${
            !open && "rotate-[360deg]"
          }`}
          onClick={() => navigate("/")}
        />
        <h1
          className={`text-customh1 origin-left font-semibold text-2xl ${
            !open && "scale-0"
          }`}
        >
          Redback
        </h1>
      </div>

      {/* Menu List */}
      <ul className="mt-4">
        {/* Offerings */}
        <li
          className="text-grayishBlue text-sm uppercase font-semibold p-2 cursor-pointer mt-4 flex items-center justify-between"
          onClick={() => setSubmenuOpen((prev) => !prev)}
        >
          <div className="flex items-center gap-3">
            <MdCategory className="text-xl" />
            {open && <span>Offerings</span>}
          </div>
          {open && (
            <IoIosArrowDown
              className={`ml-2 transition-transform duration-200 ${
                submenuOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </li>

        {/* Offerings Submenu */}
        {submenuOpen && open && (
          <ul className="ml-7 mt-1 space-y-1">
            <li
              className="text-gray-700 text-xs font-medium p-2 pl-4 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => {
                navigate("/category");
                if (window.innerWidth < 768) setOpen(false);
              }}
            >
              <MdCategory className="text-sm" />
              <span>Categories</span>
            </li>
            <li
              className="text-gray-700 text-xs font-medium p-2 pl-4 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => {
                navigate("/services");
                if (window.innerWidth < 768) setOpen(false);
              }}
            >
              <MdDesignServices className="text-sm" />
              <span>Services</span>
            </li>
          </ul>
        )}

        {/* Clients */}
        <li
          className="text-grayishBlue text-sm uppercase font-semibold cursor-pointer p-2 mt-4 flex items-center gap-3"
          onClick={() => {
            navigate("/clients");
            if (window.innerWidth < 768) setOpen(false);
          }}
        >
          <MdPeople className="text-xl" />
          {open && <span>Client</span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
