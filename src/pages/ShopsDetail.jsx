import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MdArrowBack, MdDelete, MdEdit } from 'react-icons/md';
import { FaBan } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const ShopDetail = () => {
    const { id } = useParams();
    const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users';
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
        location: { lat: '', lon: '' },
        TariffPlan: 'basic',
    });
    const [errors, setErrors] = useState({});
    const defaultLogo = 'https://images-platform.99static.com//JO7XwrpaHhBzdsNOT-cGvqUuKEs=/81x82:917x918/fit-in/500x500/99designs-contests-attachments/103/103078/attachment_103078046';

    const token = useSelector((state) => state.user.token);

    useEffect(() => {
        const fetchShop = async () => {
            if (!token) {
                toast.error('Please log in to view shop details');
                navigate('/login');
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
                    let errorMessage = 'Failed to fetch shop details';
                    try {
                        const text = await response.text();
                        if (text.startsWith('<!DOCTYPE')) {
                            throw new Error('Received HTML instead of JSON. Check if /api/shops/:id endpoint exists.');
                        }
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.message || errorMessage;
                    } catch (_) { }
                    throw new Error(errorMessage);
                }
                const data = await response.json();
                setShop(data);
                setEditFormData({
                    shopname: data.shopname || '',
                    address: data.address || '',
                    description: data.description || '',
                    logotype: data.logotype || '',
                    location: {
                        lat: data.location?.lat?.toString() || '',
                        lon: data.location?.lon?.toString() || '',
                    },
                    TariffPlan: data.TariffPlan?.toLowerCase() || 'basic',
                });
            } catch (err) {
                console.error('Error fetching shop:', err);
                if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
                    toast.error('Session expired. Please log in again.');
                    navigate('/login');
                } else if (err.message.includes('Shop not found')) {
                    toast.error('Shop not found');
                    navigate('/shops');
                } else {
                    toast.error(err.message || 'Failed to load shop details');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchShop();
    }, [id, token, navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!editFormData.shopname.trim()) newErrors.shopname = 'Shop name is required';
        if (!editFormData.address.trim()) newErrors.address = 'Address is required';
        if (editFormData.logotype && !editFormData.logotype.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif)$/)) {
            newErrors.logotype = 'Logo must be a valid image URL';
        }
        const lat = parseFloat(editFormData.location.lat);
        const lon = parseFloat(editFormData.location.lon);
        if (editFormData.location.lat && (isNaN(lat) || lat < -90 || lat > 90)) {
            newErrors.lat = 'Latitude must be a number between -90 and 90';
        }
        if (editFormData.location.lon && (isNaN(lon) || lon < -180 || lon > 180)) {
            newErrors.lon = 'Longitude must be a number between -180 and 180';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditShop = async () => {
        if (!token) {
            toast.error('Please log in to edit a shop');
            return;
        }

        if (!validateForm()) {
            toast.error('Please fix form errors');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                shopname: editFormData.shopname,
                address: editFormData.address,
                description: editFormData.description,
                logotype: editFormData.logotype || '',
                location: {
                    lat: editFormData.location.lat ? parseFloat(editFormData.location.lat) : undefined,
                    lon: editFormData.location.lon ? parseFloat(editFormData.location.lon) : undefined,
                },
                TariffPlan: editFormData.TariffPlan,
            };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = 'Error updating shop';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (_) { }
                throw new Error(errorMessage);
            }

            const updatedShop = await response.json();
            setShop(updatedShop);
            setShowEditModal(false);
            setErrors({});
            toast.success('Shop updated successfully');
        } catch (err) {
            console.error('Error updating shop:', err);
            toast.error(err.message || 'Error updating shop');
        } finally {
            setLoading(false);
        }
    };

    const handleBanShop = async () => {
        if (!token) {
            toast.error('Please log in to ban a shop');
            navigate('/login');
            return;
        }

        setDeleteLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/ban/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to ban shop';
                if (response.status === 401 || response.status === 403) {
                    toast.error('Session expired or access denied. Please log in again.');
                    navigate('/login');
                    return;
                }
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (_) { }
                throw new Error(errorMessage);
            }

            toast.success('Shop banned successfully');
            setShowBanModal(false);
            navigate('/shops');
        } catch (err) {
            console.error('Ban Error:', err);
            toast.error(err.message || 'Failed to ban shop');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteShop = async () => {
        if (!token) {
            toast.error('Please log in to delete a shop');
            navigate('/login');
            return;
        }

        setDeleteLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to delete shop';
                if (response.status === 401 || response.status === 403) {
                    toast.error('Session expired or access denied. Please log in again.');
                    navigate('/login');
                    return;
                }
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (_) { }
                throw new Error(errorMessage);
            }

            toast.success('Shop deleted successfully');
            setShowDeleteModal(false);
            navigate('/shops');
        } catch (err) {
            console.error('Delete Error:', err);
            toast.error(err.message || 'Failed to delete shop');
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowEditModal(false);
                setShowDeleteModal(false);
                setShowBanModal(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100/70 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center gap-3">
                    <span className="loading loading-infinity w-16 h-16 text-primary"></span>
                    <p className="text-base font-medium text-gray-600">Loading Shop Details...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="flex justify-center items-center h-screen w-screen bg-base-2000 dark:bg-gray-800">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Shop not found</p>
                    <button
                        className="mt-4 btn btn-primary btn-sm"
                        onClick={() => navigate('/shops')}
                        aria-label="Back to shops"
                    >
                        Back to Shops
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-base-2000 dark:bg-gray-800 flex items-center justify-center p-4 sm:p-6">
            <div className="card w-full max-w-[90%] sm:max-w-[100%] bg-base-350 dark:bg-gray-900 shadow-lg rounded-xl p-6 sm:p-8 flex flex-col">
                <button
                    className="btn btn-outline btn-success text-base-350 dark:text-primary-dark hover:bg-success hover:text-white dark:hover:bg-gray-700 mb-4 text-base flex items-center gap-2 self-start"
                    onClick={() => navigate(-1)}
                    aria-label="Go back to shop list"
                >
                    <MdArrowBack size={20} /> Back
                </button>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 flex-1 mb-5">
                    <img
                        src={shop.logotype || defaultLogo}
                        alt={`${shop.shopname} logo`}
                        className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-full border border-base-200 dark:border-gray-700 p-2 shadow-sm"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-base-350 dark:text-gray-100 mb-4">{shop.shopname}</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="text-sm mt-2">
                                <strong className="text-base-350 dark:text-gray-200 font-medium">Description:</strong>
                                <p className="text-base-350 dark:text-gray-300 mt-1">{shop.description || 'No description provided'}</p>
                            </div>
                            <div className="text-sm mt-2">
                                <strong className="text-base-350 dark:text-gray-200 font-medium">Address:</strong>
                                <p className="text-base-350 dark:text-gray-300 mt-1">{shop.address}</p>
                            </div>
                            <div className="text-sm mt-2">
                                <strong className="text-base-350 dark:text-gray-200 font-medium">Location:</strong>
                                <p className="text-base-350 dark:text-gray-300 mt-1">
                                    {shop.location ? `${shop.location.lat}, ${shop.location.lon}` : '41.321412, 69.2797'}
                                </p>
                            </div>
                            <div className="text-sm mt-2">
                                <strong className="text-base-350 dark:text-gray-200 font-medium">Status:</strong>
                                <p className="text-base-350 dark:text-gray-300 mt-1 capitalize">{shop.status || 'Active'}</p>
                            </div>
                            <div className="text-sm mt-2">
                                <strong className="text-base-350 dark:text-gray-200 font-medium">Tariff Plan:</strong>
                                <p className="text-base-350 dark:text-gray-300 mt-1 capitalize">{shop.TariffPlan || 'basic'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divider my-4 sm:my-6 border-gray-200 dark:border-gray-700" />

                <div className="text-sm mt-2 ">
                    <div className='flex justify-center'>
                        <strong className="text-base-350 dark:text-gray-200 font-medium text-lg ">Owner Information:</strong>
                    </div>
                    <div className=" flex justify-between gap-4 mt-6">
                        <div>
                            <p className="text-base-350 dark:text-gray-300">
                                <strong>Username:</strong> {shop.owner?.username || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-base-350 dark:text-gray-300">
                                <strong>Email:</strong> {shop.owner?.email || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-base-350 dark:text-sm">
                                <strong>Store Name:</strong> {shop.owner?.storeName || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-base-350 dark:text-gray-300">
                                <strong>Store Description:</strong> {shop.owner?.storeDescription || 'No description provided'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="divider my-4 sm:my-6 border-gray-200 dark:border-gray-700" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-3">
                    <div>
                        <p className="font-semibold text-base-350 dark:text-gray-100 mb-2">{shop.commission || '10%'}</p>
                        <p className="text-sm text-base-350 dark:text-gray-300">Commission</p>
                    </div>
                    <div>
                        <p className="font-semibold text-base-350 dark:text-gray-100 mb-2">{shop.sales || '0'}</p>
                        <p className="text-sm text-base-350 dark:text-gray-300">Sales</p>
                    </div>
                    <div>
                        <p className="font-semibold text-base-350 dark:text-gray-100 mb-2">{shop.balance || '0'}</p>
                        <p className="text-sm text-base-350 dark:text-gray-300">Balance</p>
                    </div>
                    <div>
                        <p className="font-semibold text-base-350 dark:text-gray-100 mb-2">{shop.withdraw || '0'}</p>
                        <p className="text-sm text-base-350 dark:text-gray-300">Withdraw</p>
                    </div>
                </div>

                <div className="flex justify-end mt-4 sm:mt-6 gap-3">
                    <button
                        className="btn btn-outline btn-success text-sm flex items-center gap-2 hover:bg-success hover:text-white transition-colors"
                        onClick={() => setShowBanModal(true)}
                        disabled={deleteLoading}
                        aria-label={`Ban ${shop.shopname}`}
                    >
                        <FaBan size={15} /> Ban
                    </button>
                    <button
                        className="btn btn-outline btn-warning text-sm flex items-center gap-2 hover:bg-warning hover:text-white transition-colors"
                        onClick={() => setShowEditModal(true)}
                        disabled={deleteLoading}
                        aria-label={`Edit ${shop.shopname}`}
                    >
                        <MdEdit size={15} /> Edit
                    </button>
                    <button
                        className="btn btn-outline btn-error text-sm mt- flex items-center gap-2  hover:bg-error hover:text-white transition-colors"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleteLoading}
                        aria-label={`Delete ${shop.shopname}`}
                    >

                        <MdDelete size={15} /> Delete
                    </button>
                </div>

                {showEditModal && (
                    <div className="modal modal-open fixed inset-0 bg-base-200 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="modal-box w-full max-w-lg sm:max-w-xl bg-base-350 dark:bg-gray-900 rounded-lg shadow-xl p-6 h-auto max-h-[90vh] overflow-auto">
                            <h3 id="edit-modal-title" className="text-xl font-semibold text-base-350 dark:text-gray-100 mb-4">
                                Edit Shop
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-logotype">
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
                                    <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-shopname">
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
                                    <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-address">
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
                                    <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-description">
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-lat">
                                            Latitude
                                        </label>
                                        <input
                                            id="edit-lat"
                                            type="text"
                                            className={`input input-bordered w-full text-sm ${errors.lat ? 'input-error' : ''}`}
                                            placeholder="41.3111"
                                            value={editFormData.location.lat}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    location: { ...editFormData.location, lat: e.target.value },
                                                })}
                                        />
                                        {errors.lat && <p className="text-error text-xs mt-1">{errors.lat}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-lon">
                                            Longitude
                                        </label>
                                        <input
                                            id="edit-lon"
                                            type="text"
                                            className={`input input-bordered w-full text-sm ${errors.lon ? 'input-error' : ''}`}
                                            placeholder="69.2797"
                                            value={editFormData.location.lon}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    location: { ...editFormData.location, lon: e.target.value },
                                                })}
                                        />
                                        {errors.lon && <p className="text-error text-xs mt-1">{errors.lon}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-base-350 dark:text-gray-200 mb-1" htmlFor="edit-tariff">
                                        Tariff Plan
                                    </label>
                                    <select
                                        id="edit-tariff"
                                        className="select select-bordered w-full text-sm"
                                        value={editFormData.TariffPlan}
                                        onChange={(e) => setEditFormData({ ...editFormData, TariffPlan: e.target.value })}
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="standard">Standard</option>
                                        <option value="premium">Premium</option>
                                    </select>
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
                    <div
                        className="modal modal-open fixed inset-0 bg-base-200 bg-opacity-50 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                    >
                        <div className="modal-box bg-base-350 dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 id="delete-modal-title" className="font-bold text-lg text-error">
                                Delete Shop
                            </h3>
                            <p className="py-4 text-base-350 dark:text-gray-300">
                                Are you sure you want to delete <span className="font-semibold">{shop.shopname}</span>? This action cannot be undone.
                            </p>
                            <div className="modal-action mt-2 flex justify-end gap-3">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    aria-label="Cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`btn btn-error btn-sm ${deleteLoading ? 'loading' : ''}`}
                                    onClick={handleDeleteShop}
                                    disabled={deleteLoading}
                                    aria-label="Delete"
                                    aria-disabled={deleteLoading}
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showBanModal && (
                    <div
                        className="modal modal-open fixed inset-0 bg-base-200 bg-opacity-50 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ban-modal-title"
                    >
                        <div className="modal-box bg-base-350 dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 id="ban-modal-title" className="font-bold text-lg text-warning">
                                Ban Shop
                            </h3>
                            <p className="py-4 text-base-350 dark:text-gray-300">
                                Are you sure you want to ban <span className="font-semibold">{shop.shopname}</span>? This action cannot be undone.
                            </p>
                            <div className="modal-action mt-2 flex justify-end gap-3">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setShowBanModal(false)}
                                    disabled={deleteLoading}
                                    aria-label="Cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`btn btn-warning btn-sm ${deleteLoading ? 'loading' : ''}`}
                                    onClick={handleBanShop}
                                    disabled={deleteLoading}
                                    aria-label="Ban"
                                    aria-disabled={deleteLoading}
                                >
                                    {deleteLoading ? 'Banning...' : 'Ban'}
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