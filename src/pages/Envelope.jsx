import React, { useEffect, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

const Envelope = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  const [coupons, setCoupons] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [editCouponId, setEditCouponId] = useState(null);
  const [editedCoupon, setEditedCoupon] = useState({
    _id: '',
    code: '',
    type: 'percent',
    amount: '',
    usageLimit: '',
    image: '',
    validDays: '',
  });
  const [deleteCouponId, setDeleteCouponId] = useState(null);

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleCoupons = coupons.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  const fetchCoupons = async () => {
    if (!token) {
      toast.error('Please log in to view coupons');
      navigate('/login');
      return;
    }

    setFetchLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/coupons`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });

      const fetched = res.data.coupons ?? res.data.data ?? (Array.isArray(res.data) ? res.data : []);
      const total = res.data.total ?? res.data.count ?? fetched.length;

      setCoupons(fetched);
      setPagination((p) => ({ ...p, total }));
    } catch (err) {
      console.error('Error fetching coupons:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        dispatch(logout());
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Failed to load coupons');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [token, pagination.current, pagination.pageSize]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCoupon((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (coupon) => {
    setEditCouponId(coupon._id);
    setEditedCoupon({
      _id: coupon._id,
      code: coupon.code || '',
      type: coupon.type || 'percent',
      amount: coupon.amount || '',
      usageLimit: coupon.usageLimit || '',
      image: coupon.image || '',
      validDays: coupon.validDays || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token || !editCouponId) return;

    setLoading(true);
    try {
      const payload = {
        code: editedCoupon.code,
        type: editedCoupon.type,
        amount: Number(editedCoupon.amount),
        usageLimit: editedCoupon.usageLimit ? Number(editedCoupon.usageLimit) : 0,
        image: editedCoupon.image,
        validDays: Number(editedCoupon.validDays),
      };

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons/${editCouponId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setCoupons((list) => list.map((c) => (c._id === editCouponId ? res.data : c)));
      toast.success('Coupon updated successfully!');
      setEditCouponId(null);
      setEditedCoupon({
        _id: '',
        code: '',
        type: 'percent',
        amount: '',
        usageLimit: '',
        image: '',
        validDays: '',
      });
    } catch (err) {
      console.error('Error updating coupon:', err);
      toast.error(err.response?.data?.message || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteCouponId(id);
  };

  const confirmDelete = async () => {
    if (!token || !deleteCouponId) return;

    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/coupons/${deleteCouponId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCoupons((list) => list.filter((c) => c._id !== deleteCouponId));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
      toast.success('Coupon deleted successfully!');
    } catch (err) {
      console.error('Error deleting coupon:', err);
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setLoading(false);
      setDeleteCouponId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-50 to-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-800">Coupon Management</h1>
            <p className="text-base-600 mt-1">Manage your discount coupons and promotions</p>
          </div>
        </div>

        {fetchLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="bg-base-200 rounded-xl shadow-sm border border-base-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-base-50">
                    <tr>
                      <th className="text-base-600 font-medium">ID</th>
                      <th className="text-base-600 font-medium">Banner</th>
                      <th className="text-base-600 font-medium">Code</th>
                      <th className="text-base-600 font-medium">Discount</th>
                      <th className="text-base-600 font-medium">Type</th>
                      <th className="text-base-600 font-medium">Usage Limit</th>
                      <th className="text-base-600 font-medium">Valid Days</th>
                      <th className="text-base-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCoupons.map((c) => (
                      <tr key={c._id} className="hover:bg-base-50 transition-colors">
                        <td className="font-mono text-sm text-base-500">#{c._id.slice(-6)}</td>
                        <td>
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img
                                src={c.image || 'https://via.placeholder.com/100?text=Coupon'}
                                alt="Coupon"
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono font-semibold bg-base-100 px-2 py-1 rounded">
                            {c.code}
                          </span>
                        </td>
                        <td className="font-semibold">
                          {c.amount}
                          {c.type === 'percent' ? '%' : c.type === 'fixed' ? '$' : ''}
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              c.type === 'percent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {c.type?.replace('_', ' ') || 'Not specified'}
                          </span>
                        </td>
                        <td>{c.usageLimit || 'Unlimited'}</td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              c.validDays > 30
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {c.validDays || 0} days
                          </span>
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <button
                              className="btn btn-sm btn-ghost btn-square text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEdit(c)}
                              title="Edit"
                            >
                              <MdEdit className="w-5 h-5" />
                            </button>
                            <button
                              className="btn btn-sm btn-ghost btn-square text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(c._id)}
                              title="Delete"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!visibleCoupons.length && (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-base-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                              />
                            </svg>
                            <p className="text-lg">No coupons found</p>
                            <p className="text-sm mt-1">Create your first coupon to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-base-200 bg-base-50 rounded-b-xl">
                <div className="text-sm text-base-600 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{pagination.total === 0 ? 0 : start + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(end, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> Coupons
                </div>
                <div className="join">
                  <button
                    className="join-item btn btn-sm btn-ghost"
                    disabled={pagination.current === 1}
                    onClick={() => setPagination((p) => ({ ...p, current: p.current - 1 }))}
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="join-item btn btn-sm btn-ghost">
                    Page {pagination.current} of {totalPages}
                  </button>
                  <button
                    className="join-item btn btn-sm btn-ghost"
                    disabled={pagination.current >= totalPages}
                    onClick={() => setPagination((p) => ({ ...p, current: p.current + 1 }))}
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Coupon Modal */}
        {editCouponId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 ease-out animate-fade-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-base-800">
                    Edit Coupon <span className="text-primary">#{editedCoupon._id.slice(-4)}</span>
                  </h2>
                  <button
                    onClick={() => setEditCouponId(null)}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Coupon Code</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="SUMMER20"
                      name="code"
                      value={editedCoupon.code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Discount Amount</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="20"
                        name="amount"
                        value={editedCoupon.amount}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Discount Type</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        name="type"
                        value={editedCoupon.type}
                        onChange={handleChange}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Banner Image URL</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="https://example.com/image.jpg"
                      name="image"
                      value={editedCoupon.image}
                      onChange={handleChange}
                    />
                    {editedCoupon.image && (
                      <div className="mt-2">
                        <div className="text-xs text-base-500 mb-1">Preview:</div>
                        <img
                          src={editedCoupon.image}
                          className="h-20 rounded border object-cover"
                          alt="Coupon preview"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=Invalid+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Usage Limit</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="0 for unlimited"
                        name="usageLimit"
                        value={editedCoupon.usageLimit}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Valid Days</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="30"
                        name="validDays"
                        value={editedCoupon.validDays}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setEditCouponId(null)}
                      disabled={loading}
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
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteCouponId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 ease-out animate-fade-in">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-base-900 mt-3">Delete Coupon</h3>
                  <div className="mt-2 text-sm text-base-500">
                    <p>Are you sure you want to delete this coupon? This action cannot be undone.</p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="btn btn-ghost w-full sm:col-start-2"
                    onClick={confirmDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline mt-3 w-full sm:mt-0"
                    onClick={() => setDeleteCouponId(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Envelope;