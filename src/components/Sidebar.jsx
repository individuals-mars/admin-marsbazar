import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline } from "react-icons/io5";
import { BsListNested } from "react-icons/bs";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { LuInbox } from "react-icons/lu";
import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const Name = import.meta.env.VITE_MARS_NAME;

  const menuItems = [
    {
      label: "Dashboard",
      icon: <IoHomeOutline className="text-lg" />,
      children: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/orders", label: "Orders" },
        { path: "/shops", label: "Shops" },
        { path: "/analytics", label: "Analytics" }
      ]
    },
    {
      label: "Users",
      icon: <FaUsers className="text-lg" />,
      children: [
        { path: "/allusers", label: "All users" },
        { path: "/sellers", label: "Sellers" },
        { path: "/admins", label: "Admins" },
        { path: "/customers", label: "Customers" },
      ]
    },
    {
      label: "Categories",
      icon: <BsListNested className="text-lg" />,
      children: [
        { path: "/categories", label: "Categories" },
        { path: "/subcategories", label: "Sub Categories" },
      ]
    },
    {
      label: "Products",
      icon: <RiShoppingBasket2Fill className="text-lg" />,
      children: [
        { path: "/products", label: "All Products" },
        { path: "/inventory", label: "Inventory" },
      ]
    },
    {
      label: "Coupons",
      icon: <BiSolidCategoryAlt className="text-lg" />,
      children: [
        { path: "/envelope", label: "My Coupons" },
        { path: "/createcupon", label: "Create Coupons" },
      ]
    },
  ];

  const renderMenuItems = (items) =>
    items.map((item, index) => {
      const isActive = item.path && location.pathname === item.path;

      if (item.children) {
        return (
          <li key={index} className="mb-1 w-full">
            <details open className="group">
              <summary className={`flex items-center gap-3 text-sm cursor-pointer px-4 py-3 rounded-lg hover:bg-base-200 transition-all w-full 
                ${item.children.some(child => location.pathname === child.path) ? "text-primary font-semibold" : "text-base-content/80"}`}>
                <span className="group-hover:text-primary">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                <svg className="ml-auto h-4 w-4 transition-transform group-open:rotate-90 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <ul className="pl-8 mt-1 space-y-1 w-full">
                {item.children.map((child, childIndex) => {
                  const isChildActive = child.path && location.pathname === child.path;
                  return (
                    <li
                      key={childIndex}
                      className={`rounded-lg w-full ${isChildActive ? "bg-primary/20 text-primary" : "hover:bg-base-200"}`}
                    >
                      <Link
                        className={`text-sm flex gap-3 items-center py-2.5 px-3 rounded-lg transition-all w-full h-full truncate 
                          ${isChildActive ? "font-semibold" : "text-base-content/80"}`}
                        to={child.path}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isChildActive ? "bg-primary" : "bg-base-content/30"}`}></span>
                        <span className="truncate">{child.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        );
      }

      return (
        <li
          key={index}
          className={`relative w-full ${isActive ? "bg-primary/20 text-primary" : "hover:bg-base-200"}`}
        >
          <Link
            className={`text-sm flex gap-3 items-center py-3 px-4 rounded-lg transition-all w-full truncate 
              ${isActive ? "font-semibold" : "text-base-content/80"}`}
            to={item.path}
          >
            <span className={`${isActive ? "text-primary" : "text-base-content/60"}`}>
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        </li>
      );
    });

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-base-100 border-r border-base-200 z-50">
      {/* Логотип */}
      <div className="flex flex-col justify-center items-center py-6 px-2 border-b border-base-200">
        <Link to="/dashboard" className="mb-2">
          <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
        </Link>
        <p className="text-primary font-semibold text-sm text-center">{Name} Dashboard</p>
      </div>

      {/* Меню с прокруткой */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {renderMenuItems(menuItems)}
        </ul>
      </div>

      {/* Нижняя часть */}
      <div className="p-4 border-t border-base-200">
        <Link to="/support" className="flex items-center gap-3 text-sm text-base-content/80 hover:text-primary px-2 transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <LuInbox />
          </div>
          <span>Support Center</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;