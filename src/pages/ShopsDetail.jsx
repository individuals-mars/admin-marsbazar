import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MdArrowBack, MdDelete, MdEdit, MdLocationOn, MdImage, MdPerson, MdInventory } from 'react-icons/md';
import { FaBan, FaRegCalendarAlt } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';
import { SiGooglemaps } from 'react-icons/si';
import { BsInfoCircle, BsImages } from 'react-icons/bs';
import { useSelector } from 'react-redux';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const defaultLogo = 'https://images-platform.99static.com//JO7XwrpaHhBzdsNOT-cGvqUuKEs=/81x82:917x918/fit-in/500x500/99designs-contests-attachments/103/103078/attachment_103078046';
  const defaultBanner = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpTQZ2ymiyWERMbA6iLXtu-GdpqGqVpWKlLg&s';

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalState, setModalState] = useState({
    edit: false,
    delete: false,
    banner: false,
    ban: false,
  });
  const [formData, setFormData] = useState({
    shopname: '',
    address: '',
    description: '',
    logotype: '',
    banner: '',
    banReason: '',
    banFrom: '',
    banTo: ''
  });

  // Fetch shop data with products
  const fetchShopWithProducts = useCallback(async () => {
    if (!token) {
      toast.error('Please log in to view shop details');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Fetch shop details
      const shopResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}/with-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!shopResponse.ok) {
        throw new Error('Failed to fetch shop details');
      }

      const shopData = await shopResponse.json();
      setShop(shopData.shop);
      setProducts(shopData.products || []);

      setFormData({
        shopname: shopData.shop.shopname || '',
        address: shopData.shop.address || '',
        description: shopData.shop.description || '',
        logotype: shopData.shop.logotype || '',
        banner: shopData.shop.banner || '',
      });
    } catch (error) {
      console.error('Error fetching shop:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  // Handle shop actions
  const handleShopAction = async (action) => {
    if (!token) {
      toast.error('Please log in to perform this action');
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      if (action === 'edit') {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update shop');
        }

        const updatedShop = await response.json();
        setShop(updatedShop);
        toast.success('Shop updated successfully');
        setModalState({ ...modalState, edit: false });
      } else if (action === 'delete') {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete shop');
        }

        toast.success('Shop deleted successfully');
        navigate('/shops');
      } else if (action === 'banner') {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}/banner`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ banner: formData.banner }),
        });

        if (!response.ok) {
          throw new Error('Failed to update banner');
        }

        const updatedShop = await response.json();
        setShop(updatedShop);
        toast.success('Banner updated successfully');
        setModalState({ ...modalState, banner: false });
      } else if (action === 'ban') {
        // Validate ban dates
        if (!formData.banFrom || !formData.banTo) {
          toast.error('Please select both start and end dates');
          return;
        }

        if (new Date(formData.banFrom) >= new Date(formData.banTo)) {
          toast.error('End date must be after start date');
          return;
        }

        if (!formData.banReason) {
          toast.error('Please enter a ban reason');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops/${id}/ban`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: new Date(formData.banFrom).toISOString(),
            to: new Date(formData.banTo).toISOString(),
            reason: formData.banReason
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to ban shop');
        }

        const updatedShop = await response.json();
        setShop(updatedShop);
        toast.success(`Shop banned until ${new Date(formData.banTo).toLocaleDateString()}`);
        setModalState({ ...modalState, ban: false });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchShopWithProducts();
  }, [fetchShopWithProducts]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-lg font-medium">Loading Shop Details</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 bg-base-100 rounded-box shadow-lg max-w-md">
          <div className="text-5xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold mb-2">Shop Not Found</h2>
          <p className="mb-6 text-base-content/70">The shop you're looking for doesn't exist or may have been removed.</p>
          <button className="btn btn-primary w-full" onClick={() => navigate('/shops')}>
            Back to Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button className="btn btn-ghost hover:bg-base-200 flex items-center gap-2" onClick={() => navigate(-1)}>
            <MdArrowBack size={18} />
            <span>Back</span>
          </button>
          <div className="text-sm breadcrumbs bg-base-200 px-4 py-2 rounded-lg">
            <ul>
              <li><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
              <li><a onClick={() => navigate('/shops')}>Shops</a></li>
              <li className="text-primary font-medium">{shop.shopname}</li>
            </ul>
          </div>
        </div>

        {/* Banner section */}
        <div className="relative w-full h-64 rounded-box overflow-hidden">
          <img
            src={shop.banner || defaultBanner}
            alt="Shop banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = defaultBanner;
            }}
          />
          <button
            className="absolute bottom-4 right-4 btn btn-sm btn-primary flex items-center gap-2"
            onClick={() => setModalState({ ...modalState, banner: true })}
          >
            <MdImage size={16} />
            <span>Change Banner</span>
          </button>
        </div>

        {/* Main shop card */}
        <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary-content ring-offset-base-100 ring-offset-2">
                  <img
                    src={shop.logotype || defaultLogo}
                    alt={shop.shopname}
                    onError={(e) => {
                      e.target.src = defaultLogo;
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{shop.shopname}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <div className="badge badge-lg badge-primary-content/90 gap-1">
                    <SiGooglemaps size={14} />
                    <span>{shop.address || 'No address'}</span>
                  </div>
                  <div className="badge badge-lg badge-primary gap-1">
                    <GiReceiveMoney size={14} />
                    <span>{shop.TariffPlan || 'basic'}</span>
                  </div>
                  <div className="badge badge-lg badge-secondary gap-1">
                    <MdInventory size={14} />
                    <span>{products.length} products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Owner Information */}
            {shop.owner && (
              <div className="flex items-start gap-3">
                <MdPerson className="text-primary mt-1 text-xl" />
                <div>
                  <h3 className="text-lg font-semibold text-primary">Owner</h3>
                  <p className="text-base-content/70">
                    {shop.owner.username || 'Unknown'} ({shop.owner.email})
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex items-start gap-3">
              <BsInfoCircle className="text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Description</h3>
                <p className="text-base-content/70">{shop.description || 'No description provided'}</p>
              </div>
            </div>

            {/* Products Preview */}
            {products.length > 0 && (
              <div className="flex items-start gap-3">
                <MdInventory className="text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-primary">Products ({products.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {products.slice(0, 6).map(product => (
                      <div key={product._id} className="bg-base-200 p-2 rounded-box">
                        <p className="font-medium truncate">{product?.name}</p>
                        <p className="text-sm text-primary ">$ {product?.cost?.sellingPrice || 300}</p>
                      </div>
                    ))}
                    {products.length > 6 && (
                      <div className="bg-base-200 p-2 rounded-box flex items-center justify-center">
                        <p className="text-sm">+{products.length - 6} more</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-base-200">
              <button
                className="btn btn-warning flex items-center gap-2"
                onClick={() => setModalState({ ...modalState, ban: true })}
                disabled={actionLoading}
              >
                <FaBan size={16} />
                <span>Ban Shop</span>
              </button>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setModalState({ ...modalState, edit: true })}
                disabled={actionLoading}
              >
                <MdEdit size={16} />
                <span>Edit Shop</span>
              </button>
              <button
                className="btn btn-error flex items-center gap-2"
                onClick={() => setModalState({ ...modalState, delete: true })}
                disabled={actionLoading}
              >
                <MdDelete size={16} />
                <span>Delete Shop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Modal */}
      {modalState.banner && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Update Shop Banner</h2>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setModalState({ ...modalState, banner: false })}>
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Banner URL</span>
                  </label>
                  <div className="relative">
                    <BsImages className="absolute inset-y-0 left-0 flex items-center pl-3" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      value={formData.banner}
                      onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                </div>
                <div className="aspect-video bg-base-200 rounded-box flex items-center justify-center overflow-hidden">
                  {formData.banner ? (
                    <img
                      src={formData.banner}
                      alt="Banner preview"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = defaultBanner;
                      }}
                    />
                  ) : (
                    <span className="text-base-content/50">Banner preview will appear here</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button className="btn btn-ghost" onClick={() => setModalState({ ...modalState, banner: false })}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShopAction('banner')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Update Banner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shop Modal */}
      {modalState.edit && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Edit Shop</h2>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setModalState({ ...modalState, edit: false })}>
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Shop Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.shopname}
                    onChange={(e) => setFormData({ ...formData, shopname: e.target.value })}
                    placeholder="Enter shop name"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter shop address"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter shop description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button className="btn btn-ghost" onClick={() => setModalState({ ...modalState, edit: false })}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShopAction('edit')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalState.ban && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Ban Shop</h2>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setModalState({ ...modalState, ban: false })}>
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ban From</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={formData.banFrom}
                    onChange={(e) => setFormData({ ...formData, banFrom: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ban To</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={formData.banTo}
                    onChange={(e) => setFormData({ ...formData, banTo: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ban Reason</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={formData.banReason}
                    onChange={(e) => setFormData({ ...formData, banReason: e.target.value })}
                    placeholder="Enter ban reason"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button className="btn btn-ghost" onClick={() => setModalState({ ...modalState, ban: false })}>
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => handleShopAction('ban')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Banning...' : 'Ban Shop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalState.delete && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mt-3">Delete Shop</h3>
                <div className="mt-2 text-sm text-base-500">
                  <p>Are you sure you want to delete this shop? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button className="btn btn-ghost" onClick={() => setModalState({ ...modalState, delete: false })}>
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={() => handleShopAction('delete')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;