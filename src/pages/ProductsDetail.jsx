import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiDollarSign, FiEdit, FiInfo, FiPackage, FiTag,
  FiTrash2, FiTrendingUp, FiImage, FiAlertCircle, FiX, FiZoomIn,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Added Filler plugin
} from 'chart.js';

// Register all necessary ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Registered Filler plugin
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [stockHistory, setStockHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    stock: 0,
    price: { costPrice: 0, sellingPrice: 0 },
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const data = await res.json();
      console.log('📦 Response data:', data);
      setProduct(data);
      setEditForm({
        name: data.name || '',
        stock: data.stock || 0,
        price: data.price || { costPrice: 0, sellingPrice: 0 },
        category: data.category?.title || data.category || '',
        seller: data.seller?.username || data.seller || '',
        shop: data.shop?.shopname || data?.shop || '',
        description: data.description || '',
        tags: data.tags || []
      });
    } catch (err) {
      toast.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}/stock-summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stock summary');
      const data = await res.json();
      setStockHistory({
        labels: ['Current', 'Incoming', 'Outgoing', 'Adjusted'],
        datasets: [{
          label: 'Stock Summary',
          data: [data.currentStock, data.totalIn, data.totalOut, data.totalAdjust],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          tension: 0.4,
          fill: true
        }]
      });
    } catch (err) {
      toast.error('Failed to fetch stock history');
      setStockHistory({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Stock Levels',
          data: [50, 45, 30, 25, 10, product.stock || 0],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          tension: 0.4,
          fill: true
        }]
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Name is required';
    if (editForm.stock < 0) errors.stock = 'Stock cannot be negative';
    if (editForm.price.sellingPrice <= 0) errors.sellingPrice = 'Selling price must be positive';
    if (editForm.price.costPrice < 0) errors.costPrice = 'Cost price cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editForm,
          category: { title: editForm.category },
          seller: { username: editForm.seller },
          shop: { name: editForm?.shop },
          tags: editForm.tags
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setProduct(data.product);
      toast.success(data.message);
      setEditModalOpen(false);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      const data = await res.json();
      toast.success(data.message);
      navigate('/products');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleImageNavigation = (direction) => {
    if (!product.images) return;
    const newIndex = zoomedImageIndex + direction;
    if (newIndex >= 0 && newIndex < product.images.length) {
      setZoomedImageIndex(newIndex);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchStockHistory();
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-base-200 min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="btn btn-ghost mr-4 text-gray-600 dark:text-gray-300"
        >
          <FiArrowLeft className="mr-2" /> Back
        </motion.button>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white truncate">{product?.name || 'Loading...'}</h1>
        <div className="ml-auto flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditModalOpen(true)}
            className="btn btn-sm bg-blue-500 text-white"
          >
            <FiEdit />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeleteModalOpen(true)}
            className="btn btn-sm bg-red-500 text-base"
          >
            <FiTrash2 />
          </motion.button>
        </div>
      </div>

      {/* Skeleton Loader */}
      {loading ? (
        <div className="gap-4 mb-6">
          {[...Array(1)].map((_, i) => (
            <div key={i}  className="flex flex-col lg:flex-row gap-6">
              {/* Left Column */}
              <div className="lg:w-1/3 space-y-6">
                {/* Low Stock Placeholder */}
                <div className="h-12 bg-red-700/40 dark:bg-red-900/40 rounded-lg animate-pulse" />

                {/* Images Section */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4 animate-pulse">
                  <div className="h-6 bg-base-200 dark:bg-gray-700 w-1/3 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-base-200 dark:bg-gray-700 rounded-lg" />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse space-y-2">
                  <div className="h-6 bg-base-200 dark:bg-gray-700 w-1/3 rounded"></div>
                  <p className="h-4 bg-base-200 dark:bg-gray-700 w-full rounded"></p>
                  <p className="h-4 bg-base-200 dark:bg-gray-700 w-5/6 rounded"></p>
                  <p className="h-4 bg-base-200 dark:bg-gray-700 w-3/4 rounded"></p>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:w-2/3 space-y-6">
                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse space-y-3">
                      <div className="h-4 bg-base-200 dark:bg-gray-700 w-1/3 rounded"></div>
                      <div className="h-6 bg-base-200 dark:bg-gray-700 w-1/2 rounded"></div>
                      <div className="h-4 bg-base-200 dark:bg-gray-700 w-2/3 rounded"></div>
                    </div>
                  ))}
                </div>

                {/* Stock Analytics */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
                  <div className="h-6 bg-base-200 dark:bg-gray-700 w-1/4 mb-4 rounded"></div>
                  <div className="h-64 bg-base-200 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse space-y-3">
                      <div className="h-4 bg-base-200 dark:bg-gray-700 w-1/2 rounded"></div>
                      <div className="h-4 bg-base-200 dark:bg-gray-700 w-full rounded"></div>
                      <div className="h-4 bg-base-200 dark:bg-gray-700 w-5/6 rounded"></div>
                      <div className="h-4 bg-base-200 dark:bg-gray-700 w-2/3 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Product Images */}
          <div className="lg:w-1/3">
            {/* Low Stock Warning */}
            <AnimatePresence>
              {product?.stock < (product.lowStockThreshold || 10) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-700 dark:bg-red-900/50 text-red-100 dark:text-red-300"
                >
                  <FiAlertCircle size={18} /> Only {product?.stock} in stock! Restock soon.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Images Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <h3 className="mb-3 flex items-center text-lg font-medium text-gray-700 dark:text-gray-200">
                <FiImage className="mr-2" /> Product Images
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {product?.images?.length ? (
                  product.images.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square rounded-lg overflow-hidden shadow cursor-pointer"
                      onClick={() => setZoomedImageIndex(i)}
                    >
                      <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                        <FiZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity" size={20} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 text-gray-400">
                    <FiImage size={48} className="mb-2 opacity-50" />
                    <p>No images available</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description Section */}
            {product.description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6"
              >
                <h3 className="mb-3 flex items-center text-lg font-medium text-gray-700 dark:text-gray-200">
                  <FiInfo className="mr-2" /> Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {product.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Product Info and Analytics */}
          <div className="lg:w-2/3">
            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
            >
              {/* Main Info Cards */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2 text-gray-600 dark:text-gray-400">
                  <FiPackage className="mr-2" />
                  <span className="font-medium">Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {product?.stock ?? '—'}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Low stock threshold: {product.lowStockThreshold || 10}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2 text-gray-600 dark:text-gray-400">
                  <FiDollarSign className="mr-2" />
                  <span className="font-medium">Pricing</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                    <span className="font-medium">${product.price?.costPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Selling:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ${product.price?.sellingPrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Profit:</span>
                    <span className={`font-medium ${product.price?.income >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                      }`}>
                      ${product.price?.income?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2 text-gray-600 dark:text-gray-400">
                  <FiTag className="mr-2" />
                  <span className="font-medium">Category</span>
                </div>
                <div className="text-lg font-medium text-gray-800 dark:text-white">
                  {product.category?.title || product.category || '—'}
                </div>
                {product.tags?.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, i) => (
                        <span key={i} className="badge badge-outline text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2 text-gray-600 dark:text-gray-400">
                  <FiInfo className="mr-2" />
                  <span className="font-medium">Seller Info</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Seller</div>
                    <div className="font-medium">{product.seller?.username || product.seller || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Shop</div>
                    <div className="font-medium">{product.shop?.shopname || product?.shop || '—'}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stock Analytics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6"
            >
              <h3 className="mb-4 flex items-center text-lg font-medium text-gray-700 dark:text-gray-200">
                <FiTrendingUp className="mr-2" /> Stock Analytics
              </h3>
              {stockHistory ? (
                <div className="h-64">
                  <Line
                    data={stockHistory}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                          backgroundColor: '#1F2937',
                          titleColor: '#F9FAFB',
                          bodyColor: '#F9FAFB',
                          borderColor: '#374151',
                          borderWidth: 1
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(156, 163, 175, 0.1)' },
                          ticks: { color: 'rgba(156, 163, 175, 0.8)' }
                        },
                        x: {
                          grid: { color: 'rgba(156, 163, 175, 0.1)' },
                          ticks: { color: 'rgba(156, 163, 175, 0.8)' }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Loading stock analytics...
                </div>
              )}
            </motion.div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span>
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Views:</span>
                    <span>{product.view || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Seller Verification
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verified:</span>
                    <span>
                      {product.seller?.isVerifiedSeller ? (
                        <span className="badge badge-success">Verified</span>
                      ) : (
                        <span className="badge badge-warning">Not Verified</span>
                      )}
                    </span>
                  </div>
                  {product.seller?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="truncate max-w-[120px]">{product.seller.email}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      <AnimatePresence>
        {zoomedImageIndex !== null && product.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomedImageIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[zoomedImageIndex]}
                alt={`Zoomed ${zoomedImageIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageNavigation(-1);
                    }}
                    disabled={zoomedImageIndex === 0}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white ${zoomedImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-70'}`}
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageNavigation(1);
                    }}
                    disabled={zoomedImageIndex === product.images.length - 1}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white ${zoomedImageIndex === product.images.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-70'}`}
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}

              <button
                onClick={() => setZoomedImageIndex(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              >
                <FiX size={24} />
              </button>

              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImageIndex(i);
                      }}
                      className={`w-2 h-2 rounded-full ${i === zoomedImageIndex ? 'bg-white' : 'bg-gray-500'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Edit Product</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-sm btn-ghost text-gray-600 dark:text-gray-300"
                >
                  <FiX size={18} />
                </motion.button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label">
                    <span className="label-text">Product Name</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="Product Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  {formErrors.name && <p className="text-error text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Stock</span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered w-full ${formErrors.stock ? 'input-error' : ''}`}
                    placeholder="Stock"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                  />
                  {formErrors.stock && <p className="text-error text-xs mt-1">{formErrors.stock}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Selling Price</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`input input-bordered w-full ${formErrors.sellingPrice ? 'input-error' : ''}`}
                      placeholder="Selling Price"
                      value={editForm.price.sellingPrice}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: { ...editForm.price, sellingPrice: Number(e.target.value) } })
                      }
                    />
                    {formErrors.sellingPrice && <p className="text-error text-xs mt-1">{formErrors.sellingPrice}</p>}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Cost Price</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`input input-bordered w-full ${formErrors.costPrice ? 'input-error' : ''}`}
                      placeholder="Cost Price"
                      value={editForm.price.costPrice}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: { ...editForm.price, costPrice: Number(e.target.value) } })
                      }
                    />
                    {formErrors.costPrice && <p className="text-error text-xs mt-1">{formErrors.costPrice}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline btn-error"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline btn-primary"
                  onClick={handleUpdate}
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <FiAlertCircle className="mx-auto text-red-500" size={48} />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Delete Product</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </p>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-ghost"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-error"
                  onClick={handleDelete}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    
  );
};

export default ProductDetail;