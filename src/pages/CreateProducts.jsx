import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCloudArrowUp, FaPlus, FaTrash } from 'react-icons/fa6';
import axios from 'axios';
import { toast } from 'react-toastify';
import { use } from 'react';
import { useEffect } from 'react';

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
    images: [''],
  });

  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [shops, setShops] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('price.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (index, value, field) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (index, field) => {
    setFormData((prev) => {
      const newArray = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: newArray.length ? newArray : [''] };
    });
    if (field === 'images') {
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newImages]);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images.filter(Boolean), ...files], // ✅ сохраняем реальные файлы
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.seller.trim()) errors.seller = 'Seller is required';
    if (!formData.shop.trim()) errors.shop = 'Shop ID is required';
    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)
      errors.stock = 'Valid stock quantity is required';
    if (!formData.price.costPrice || isNaN(parseFloat(formData.price.costPrice)))
      errors.costPrice = 'Valid cost price is required';
    if (!formData.price.sellingPrice || isNaN(parseFloat(formData.price.sellingPrice)))
      errors.sellingPrice = 'Valid selling price is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length) {
      Object.values(errors).forEach((msg) => toast.error(msg));
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('seller', formData.seller);
      formDataToSend.append('shop', formData.shop);
      formDataToSend.append('stock', parseInt(formData.stock));
      if (formData.description) formDataToSend.append('description', formData.description);
      formDataToSend.append('price', JSON.stringify({
        costPrice: parseFloat(formData.price.costPrice),
        sellingPrice: parseFloat(formData.price.sellingPrice),
      }));
      formData.tags.filter(Boolean).forEach((tag, index) => {
        formDataToSend.append(`tags[${index}]`, tag);
      });
      if (formData.discount) formDataToSend.append('discount', parseFloat(formData.discount));
      formData.images.filter(Boolean).forEach((file) => {
        if (file instanceof File) {
          formDataToSend.append('images', file);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type' is automatically set to multipart/form-data with FormData
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create product');
      }

      const result = await response.json();
      console.log('Product created:', result);
      toast.success('Product created successfully!');
      navigate('/products');
    } catch (err) {
      console.error('Error creating product:', err.message);
      toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };


  const getCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`);
      setCategories(response.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Error fetching categories');
      toast.error(e.response?.data?.message || 'Error fetching categories');
    }
  };


  const getSellers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users`);
      setSellers(response.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Error fetching sellers');
      toast.error(e.response?.data?.message || 'Error fetching sellers');
    }
  };

  const getShops = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/shops`);
      console.log('Shops response:', response.data); // 👈 проверь, что это
      setShops(response.data.data); 
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching shops');
      toast.error(error.response?.data?.message || 'Error fetching shops');
    }
  }

  useEffect(() => {
    getCategories();
    getSellers();
    getShops();
  }, []);

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen">
      <h1 className="text-xl font-semibold text-base-content dark:text-gray-100 my-3">Create Products</h1>
      <hr className="my-6 border-base-200 dark:border-gray-700" />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">Product Images</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload product images (PNG or JPG)</p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700">
            <label
              htmlFor="image-upload"
              className="border border-dashed border-base-200 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition cursor-pointer"
            >
              <FaCloudArrowUp className="text-4xl text-base-content dark:text-gray-300 mb-2" />
              <p className="text-sm text-base-content dark:text-gray-200">Upload images or drag and drop</p>
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
            {imagePreviews.length > 3 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded-lg border border-base-200 dark:border-gray-700" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 btn btn-xs btn-neutral rounded-full"
                      onClick={() => removeArrayItem(index, 'images')}
                      aria-label="Remove image"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <hr className="my-6 border-base-200 dark:border-gray-700" />

        {/* Basic Info */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">Basic Information</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add basic info about your product</p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700 space-y-5">
            <div>
              <label className="block  font-medium text-base-content dark:text-gray-200 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="input input-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
                required
              />
            </div>
            <div>
              <label className="block  font-medium text-base-content dark:text-gray-200 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </select>

            </div>
            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">
                Seller
              </label>
              <select
                name="seller"
                value={formData.seller}
                onChange={handleChange}
                className="select w-full select-bordered border-base-200 dark:border-gray-600"
                required
              >
                <option value="">Select a seller</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.username || 'Unnamed'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">Shop</label>
              <select
                name="shop"
                value={formData.shop}
                onChange={handleChange}
                className="select w-full select-bordered border-base-200 dark:border-gray-600"
                required
              >
                <option value="">Select a shop</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.shopname || shop.title || 'Unnamed Shop'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block  font-medium text-base-content dark:text-gray-200 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Stock Quantity"
                className="input input-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product Description"
                className="textarea textarea-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
              />
            </div>
          </div>
        </div>
        <hr className="my-6 border-base-200 dark:border-gray-700" />

        {/* Pricing */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 ">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">Pricing</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set cost and selling prices</p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-800 p-6 rounded-lg border border-base-200 dark:border-gray-700 space-y-5">
            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">Cost Price</label>
              <input
                type=""
                name="price.costPrice"
                value={formData.price.costPrice}
                onChange={handleChange}
                placeholder="Cost Price"
                className="input input-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-base-content dark:text-gray-200 mb-1">Selling Price</label>
              <input
                type="number"
                name="price.sellingPrice"
                value={formData.price.sellingPrice}
                onChange={handleChange}
                placeholder="Selling Price"
                className="input input-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block  font-medium text-base-content dark:text-gray-200 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Discount Percentage"
                className="input input-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        </div>
        <hr className="my-6 border-base-200 dark:border-gray-700" />

        {/* Tags */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="lg:w-1/3">
            <h1 className="text-lg font-semibold text-base-content dark:text-gray-100">Tags</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add tags to categorize your product</p>
          </div>
          <div className="lg:w-2/3 bg-base-100 dark:bg-gray-500 p-6 rounded-lg border border-base-200 dark:border-gray-700 space-y-4">
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                  placeholder={`Tag ${index + 1}`}
                  className="input input-bordered w-full text-sm rounded-lg border-base-200 dark:border-gray-600 hover:bg-base-200/50 dark:hover:bg-gray-700/50 transition"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-neutral rounded-full"
                  onClick={() => removeArrayItem(index, 'tags')}
                  aria-label="Remove tag"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline btn-neutral"
              onClick={() => addArrayItem('tags')}
              aria-label="Add tag"
            >
              <FaPlus /> Add Tag
            </button>
          </div>
        </div>
        <hr className="my-6 border-base-200 dark:border-gray-700" />

        {/* Submit Button */}
        <div className='flex justify-end gap-4'>
          <div className=''>
            <button
              className='btn btn-outline btn-error flex items-center gap-2 rounded-lg'
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          <div className="">
            <button
              type="submit"
              className="btn btn-outline btn-success w-full sm:w-auto rounded-lg text-sm transition"
              disabled={loading}
              aria-label={loading ? 'Creating Product' : 'Create Product'}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProducts;
