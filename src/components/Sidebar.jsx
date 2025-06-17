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
      icon: <IoHomeOutline />,
      children: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/shops", label: "Shops" },
        { path: "/modalcreateshops", label: "Modal Create Shops" },
      ]
    },
    {
      label: "Users",
      icon: <FaUsers />,
      children: [
        { path: "/allusers", label: "All users" },
        { path: "/sellers", label: "Sellers" },
        { path: "/admins", label: "Admins" },
        { path: "/customers", label: "Customers" },
      ]
    },
    {
      label: "Products",
      icon: <RiShoppingBasket2Fill />,
      children: [
        { path: "/products", label: "All Products" },
        { path: "/CreateProduct", label: "Create Product" },
        { path: "/enventory", label: "Enventory" },
      ]
    },
    { path: "/orders", icon: <LuInbox />, label: "Orders" },
    { path: "/categories", icon: <BsListNested />, label: "Categories" },
    { path: "/envelope", icon: <BiSolidCategoryAlt />, label: "Envelope" },
  ];

  const renderMenuItems = (items) =>
    items.map((item, index) => {
      const isActive = item.path && location.pathname === item.path;

      if (item.children) {
        return (
          <li key={index} className="mb-1 w-full">
            <details open className="w-full">
              <summary className="flex items-center gap-3 text-sm cursor-pointer px-4 py-2 rounded-xl hover:bg-base-200 transition w-full">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </summary>
              <ul className="pl-6 mt-1 space-y-1 w-full"> {/* Изменено с pl-2 на pl-6 для явного отличия вложенных элементов */}
                {item.children.map((child, childIndex) => {
                  const isChildActive = child.path && location.pathname === child.path;
                  return (
                    <li 
                      key={childIndex}
                      className={`rounded-xl w-full ${isChildActive ? "bg-base-300 text-primary font-semibold" : ""}`}
                    >
                      <Link
                        className="text-sm flex gap-3 items-center py-2 px-3 hover:bg-base-200 rounded-xl transition w-full h-full truncate"
                        to={child.path}
                      >
                        {child.icon && <span>{child.icon}</span>}
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
          className={`relative w-full ${isActive ? "bg-base-300 text-primary font-bold" : ""}`}
        >
          <Link
            className="text-sm flex gap-3 items-center py-2 px-4 hover:bg-base-200 rounded-xl forgiveness w-full truncate"
            to={item.path}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Link>
        </li>
      );
    });

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-base-100 border-r border-base-300 z-50">
      {/* Логотип */}
      <div className="flex flex-col justify-center items-center py-4 px-2">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
        </Link>
        <p className="text-primary text-sm mt-2 text-center">{Name} Dashboard</p>
      </div>

      {/* Меню с прокруткой */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ul className="menu px-1 py-1 text-base-content auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent w-full flex-1">
          {renderMenuItems(menuItems)}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;