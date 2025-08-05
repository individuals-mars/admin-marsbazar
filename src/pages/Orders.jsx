import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOrders } from '../store/orderSlice';
import _ from 'lodash';
import {
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Package, MapPin, Phone, User, Calendar, CreditCard,
  ShoppingBag, Eye, Sun, Moon
} from 'lucide-react';
import axios from 'axios';

// Utility functions
const formatPrice = (price) => `$${parseFloat(price || 0).toFixed(2)}`;
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}) : 'N/A';

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'paid': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'failed': return 'badge-error';
    default: return 'badge-neutral';
  }
};

const getStatusText = (status) => status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

const Orders = () => {
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;
  const [orders, setLocalOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: [5, 10, 20, 50]
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const fetchOrders = _.debounce(async () => {
    setLoading(true);
    try {
      const apiUrl = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/orders`);
      apiUrl.searchParams.set('page', pagination.current);
      apiUrl.searchParams.set('limit', pagination.pageSize);
      if (searchQuery) apiUrl.searchParams.set('search', searchQuery);

      console.log("Final API URL:", apiUrl.toString());

      const res = await axios.get(apiUrl.toString());
      const data = res.data;

      if (!data.success && !Array.isArray(data.orders) && !Array.isArray(data.data)) {
        throw new Error(data.message || "Unexpected response format");
      }

      const fetchedOrders = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.orders)
          ? data.orders
          : [];

      const total = data.total || data.count || fetchedOrders.length;

      setLocalOrders(fetchedOrders);
      setPagination(prev => ({ ...prev, total }));
      dispatch(setOrders(fetchedOrders));
    } catch (err) {
      console.error('Axios Error:', err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || 'Failed to fetch orders!');
      setLocalOrders([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, 300);



  useEffect(() => {
    fetchOrders();
    return () => fetchOrders.cancel();
  }, [pagination.current, pagination.pageSize, searchQuery]);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sorted = [...orders].sort((a, b) => {
      if (key === 'age') {
        const ageA = a.user?.age || 0;
        const ageB = b.user?.age || 0;
        return direction === 'asc' ? ageA - ageB : ageB - ageA;
      } else if (key === 'status') {
        const statusA = a.paymentStatus || '';
        const statusB = b.paymentStatus || '';
        return direction === 'asc' ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
      } else if (key === 'gender') {
        const genderA = a.user?.gender?.toLowerCase() || '';
        const genderB = b.user?.gender?.toLowerCase() || '';
        return direction === 'asc' ? genderA.localeCompare(genderB) : genderB.localeCompare(genderA);
      }
      return 0;
    });

    setLocalOrders(sorted);
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1;
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, pagination.total);
  const visibleOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPagination(prev => ({ ...prev, current: page }));
    }
  };

  const handlePageSizeChange = (size) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      current: 1
    }));
  };

  const selectOrderDetail = (order) => {
    dispatch(setOrders([order]));
    navigate(`/ordersinfo/${order._id}`);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, pagination.current - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) pages.push(1);
      if (start > 2) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push('...');
      if (end < totalPages) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="rounded-2xl shadow-sm border border-base-300 p-6 mb-6 bg-base-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className='flex gap-2'>
                <ShoppingBag className="w-7 h-7 text-primary" />
                <h1 className="text-2xl font-bold">Orders</h1>
              </div>
              <span className="badge badge-primary">
                {pagination.total}
              </span>
            </div>

            <div className="flex items-center gap-3">


              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-70" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-xl input input-bordered focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Search orders"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn">
                  <Filter className="w-4 h-4" />
                  <span>Sort</span>
                  <ArrowUpDown className="w-4 h-4 opacity-70" />
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52">
                  <li><button onClick={() => handleSort('age')}><User className="w-4 h-4" /> By Age</button></li>
                  <li><button onClick={() => handleSort('status')}><CreditCard className="w-4 h-4" /> By Status</button></li>
                  <li><button onClick={() => handleSort('gender')}><User className="w-4 h-4" /> By Gender</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl shadow-sm border border-base-300 overflow-hidden bg-base-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-base-300">
                <tr>
                  <th className="text-left p-4 font-semibold">#</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Product</th>
                  <th className="text-left p-4 font-semibold">Contact</th>
                  <th className="text-left p-4 font-semibold">Address</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-16 h-16 mb-4 opacity-30" />
                        <h3 className="text-lg font-medium">No orders found</h3>
                        <p className="opacity-70">Try adjusting your search parameters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((order, index) => (
                    <tr
                      key={order._id || index}
                      className="border-b border-base-300 hover:bg-base-300/30"
                    >
                      <td className="p-4">
                        <span className="opacity-80">
                          {startIndex + index + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.user?.name || 'Unknown'}
                          </span>
                          <div className="flex items-center gap-1 text-sm opacity-70">
                            <User className="w-3 h-3" />
                            {order.user?.age || '—'} years, {order.user?.gender === 'male' ? 'M' : 'F'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 opacity-70" />
                          <span>
                            {order.items?.[0]?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 opacity-90">
                          <Phone className="w-3 h-3 opacity-70" />
                          {order.user?.phone || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1 text-sm mb-1 opacity-90">
                            <MapPin className="w-3 h-3 opacity-70" />
                            {order.deliveryDetails?.city || 'Unknown'}
                          </div>
                          <div className="text-xs opacity-70 truncate">
                            {order.deliveryDetails?.address || 'No address provided'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`badge ${getStatusColor(order.paymentStatus)}`}>
                          {getStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm opacity-90">
                          <Calendar className="w-3 h-3 opacity-70" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => selectOrderDetail(order)}
                          className="btn btn-ghost btn-sm"
                          aria-label={`View details for order ${order._id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-base-300 bg-base-300/50 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">Show</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="select select-bordered select-sm"
              >
                {pagination.pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm opacity-80">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="btn btn-sm btn-ghost"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="join">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <button key={`ellipsis-${index}`} className="join-item btn btn-sm btn-disabled">...</button>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`join-item btn btn-sm ${pagination.current === page ? 'btn-active' : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= totalPages}
                className="btn btn-sm btn-ghost"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm opacity-80">
              Showing {startIndex + 1}-{Math.min(endIndex, pagination.total)} of {pagination.total} orders
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;