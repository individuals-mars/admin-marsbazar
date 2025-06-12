import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdArrowBack, MdDelete, MdEdit } from 'react-icons/md';
import { FaBan } from "react-icons/fa";
import { useSelector } from 'react-redux';


const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    shopname: '',
    address: '',
    description: '',
    logotype: '',
    location: '',
    phone: '',
    TariffPlan: 'basic',
  });
  const [errors, setErrors] = useState({});
  const defaultLogo = 'https://images-platform.99static.com//JO7XwrpaHhBzdsNOT-cGvqUuKEs=/81x82:917x918/fit-in/500x500/99designs-contests-attachments/103/103078/attachment_103078046';

  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    const fetchShop = async () => {
      if (!token) {
        toast.error('Please log in to view shop details');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch shop details');
        }
        const data = await response.json();
        setShop(data);
        setEditFormData({
          shopname: data.shopname || '',
          address: data.address || '',
          description: data.description || '',
          logotype: data.logotype || '',
          location: data.location || '',
          phone: data.phone || '',
          TariffPlan: data.TariffPlan || 'basic',
        });
      } catch (err) {
        console.error('Error fetching shop:', err);
        toast.error(err.message || 'Failed to load shop details');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id, token]);

  const validateForm = () => {
    const newErrors = {};
    if (!editFormData.shopname.trim()) newErrors.shopname = 'Shop name is required';
    if (!editFormData.address.trim()) newErrors.address = 'Address is required';
    if (!editFormData.location.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
      newErrors.location = 'Location must be in "lat,lon" format (e.g., 41.3111,69.2797)';
    }
    if (!editFormData.phone.match(/^\+?\d{10,15}$/)) {
      newErrors.phone = 'Phone must be a valid number (e.g., +998901234567)';
    }
    if (editFormData.logotype && !editFormData.logotype.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif)$/)) {
      newErrors.logotype = 'Logo must be a valid image URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleBanShop = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shops/ban/${id}`,
        {}, // тело не нужно
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // если есть защита
          },
        }
      );
      toast.success("Магазин забанен");
      setShowBanModal(false);
      navigate("/shops");
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Не удалось забанить магазин");
    }
  };


  const handleDeleteShop = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${shop?._id}`);
      toast.success("Shop deleted successfully");
      setShowDeleteModal(false);
      navigate("/shops"); // или куда тебе надо
    } catch (err) {
      toast.error("Failed to delete shop");
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowEditModal(false);
    };
    if (showEditModal) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showEditModal]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100/70 dark:bg-gray-900/70 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-infinity w-16 h-16 text-primary"></span>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">Loading Shop Details...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center h-screen w-screen text-gray-500 dark:text-gray-400 text-lg">
        Shop not found
      </div>
    );
  }

  return (
    <div className="w-full  bg-base-2000 dark:bg-gray-800 flex items-center justify-center p-4 sm:p-6 ">
      <div className="card w-full h-full  max-w-[90%] sm:max-w-[100%] bg-base-350 dark:bg-gray-900 shadow-lg rounded-xl p-6 sm:p-8 flex flex-col">
        <button
          className="btn btn-succsess text-primary dark:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 mb-4 text-base flex items-center gap-2 self-start"
          onClick={() => navigate(-1)}
          aria-label="Go back to shop list"
        >
          <MdArrowBack size={20} /> Back
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 flex-1 mb-5">
          <img
            src={shop.logotype || defaultLogo}
            alt={`${shop.shopname} logo`}
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-full border border-base-200  p-2 shadow-sm"
          />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-base-350  mb-4">{shop.shopname}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-sm mt-2">
                <strong className="text-base-350  font-medium">Description:</strong>
                <p className="text-base-350 mt-1">{shop.description || 'No description provided'}</p>
              </div>
              <div className="text-sm mt-2">
                <strong className="text-base-350 font-medium ">Address:</strong>
                <p className="text-base-350 mt-1">{shop.address}</p>
              </div>
              <div className="text-sm mt-2">
                <strong className="text-base-350 font-medium">Phone:</strong>
                <p className="text-base-350 mt-1">{shop.phone || '+998901234567'}</p>
              </div>
              <div className="text-sm mt-2">
                <strong className="text-base-350 font-medium">Location:</strong>
                <p className="text-base-350 mt-1">{shop.location?.lat || '41.321412,4215'}</p>
              </div>
              <div className='text-sm mt-2'>
                <strong className="text-base-350 font-medium">Status:</strong>
                <p className="text-base-350 mt-1">{shop.status || 'Active'}</p>
              </div>
              <div className='text-sm mt-2'>
                <strong className="text-base-350 font-medium">TariffPlan:</strong>
                <p className="text-base-350 mt-1">{shop.TariffPlan || 'John Doe'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="divider my-4 sm:my-6 border-gray-200 dark:border-gray-700 " />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-10">
          <div>
            <p className="font-semibold text-base-350 mb-2">{shop.commission || '10%'}</p>
            <p className="text-sm text-base-350">Commission</p>
          </div>
          <div>
            <p className="font-semibold text-base-350 mb-2">{shop.sales || '0'}</p>
            <p className="text-sm text-base-350">Sales</p>
          </div>
          <div>
            <p className="font-semibold text-base-350 mb-2">{shop.balance || '0'}</p>
            <p className="text-sm text-base-350">Balance</p>
          </div>
          <div>
            <p className="font-semibold text-base-350 mb-2">{shop.withdraw || '0'}</p>
            <p className="text-sm text-base-350">Withdraw</p>
          </div>
        </div>


        <div className="flex justify-end mt-4 sm:mt-6 gap-3">
          <button
            className="btn btn-outline btn-success text-sm flex items-center gap-2 hover:bg-success hover:text-white transition-colors"
            onClick={() => handleBanShop(shop.id)}
            disabled={deleteLoading}
            aria-label={`Ban ${shop.shopname}`}
          >
            <FaBan size={15} /> Ban
          </button>

          <button
            className="btn btn-outline btn-warning text-sm flex items-center gap-2 hover:bg-arning hover:text-white transition-colors"
            onClick={() => setShowEditModal(true)}
            aria-label={`Edit ${shop.shopname}`}
          >
            <MdEdit size={15} /> Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline btn-error text-sm flex items-center gap-2 hover:bg-error hover:text-white transition-colors"
          >
            <MdDelete size={15} />Delete
          </button>

        </div>

        {showEditModal && (
          <div className="modal modal-open fixed inset-0 bg-base-200 bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
            <div className="modal-box w-full max-w-lg sm:max-w-xl bg-base-200 rounded-lg shadow-xl p-6 h-auto max-h-[90vh] overflow-auto">
              <h3 id="edit-modal-title" className="text-xl font-semibold text-base-350 mb-4">
                Edit Shop
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-base-350 mb-1" htmlFor="edit-logotype">
                    Logo URL
                  </label>
                  <input
                    id="edit-logotype"
                    type="text"
                    className={`input input-bordered w-full text-sm ${errors.logotype ? 'input-error' : ''}`}
                    placeholder="https://your-logo-url.com/image.png"
                    value={editFormData.logotype}
                    onChange={(e) => setEditFormData({ ...editFormData, logotype: e.target.value })}
                  />
                  {errors.logotype && <p className="text-error text-xs mt-1">{errors.logotype}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-350 mb-1" htmlFor="edit-shopname">
                    Shop Name
                  </label>
                  <input
                    id="edit-shopname"
                    type="text"
                    className={`input input-bordered w-full text-sm ${errors.shopname ? 'input-error' : ''}`}
                    placeholder="Shop Name"
                    value={editFormData.shopname}
                    onChange={(e) => setEditFormData({ ...editFormData, shopname: e.target.value })}
                  />
                  {errors.shopname && <p className="text-error text-xs mt-1">{errors.shopname}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-350 mb-1" htmlFor="edit-address">
                    Address
                  </label>
                  <input
                    id="edit-address"
                    type="text"
                    className={`input input-bordered w-full text-sm ${errors.address ? 'input-error' : ''}`}
                    placeholder="Address"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  />
                  {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-350 mb-1" htmlFor="edit-phone">
                    Phone
                  </label>
                  <input
                    id="edit-phone"
                    type="text"
                    className={`input input-bordered w-full text-sm ${errors.phone ? 'input-error' : ''}`}
                    placeholder="+998 90 123 45 67"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-350 mb-1" htmlFor="edit-description">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    className="textarea textarea-bordered w-full text-sm h-20"
                    placeholder="Description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-350 mb-1" htmlFor="edit-location">
                    Location (lat,lon)
                  </label>
                  <input
                    id="edit-location"
                    type="text"
                    className={`input input-bordered w-full text-sm ${errors.location ? 'input-error' : ''}`}
                    placeholder="41.3111,69.2797"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                  {errors.location && <p className="text-error text-xs mt-1">{errors.location}</p>}
                </div>
              </div>

              <div className="modal-action mt-6 flex justify-end gap-3">
                <button
                  className="btn btn-outline btn-error text-sm hover:bg-error hover:text-white"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  className={`btn btn-outline btn-primary text-sm hover:bg-primary-dark ${loading ? 'loading' : ''}`}
                  onClick={handleEditShop}
                  disabled={loading || !token}
                  aria-label="Save Changes"
                  aria-disabled={loading || !token}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-error">Delete Shop</h3>
              <p className="py-4">
                Are you sure you want to delete this shop? This action cannot be undone.
              </p>
              <div className="modal-action">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteShop}
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showBanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
              <h2 className="text-xl font-semibold text-red-600">Подтверждение блокировки</h2>
              <p>Ты уверен, что хочешь забанить <strong>{shop.name}</strong>? Это действие необратимо.</p>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={handleBanShop}
                  className="btn btn-error btn-sm text-white"
                >
                  Забанить
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopDetail;