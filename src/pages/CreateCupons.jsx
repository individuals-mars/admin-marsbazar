import React, { useState } from 'react';
import { FaCloudArrowDown, FaXmark } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

const CreateCoupons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: {
      percent: '',
      fixed: '',
    },
    amount: '',
    usageLimit: '',
    image: '',
    validDays: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      try {
        const base64 = await convertToBase64(file);
        setFormData((prev) => ({ ...prev, image: base64 }));
        toast.success('✅ Image uploaded successfully');
      } catch (err) {
        toast.error('❌ Failed to process image');
      }
    } else {
      toast.error('❌ Please upload a PNG or JPG file');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  const validateForm = () => {
    if (!formData.code.trim()) return 'Coupon code is required';
    if (!formData.type) return 'Coupon type is required';
    if (!['percent', 'fixed'].includes(formData.type))
      return 'Please select a valid coupon type (percent or fixed)';
    if (formData.amount === '' || Number(formData.amount) < 0)
      return 'Amount must be a non-negative number';
    if (formData.usageLimit !== '' && Number(formData.usageLimit) < 0)
      return 'Usage limit must be a non-negative number';
    if (formData.validDays === '' || Number(formData.validDays) < 0)
      return 'Valid days must be a non-negative number';
    if (!formData.image) return 'Coupon image is required';
    return null;
  };

  const handleSubmit = async () => {
    console.log('Token:', token); // Debug: Log token
    if (!token) {
      toast.error('Please log in to create a coupon');
      navigate('/login');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: formData.code.trim(),
        type: formData.type,
        amount: Number(formData.amount),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
        validDays: Number(formData.validDays),
        image: formData.image,
      };
      console.log('Payload:', payload); // Debug: Log payload
      console.log('API URL:', `${import.meta.env.VITE_BACKEND_URL}/api/coupons`); // Debug: Log URL

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Coupon created successfully!');
      navigate('/envelope');
    } catch (err) {
      console.error('Error creating coupon:', err);
      console.log('Error response:', err.response); // Debug: Log full error response
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        dispatch(logout());
        navigate('/login');
      } else if (err.response?.status === 400) {
        toast.error('Coupon code already exists');
      } else {
        toast.error(err.response?.data?.message || 'Failed to create coupon');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-200 p-4 min-h-screen">
      <div className="px-3">
        <h1 className="font-semibold text-xl">Create Coupon</h1>
        <hr className="my-8 bg-base-350 opacity-10" />
      </div>
      <div>
        {/* Coupon Banner */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mx-3">
            <h2 className="font-semibold text-lg mb-2">Coupon Banner</h2>
            <p className="text-xs text-base-350">Upload an image to visually represent the coupon (PNG or JPG)</p>
          </div>
          <div className="bg-base-100 px-10 py-5 rounded-lg w-full md:w-[680px]">
            {formData.image ? (
              <div className="relative">
                <img
                  src={formData.image}
                  alt="Coupon Preview"
                  className="w-full h-32 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                >
                  <FaXmark size={20} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="banner-upload"
                className="border border-dashed border-base-300 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-base-200 transition cursor-pointer"
              >
                <FaCloudArrowDown className="text-5xl text-base-350 mb-2" />
                <p className="text-sm">Upload an image or drag and drop</p>
                <p className="text-xs text-base-350">PNG, JPG</p>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        <hr className="my-10 bg-base-350 opacity-10" />

        {/* Coupon Info */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mx-3">
            <h2 className="font-semibold text-lg mb-2">Coupon Info</h2>
            <p className="text-xs text-base-350">Add details about your coupon</p>
          </div>
          <div className="bg-base-100 p-6 rounded-lg shadow-md w-full md:w-[680px]">
            <div className="mb-4">
              <label htmlFor="code" className="mb-2 font-semibold block">
                Code *
              </label>
              <input
                id="code"
                name="code"
                type="text"
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Eg: SAVE20"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="mb-2 font-semibold block">
                Amount *
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Eg: 20"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="type" className="mb-2 font-semibold block">
                Type *
              </label>
              <select
                id="type"
                name="type"
                className="w-full border border-base-300 rounded-sm py-2 px-4 text-base-350"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select a type</option>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="usageLimit" className="mb-2 font-semibold block">
                Usage Limit
              </label>
              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min="0"
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                value={formData.usageLimit}
                onChange={handleInputChange}
                placeholder="Eg: 100"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="validDays" className="mb-2 font-semibold block">
                Valid Days *
              </label>
              <input
                id="validDays"
                name="validDays"
                type="number"
                min="0"
                className="w-full border border-base-300 rounded-sm py-2 px-4"
                value={formData.validDays}
                onChange={handleInputChange}
                placeholder="Eg: 30"
                required
              />
            </div>
          </div>
        </div>

        <hr className="my-10 bg-base-350 opacity-10" />

        {/* Action Buttons */}
        <div className="flex justify-end mt-4 gap-4">
          <button
            type="button"
            className="btn btn-outline btn-error"
            onClick={() => navigate('/coupons')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-outline btn-success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupons;