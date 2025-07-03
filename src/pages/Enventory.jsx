import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  FiArrowLeft, FiPlus, FiPackage, FiTrendingUp, 
  FiAlertCircle, FiEdit, FiTrash2, FiBarChart2,
  FiDollarSign, FiShoppingBag, FiClock, FiChevronLeft,
  FiChevronRight, FiSearch, FiX
} from 'react-icons/fi';
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

const Enventory = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(''); // 'add', 'history', 'summary', 'predict'
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [stockSummary, setStockSummary] = useState({});
  const [predictionData, setPredictionData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const deleteModalRef = useRef(null);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchQuery
        }
      });
      
      setProducts(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (error) {
      toast.error('Failed to load products');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, searchQuery]);

  // Modal control functions
  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    
    // Load additional data based on modal type
    switch (type) {
      case 'history':
        fetchInventoryHistory(product._id);
        break;
      case 'summary':
        fetchStockSummary(product._id);
        break;
      case 'predict':
        fetchStockPrediction(product._id);
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setModalType('');
    setSelectedProduct(null);
  };

  const fetchInventoryHistory = async (productId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/inventory-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInventoryHistory(response.data.history);
    } catch (error) {
      toast.error('Failed to load inventory history');
    }
  };

  const fetchStockSummary = async (productId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/stock-summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStockSummary(response.data);
    } catch (error) {
      toast.error('Failed to load stock summary');
    }
  };

  const fetchStockPrediction = async (productId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/predict`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPredictionData(response.data);
    } catch (error) {
      toast.error('Failed to generate stock prediction');
    }
  };

  const handleAddInventory = async (values) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${selectedProduct._id}/inventory`,
        {
          quantity: values.quantity,
          notes: values.notes,
          type: 'incoming'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Inventory updated successfully');
      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${selectedProduct._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Product deleted successfully');
      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          {record.images?.[0] && (
            <img 
              src={record.images[0]} 
              alt={record.name}
              className="w-10 h-10 rounded-md object-cover mr-3"
            />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <div className={`badge ${stock < 10 ? 'badge-error' : stock < 50 ? 'badge-warning' : 'badge-success'}`}>
          {stock} units
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <div className="font-medium">
          ${price?.sellingPrice?.toFixed(2) || '0.00'}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            className="btn btn-xs btn-primary"
            onClick={() => openModal('add', record)}
          >
            <FiPlus size={14} />
          </button>
          <button
            className="btn btn-xs btn-info"
            onClick={() => openModal('history', record)}
          >
            <FiClock size={14} />
          </button>
          <button
            className="btn btn-xs btn-secondary"
            onClick={() => openModal('summary', record)}
          >
            <FiBarChart2 size={14} />
          </button>
          <button
            className="btn btn-xs btn-warning"
            onClick={() => openModal('predict', record)}
          >
            <FiAlertCircle size={14} />
          </button>
          <button
            className="btn btn-xs btn-error"
            onClick={() => {
              setSelectedProduct(record);
              deleteModalRef.current.showModal();
            }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <div className={`badge ${type === 'incoming' ? 'badge-success' : 'badge-error'}`}>
          {type.toUpperCase()}
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || '—',
    },
  ];

  // Stock chart data
  const stockChartData = {
    labels: ['Current', 'Incoming', 'Outgoing', 'Adjusted'],
    datasets: [{
      label: 'Stock Movement',
      data: [
        stockSummary.currentStock || 0,
        stockSummary.totalIn || 0,
        stockSummary.totalOut || 0,
        stockSummary.totalAdjust || 0
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className="w-full mx-auto px-4 py-8 bg-base-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost mr-4"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-semibold">Inventory Management</h1>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <FiX />
              </button>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/createproducts')}
          >
            <FiPlus className="mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-base-200 rounded-lg shadow p-4">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                {productColumns.map((column) => (
                  <th key={column.key}>{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={productColumns.length} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={productColumns.length} className="text-center py-8">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    {productColumns.map((column) => (
                      <td key={column.key}>
                        {column.render 
                          ? column.render(product[column.dataIndex], product)
                          : product[column.dataIndex]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} products
          </div>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current === 1}
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
            >
              <FiChevronLeft />
            </button>
            <button className="join-item btn btn-sm">
              Page {pagination.current}
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {modalType === 'add' && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Add Inventory - {selectedProduct?.name}
              </h3>
              <button onClick={closeModal} className="btn btn-sm btn-ghost">
                <FiX />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddInventory({
                quantity: e.target.quantity.value,
                notes: e.target.notes.value
              });
            }}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Quantity to Add</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  className="input input-bordered w-full"
                  min="1"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  name="notes"
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  placeholder="Additional information about this inventory update"
                ></textarea>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory History Modal */}
      {modalType === 'history' && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Inventory History - {selectedProduct?.name}
              </h3>
              <button onClick={closeModal} className="btn btn-sm btn-ghost">
                <FiX />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    {historyColumns.map((column) => (
                      <th key={column.key}>{column.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryHistory.map((record, index) => (
                    <tr key={index}>
                      {historyColumns.map((column) => (
                        <td key={column.key}>
                          {column.render 
                            ? column.render(record[column.dataIndex], record)
                            : record[column.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Summary Modal */}
      {modalType === 'summary' && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Stock Summary - {selectedProduct?.name}
              </h3>
              <button onClick={closeModal} className="btn btn-sm btn-ghost">
                <FiX />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <FiPackage size={24} />
                  </div>
                  <div className="stat-title">Current Stock</div>
                  <div className="stat-value">{stockSummary.currentStock || 0}</div>
                  <div className="stat-desc">units available</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <FiTrendingUp size={24} />
                  </div>
                  <div className="stat-title">Total Incoming</div>
                  <div className="stat-value">{stockSummary.totalIn || 0}</div>
                  <div className="stat-desc">units received</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-accent">
                    <FiShoppingBag size={24} />
                  </div>
                  <div className="stat-title">Total Outgoing</div>
                  <div className="stat-value">{stockSummary.totalOut || 0}</div>
                  <div className="stat-desc">units sold</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-info">
                    <FiEdit size={24} />
                  </div>
                  <div className="stat-title">Total Adjusted</div>
                  <div className="stat-value">{stockSummary.totalAdjust || 0}</div>
                  <div className="stat-desc">manual adjustments</div>
                </div>
              </div>
            </div>
            <div className="h-64">
              <Line
                data={stockChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Prediction Modal */}
      {modalType === 'predict' && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Stock Prediction - {selectedProduct?.name}
              </h3>
              <button onClick={closeModal} className="btn btn-sm btn-ghost">
                <FiX />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <FiPackage size={24} />
                  </div>
                  <div className="stat-title">Current Stock</div>
                  <div className="stat-value">{predictionData.currentStock || 0}</div>
                  <div className="stat-desc">units available</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <FiTrendingUp size={24} />
                  </div>
                  <div className="stat-title">Avg Daily Sales</div>
                  <div className="stat-value">{predictionData.avgDailySales?.toFixed(2) || 0}</div>
                  <div className="stat-desc">units per day</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-warning">
                    <FiAlertCircle size={24} />
                  </div>
                  <div className="stat-title">Predicted Out of Stock</div>
                  <div className="stat-value">
                    {predictionData.predictedOutOfStock 
                      ? new Date(predictionData.predictedOutOfStock).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                  <div className="stat-desc">
                    {predictionData.predictedOutOfStock 
                      ? `${Math.ceil((new Date(predictionData.predictedOutOfStock) - new Date()) / (1000 * 60 * 60 * 24))} days remaining` 
                      : 'Insufficient data'}
                  </div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-info">
                    <FiClock size={24} />
                  </div>
                  <div className="stat-title">Recommended Reorder</div>
                  <div className="stat-value">
                    {predictionData.recommendedReorderDate 
                      ? new Date(predictionData.recommendedReorderDate).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                  <div className="stat-desc">
                    {predictionData.recommendedReorderDate 
                      ? 'Order before this date' 
                      : 'Insufficient data'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Delete Product</h3>
          <p className="py-4">
            Are you sure you want to delete {selectedProduct?.name}? This action cannot be undone.
          </p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={deleteProduct}>
                Delete
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Enventory;