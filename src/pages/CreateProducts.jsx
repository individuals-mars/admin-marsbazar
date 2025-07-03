import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCloudArrowUp, FaPlus, FaTrash } from 'react-icons/fa6';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateProducts = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    seller: '',
    shop: '',
    stock: '0',
    description: '',
    price: { costPrice: '', sellingPrice: '' },
    tags: [''],
    discount: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories `);
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      const msg = e.message || 'Error fetching categories';
      setError({ ...error, category: msg });
      toast.error(msg);
    }
  }

  const getShops = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops`);
      const data = await res.json();
      setShops(data.data || []);
    } catch (e) {
      const msg = e.message || 'Error fetching shops';
      setError({ ...error, shop: msg });
      toast.error(msg);
    }
  }

  const getSellers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        const filtered = data.filter((user) => user.role === 'seller');
        setSellers(filtered || []);
      } catch (jsonError) {
        console.error('❌ Ответ НЕ JSON:', text);
        throw new Error('❌ Server did not return valid JSON');
      }

    } catch (e) {
      const msg = e.message || 'Error fetching sellers';
      setError((prev) => ({ ...prev, seller: msg }));
      toast.error(msg);
    }
  };




  useEffect(() => {
    getCategories()
    getShops()
    getSellers()
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('price.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: { ...prev.price, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => {
      const newArray = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: newArray.length ? newArray : [''] };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.seller) errors.seller = 'Seller is required';
    if (!formData.shop) errors.shop = 'Shop is required';
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) errors.stock = 'Valid stock quantity is required';
    if (!formData.price.costPrice || isNaN(Number(formData.price.costPrice))) errors.costPrice = 'Valid cost price is required';
    if (!formData.price.sellingPrice || isNaN(Number(formData.price.sellingPrice))) errors.sellingPrice = 'Valid selling price is required';
    if (formData.images.length === 0) errors.images = 'At least one image is required';

    setError(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    const formDataToSend = new FormData();

    // Create a product object with all the data
    const productData = {
      name: formData.name,
      category: formData.category,
      seller: formData.seller,
      shop: formData.shop,
      stock: Number(formData.stock),
      description: formData.description,
      price: {
        costPrice: Number(formData.price.costPrice),
        sellingPrice: Number(formData.price.sellingPrice)
      },
      tags: formData.tags.filter(tag => tag), // Remove empty tags
      discount: formData.discount ? Number(formData.discount) : undefined
    };

    // Append the product data as JSON string
    formDataToSend.append('product', JSON.stringify(productData));

    // Append each image file
    formData.images.forEach((image) => {
      formDataToSend.append('images', image);
    });

    // Debug: Log what's being sent
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, key === 'product' ? JSON.parse(value) : value);
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create product');
    }

    toast.success('Product created successfully!');
    navigate('/products');
  } catch (err) {
    console.error('Create error:', err);
    toast.error(err.message || 'Failed to create product');
  } finally {
    setLoading(false);
  }
};

  console.log("formData", formData);



  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen">
      <h1 className="text-xl font-semibold text-base-content dark:text-gray-100 my-3">
        Create Product
      </h1>
      <hr className="my-6 border-base-200 dark:border-gray-700" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">
              Product Images
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload product images (PNG or JPG)
            </p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700">
            <label
              htmlFor="image-upload"
              className="border border-dashed border-base-200 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition cursor-pointer"
            >
              <FaCloudArrowUp className="text-4xl text-base-content dark:text-gray-300 mb-2" />
              <p className="text-sm text-base-content dark:text-gray-200">
                Drag and drop images or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG</p>
              <input
                id="image-upload"
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {error?.images && <p className="text-error text-sm mt-2">{error.images}</p>}

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded-lg border border-base-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 btn btn-circle btn-xs btn-error"
                      onClick={() => removeImage(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">
              Basic Information
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Product details and specifications
            </p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700 space-y-5">
            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className={`input input-bordered w-full ${error?.name ? 'input-error' : ''}`}
              />
              {error?.name && <p className="text-error text-sm mt-1">{error.name}</p>}
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`select select-bordered w-full ${error?.category ? 'select-error' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </select>
              {error?.category && <p className="text-error text-sm mt-1">{error.category}</p>}

            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Seller *
              </label>
              <select
                name="seller"
                value={formData.seller}
                onChange={handleChange}
                className={`select select-bordered w-full ${error?.seller ? 'select-error' : ''}`}
              >
                <option value="">Select a seller</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.username}
                  </option>
                ))}
              </select>
              {error?.seller && <p className="text-error text-sm mt-1">{error.seller}</p>}
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Shop *
              </label>
              <select
                name="shop"
                value={formData.shop}
                onChange={handleChange}
                className={`select select-bordered w-full ${error?.shop ? 'select-error' : ''}`}
              >
                <option value="">Select a shop</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.shopname || shop.title}
                  </option>
                ))}
              </select>
              {error?.shop && <p className="text-error text-sm mt-1">{error.shop}</p>}
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                className={`input input-bordered w-full ${error?.stock ? 'input-error' : ''}`}
                min="0"
              />
              {error?.stock && <p className="text-error text-sm mt-1">{error.stock}</p>}
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="textarea textarea-bordered w-full"
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">
              Pricing
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set product pricing information
            </p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700 space-y-5">
            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Cost Price ($) *
              </label>
              <input
                type="number"
                name="price.costPrice"
                value={formData.price.costPrice}
                onChange={handleChange}
                placeholder="Enter cost price"
                className={`input input-bordered w-full ${error?.costPrice ? 'input-error' : ''}`}
                min="0"
                step="0.01"
              />
              {error?.costPrice && <p className="text-error text-sm mt-1">{error.costPrice}</p>}
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                name="price.sellingPrice"
                value={formData.price.sellingPrice}
                onChange={handleChange}
                placeholder="Enter selling price"
                className={`input input-bordered w-full ${error?.sellingPrice ? 'input-error' : ''}`}
                min="0"
                step="0.01"
              />
              {error?.sellingPrice && <p className="text-error text-sm mt-1">{error.sellingPrice}</p>}
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Enter discount percentage"
                className="input input-bordered w-full"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">
              Tags
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add tags to categorize your product
            </p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700 space-y-4">
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                  placeholder={`Tag ${index + 1}`}
                  className="input input-bordered w-full"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-error rounded-full"
                  onClick={() => removeArrayItem(index, 'tags')}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => addArrayItem('tags')}
            >
              <FaPlus /> Add Tag
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="btn btn-outline btn-error"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProducts;