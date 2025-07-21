import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  FiArrowLeft, FiDollarSign, FiEdit, FiInfo, FiPackage, FiTag,
  FiTrendingUp, FiImage, FiAlertCircle, FiX, FiZoomIn,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
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
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const [product, setProduct] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(null);
  const deleteModalRef = useRef(null);

  const [editForm, setEditForm] = useState({
    name: '',
    stock: 0,
    price: { costPrice: 0, sellingPrice: 0 },
    description: '',
    tags: []
  });

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduct(response.data);
      setEditForm({
        name: response.data.name,
        stock: response.data.stock,
        price: response.data.price,
        description: response.data.description,
        tags: response.data.tags || []
      });
      fetchStockHistory(response.data._id);
    } catch (err) {
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async (productId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/stock-summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStockHistory({
        labels: ['Current', 'Incoming', 'Outgoing', 'Adjusted'],
        datasets: [{
          label: 'Stock Summary',
          data: [
            response.data.currentStock,
            response.data.totalIn,
            response.data.totalOut,
            response.data.totalAdjust
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          tension: 0.4,
          fill: true
        }]
      });
    } catch (err) {
      // Fallback data if API fails
      setStockHistory({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Stock Levels',
          data: [50, 45, 30, 25, 10, product?.stock || 0],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          tension: 0.4,
          fill: true
        }]
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        {
          name: editForm.name,
          stock: Number(editForm.stock),
          price: {
            costPrice: Number(editForm.price.costPrice),
            sellingPrice: Number(editForm.price.sellingPrice),
          },
          description: editForm.description,
          tags: editForm.tags
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProduct(response.data);
      toast.success('Product updated successfully!');
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully!');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteModalOpen(false);
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
  }, [id]);

  if (loading) {
    return (
 <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-base-100 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex items-center mb-6">
        <div className="btn btn-ghost mr-4 skeleton h-10 w-24"></div>
        <div className="skeleton h-8 w-64"></div>
        <div className="ml-auto flex gap-2">
          <div className="skeleton btn btn-sm h-8 w-8"></div>
          <div className="skeleton btn btn-sm h-8 w-8"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:w-1/3">
          {/* Stock Alert Skeleton */}
          <div className="skeleton p-3 mb-6 rounded-lg h-12 bg-red-200"></div>

          {/* Images Section Skeleton */}
          <div className="mb-6 bg-base-200 p-4 rounded-lg shadow">
            <div className="flex items-center mb-3">
              <FiImage className="mr-2 skeleton-icon" />
              <div className="skeleton h-5 w-32"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Description Section Skeleton */}
          <div className="bg-base-200 p-4 rounded-lg shadow mb-6">
            <div className="flex items-center mb-3">
              <FiInfo className="mr-2 skeleton-icon" />
              <div className="skeleton h-5 w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-5/6"></div>
              <div className="skeleton h-4 w-4/6"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:w-2/3">
          {/* Info Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-base-200 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  {i === 0 && <FiPackage className="mr-2 skeleton-icon" />}
                  {i === 1 && <FiDollarSign className="mr-2 skeleton-icon" />}
                  {i === 2 && <FiTag className="mr-2 skeleton-icon" />}
                  {i === 3 && <FiInfo className="mr-2 skeleton-icon" />}
                  <div className="skeleton h-4 w-20"></div>
                </div>
                <div className="skeleton h-8 w-16 mb-2"></div>
                <div className="skeleton h-3 w-32"></div>
              </div>
            ))}
          </div>

          <div className="bg-base-200 p-4 rounded-lg shadow mb-6">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="mr-2 skeleton-icon" />
              <div className="skeleton h-5 w-32"></div>
            </div>
            <div className="skeleton h-64 w-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-base-200 p-4 rounded-lg shadow">
                <div className="skeleton h-5 w-32 mb-2"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="skeleton h-3 w-16"></div>
                      <div className="skeleton h-3 w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 bg-base-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Product not found</h1>
          <button 
            onClick={() => navigate('/products')}
            className="btn btn-primary mt-4"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-base-100 min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost mr-4"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-semibold text-base-content truncate">{product.name}</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="btn btn-sm btn-primary"
          >
            <FiEdit />
          </button>
          <button
            className="btn btn-error btn-sm text-base-200"
            onClick={() => setDeleteModalOpen(true)}
          >
            <MdDelete />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          {product.stock < (product.lowStockThreshold || 10) && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-error text-error-content">
              <FiAlertCircle size={18} /> Only {product.stock} in stock! Restock soon.
            </div>
          )}

          <div className="mb-6 bg-base-200 p-4 rounded-lg shadow">
            <h3 className="mb-3 flex items-center text-lg font-medium text-base-content">
              <FiImage className="mr-2" /> Product Images
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {product.images?.length ? (
                product.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden shadow cursor-pointer"
                    onClick={() => setZoomedImageIndex(i)}
                  >
                    <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <FiZoomIn className="text-white opacity-0 hover:opacity-100 transition-opacity" size={20} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-base-content/50">
                  <FiImage size={48} className="mb-2 opacity-50" />
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>

          {product.description && (
            <div className="bg-base-200 p-4 rounded-lg shadow mb-6">
              <h3 className="mb-3 flex items-center text-lg font-medium text-base-content">
                <FiInfo className="mr-2" /> Description
              </h3>
              <p className="text-base-content/80 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>

        <div className="lg:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-base-200 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2 text-base-content/70">
                <FiPackage className="mr-2" />
                <span className="font-medium">Stock</span>
              </div>
              <div className="text-2xl font-bold text-base-content">
                {product.stock}
              </div>
              <div className="mt-2 text-sm text-base-content/50">
                Low stock threshold: {product.lowStockThreshold || 10}
              </div>
            </div>

            <div className="bg-base-200 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2 text-base-content/70">
                <FiDollarSign className="mr-2" />
                <span className="font-medium">Pricing</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Cost:</span>
                  <span className="font-medium">${product.price?.costPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Selling:</span>
                  <span className="font-medium text-success">
                    ${product.price?.sellingPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-base-300 pt-1 mt-1">
                  <span className="text-base-content/70">Profit:</span>
                  <span className={`font-medium ${product.price?.income >= 0 ? 'text-success' : 'text-error'}`}>
                    ${product.price?.income?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2 text-base-content/70">
                <FiTag className="mr-2" />
                <span className="font-medium">Category</span>
              </div>
              <div className="text-lg font-medium text-base-content">
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

            <div className="bg-base-200 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2 text-base-content/70">
                <FiInfo className="mr-2" />
                <span className="font-medium">Seller Info</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-base-content/50">Seller</div>
                  <div className="font-medium">{product.seller?.username || product.seller || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/50">Shop</div>
                  <div className="font-medium">{product.shop?.shopname || product.shop || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Analytics */}
          <div className="bg-base-200 p-4 rounded-lg shadow mb-6">
            <h3 className="mb-4 flex items-center text-lg font-medium text-base-content">
              <FiTrendingUp className="mr-2" /> Stock Analytics
            </h3>
            <div className="h-64">
              <Line
                data={stockHistory || {
                  labels: ['Loading...'],
                  datasets: [{ data: [0] }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                  },
                }}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-base-200 p-4 rounded-lg shadow">
              <h3 className="mb-2 text-sm font-semibold text-base-content/50 uppercase tracking-wider">
                Product Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Created:</span>
                  <span>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Last Updated:</span>
                  <span>
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Views:</span>
                  <span>{product.view || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Status:</span>
                  <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-base-200 p-4 rounded-lg shadow">
              <h3 className="mb-2 text-sm font-semibold text-base-content/50 uppercase tracking-wider">
                Seller Verification
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Verified:</span>
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
                    <span className="text-base-content/70">Email:</span>
                    <span className="truncate max-w-[120px]">{product.seller.email}</span>
                  </div>
                )}
                {product.seller?.phone && (
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Phone:</span>
                    <span className="truncate max-w-[120px]">{product.seller.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoomed Image Modal */}
      {zoomedImageIndex !== null && product.images && (
        <div className="fixed inset-0  bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImageIndex(null)}
        >
          <div className="relative max-w-full max-h-full"
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
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-base-content">Edit Product</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="btn btn-sm btn-ghost"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text">Product Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Product Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Stock</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Stock"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Selling Price</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    placeholder="Selling Price"
                    value={editForm.price.sellingPrice}
                    onChange={(e) =>
                      setEditForm({ 
                        ...editForm, 
                        price: { ...editForm.price, sellingPrice: Number(e.target.value) } 
                      })
                    }
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Cost Price</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input input-bordered w-full"
                    placeholder="Cost Price"
                    value={editForm.price.costPrice}
                    onChange={(e) =>
                      setEditForm({ 
                        ...editForm, 
                        price: { ...editForm.price, costPrice: Number(e.target.value) } 
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-2">
              <button
                className="btn btn-outline btn-error"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdate}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <dialog open={deleteModalOpen} ref={deleteModalRef} className="modal">
        <div className="modal-box bg-base-100 dark:bg-gray-800 max-w-md p-6 rounded-lg border border-base-200 dark:border-gray-700">
          <h3 className="font-bold text-lg text-error">Delete Product</h3>
          <p className="py-4 text-sm text-base-content dark:text-gray-300">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2 justify-end w-full">
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={deleteProduct}
              >
                Yes, Delete
              </button>
              <button
                type="button"
                className="btn btn-neutral btn-sm"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ProductDetail;