import React, { useEffect, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
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
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
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

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!token) {
        toast.error('Please log in to view coupons');
        navigate('/login');
        return;
      }

      setFetchLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/coupons`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data) {
          throw new Error('No data received from server');
        }

        setCoupons(Array.isArray(response.data) ? response.data : response.data.data || []);
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

    fetchCoupons();
  }, [token, navigate, dispatch]);

  // Handle input changes for edit form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCoupon((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle delete confirmation via modal
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
      setCoupons(coupons.filter((c) => c._id !== deleteCouponId));
      toast.success('Coupon deleted successfully!');
    } catch (err) {
      console.error('Error deleting coupon:', err);
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setLoading(false);
      setDeleteCouponId(null);
    }
  };

  // Handle edit submission
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
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/coupons/${editCouponId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCoupons(coupons.map((c) => (c._id === editCouponId ? response.data : c)));
      toast.success('Coupon updated successfully!');
      setEditCouponId(null);
      setEditedCoupon({ _id: '', code: '', type: 'percent', amount: '', usageLimit: '', image: '', validDays: '' });
    } catch (err) {
      console.error('Error updating coupon:', err);
      toast.error(err.response?.data?.message || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a coupon
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-base-content">Coupons</h1>
        {/* Removed Add Coupon button as per request */}
      </div>

      {fetchLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
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
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td>#{c._id}</td>
                  <td>
                    <img src={c.image} className="w-20 rounded-lg shadow-sm" alt="Coupon" />
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
            </tbody>
          </table>
        </div>
      )}

      {editCouponId && (
        <div className="fixed inset-0 bg-opacity-75 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl shadow-lg p-6 w-full max-w-md animate-scale-up">
            <h2 className="text-2xl font-bold mb-6 text-center text-abse-350">
              ✏️ Edit Coupon <span className="text-primary  ">#{editedCoupon._id.slice(-4)}</span>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-75 bg-opacity-50">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this coupon? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setDeleteCouponId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDelete} disabled={loading}>
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