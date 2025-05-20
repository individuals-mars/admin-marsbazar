import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline } from "react-icons/io5";
import { BsListNested } from "react-icons/bs";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";


const Sidebar = () => {
    const location = useLocation();
    const Name = import.meta.env.VITE_MARS_NAME

    const menuItems = [
        { path: "/dashboard", icon: <IoHomeOutline />, label: "Dashboard" },
        { path: "/orders", icon: <BsListNested />, label: "Orders" },
        { path: "/categories", icon: <BiSolidCategoryAlt />, label: "Categories" },
        { path: "/products", icon: <RiShoppingBasket2Fill />, label: "Products" },
        {label: "Users",
         icon: <FaUsers />,
         children: [
            {path: "/allusers", label: "All users"},
            {path: "/sellers", label: "Sellers"},
            {path: "/admins", label: "Admins"},
            {path: "/customers", label: "Customers"},
         ]
        }
    ];

     const renderMenuItems = (items) => {
            return items.map((item, index) => {
                const isActive = item.path && location.pathname === item.path;
    
                if (item.children) {
                    return (
                        <li key={index}>
                            <details open>
                                <summary className="flex items-center rounded-xl  gap-5 text-sm cursor-pointer">
                                    {item.icon} {item.label}
                                </summary>
                                <ul className="">
                                    {item.children.map((child, childIndex) => {
                                        const isChildActive = child.path && location.pathname === child.path;
                                        return (
                                            <li
                                                key={childIndex}
                                                className={`relative ${isChildActive ? "border-primary text-primary bg-base-300 rounded-xl font-bold" : ""}`}
                                            >
                                                {isChildActive && (
                                                    <div className='bg-primary absolute -left-18 top-0 max-w-0.5 w-0.5 h-full'></div>
                                                )}
                                                <Link
                                                    className="text-sm flex gap-5 items-center py-2 hover:bg-base-300 flex-1 px-2 rounded-xl"
                                                    to={child.path}
                                                >
                                                    {child.icon} {child.label}
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
                        className={`relative ${isActive ? "border-primary text-primary bg-base-300 rounded-xl font-bold" : ""}`}
                    >
                        {isActive && (
                            <div className='bg-primary absolute -left-12 top-0 max-w-0.5 w-0.5 h-full'></div>
                        )}
                        <Link
                            className="text-sm flex gap-5 items-center py-2 hover:bg-base-300 flex-1 px-2 rounded-xl"
                            to={item.path}
                        >
                            {item.icon} {item.label}
                        </Link>
                    </li>
                );
            });
        };

    return (
       <div className='w-2/12 fixed top-0 left-0'>
        <input id='my-drawer-2' type="checkbox" className='drawer-toggle' />
        <div className='w-full flex flex-col h-screen'>
            <div className='w-full flex flex-col justify-center text-center h-[20%] items-center'>
               <Link to={"/dashboard"}>
                    <img src="../src/assets/logo.png" alt="Logo" className='size-24'  />
               </Link>
               <p className='text-primary text-sm'>{Name} Dashboard</p>
            </div>
            <ul className='menu overflow-auto text-base-content mt-5 max-h-[50%] rounded-[40px] relative flex flex-col w-full h-auto transition-all py-6 px-7'>
                {renderMenuItems(menuItems)}
            </ul>
        </div>
       </div>
    );
};

export default Sidebar;
