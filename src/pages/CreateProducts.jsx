import React, { useState } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'

const products = [
  {
    id: 1,
    name: "Samsung SoundPal S8 Mini Bluetooth Speaker Gadget",
    image: "https://via.placeholder.com/50",
    type: "Simple",
    shop: "Gadget",
    price: 67.0,
    quantity: 5,
    status: "Active",
  },
  {
    id: 2,
    name: "Apple AirPods Pro 2nd Generation",
    image: "https://via.placeholder.com/50",
    type: "Wireless",
    shop: "Apple Store",
    price: 249.99,
    quantity: 15,
    status: "Active",
  },
  {
    id: 3,
    name: "Sony WH-1000XM4 Noise Cancelling Headphones",
    image: "https://via.placeholder.com/50",
    type: "Over-Ear",
    shop: "Sony Official",
    price: 349.99,
    quantity: 8,
    status: "OutOfStock",
  },
]

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-yellow-100 text-yellow-800",
  OutOfStock: "bg-red-100 text-red-800",
}


const CreateProducts = () => {
  return (
    <div className=" p-8  bg-base rounded-lg shadow">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-base-700">Create Products</h1>
        <button className="btn btn-success btn-md">Create Product</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-base-700">
          <thead className="text-xs uppercase bg-base-100 text-base-600">
            <tr>
              <th scope="col" className="py-3 px-4">ID</th>
              <th scope="col" className="py-3 px-4">Product</th>
              <th scope="col" className="py-3 px-4">Product Type</th>
              <th scope="col" className="py-3 px-4">Shop</th>
              <th scope="col" className="py-3 px-4">Price/Unit</th>
              <th scope="col" className="py-3 px-4">Quantity</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(({ id, name, image, type, shop, price, quantity, status }) => (
              <tr
                key={id}
                className="border-b border-base-200 hover:bg-base-50 transition"
              >
                <td className="py-3 px-4 font-medium text-base-800">{id}</td>
                <td className="py-3 px-4 flex items-center gap-3">
                  <img
                    src={image}
                    alt={name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="font-medium text-base-800">{name}</span>
                </td>
                <td className="py-3 px-4 capitalize">{type}</td>
                <td className="py-3 px-4">{shop}</td>
                <td className="py-3 px-4 font-semibold">${price.toFixed(2)}</td>
                <td className="py-3 px-4">{quantity}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-3">
                  <button
                    className="text-warning hover:text-warning transition"
                    aria-label="Edit product"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    className="text-error hover:text-error transition"
                    aria-label="Delete product"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default CreateProducts
