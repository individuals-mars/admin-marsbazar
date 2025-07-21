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
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: pagination.current,
            limit: pagination.pageSize,
          },
        }
      );

      if (!res.data) {
        throw new Error('No data received from server');
      }

      const fetched =
        res.data.coupons ??
        res.data.data ??
        (Array.isArray(res.data) ? res.data : []) ??
        [];

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
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
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
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons/${deleteCouponId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-base-content">Coupons</h1>
      </div>

      {fetchLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Banner</th>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Usage Limit</th>
                  <th>Valid Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCoupons.map((c) => (
                  <tr key={c._id}>
                    <td>#{c._id}</td>
                    <td>
                      <img
                        src={c.image}
                        className="w-20 rounded-lg shadow-sm"
                        alt="Coupon"
                      />
                    </td>
                    <td>{c.code}</td>
                    <td>
                      {c.amount}
                      {c.type === 'percent' ? '%' : c.type === 'fixed' ? '$' : ''}
                    </td>
                    <td className="capitalize">
                      {c.type?.replace('_', ' ') || 'Not specified'}
                    </td>
                    <td>{c.usageLimit || 0}</td>
                    <td>{c.validDays || 0}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-sm btn-outline btn-warning"
                        onClick={() => handleEdit(c)}
                      >
                        <MdEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => handleDelete(c._id)}
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}

                {!visibleCoupons.length && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 opacity-60">
                      No coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 mb-5 p-4">
            <div className="text-sm text-gray-600">
              Showing {pagination.total === 0 ? 0 : start + 1} to{' '}
              {Math.min(end, pagination.total)} of {pagination.total} Coupons
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={pagination.current === 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, current: p.current - 1 }))
                }
              >
                <FiChevronLeft />
              </button>
              <button className="join-item btn btn-sm">
                Page {pagination.current} / {totalPages}
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={pagination.current >= totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, current: p.current + 1 }))
                }
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {editCouponId && (
        <div className="fixed inset-0 bg-opacity-50 bg-base-200/70 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl shadow-lg p-6 w-full max-w-md animate-scale-up">
            <h2 className="text-2xl font-bold mb-6 text-center text-base-content">
              ✏️ Edit Coupon{' '}
              <span className="text-primary">#{editedCoupon._id.slice(-4)}</span>
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Code"
                name="code"
                value={editedCoupon.code}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Amount"
                name="amount"
                value={editedCoupon.amount}
                onChange={handleChange}
                required
                min="0"
              />
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Image URL"
                name="image"
                value={editedCoupon.image}
                onChange={handleChange}
              />
              <select
                className="select select-bordered w-full"
                name="type"
                value={editedCoupon.type}
                onChange={handleChange}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Usage Limit"
                name="usageLimit"
                value={editedCoupon.usageLimit}
                onChange={handleChange}
                min="0"
              />
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Valid Days"
                name="validDays"
                value={editedCoupon.validDays}
                onChange={handleChange}
                min="0"
                required
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn btn-outline btn-error"
                  onClick={() => setEditCouponId(null)}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : '💾 Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCouponId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-base-200/70">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this coupon? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteCouponId(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Envelope;
