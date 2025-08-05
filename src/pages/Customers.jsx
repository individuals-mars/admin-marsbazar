import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiChevronRight, FiChevronLeft, FiUser, FiMail, FiShoppingBag, FiEye } from "react-icons/fi";
import { GrUserAdmin } from 'react-icons/gr';

const Customers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  const getCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(URL, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          role: 'customer'
        }
      });

      const fetched = (data.users ?? data.data ?? data ?? []).filter(u => u.role === 'customer');
      const total = data.total ?? fetched.length;

      setCustomers(fetched);
      setPagination(prev => ({ ...prev, total }));
    } catch (err) {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const UpToAdmins = async (userId) => {
    if (!token) {
      toast.error("Ты не авторизован.");
      return;
    }

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/role`,
        { userId, newRole: 'admin' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Пользователь назначен админом");
      getUsers();
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);

      if (error.response?.status === 403) {
        toast.error("Недостаточно прав (403)");
      } else if (error.response?.status === 404) {
        toast.error("Пользователь не найден (404)");
      } else {
        toast.error("Ошибка при назначении админом");
      }
    }
  };

  useEffect(() => {
    getCustomers();
  }, [pagination.current, pagination.pageSize]);

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleCustomers = customers.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  return (
    <ContainerTemplate>
      <TitleTemplate
        title="Customers"
        description="Our valued clients"
        titleClassName="text-secondary"
      />

      <div className="card bg-gradient-to-br from-secondary/5 to-base-100 shadow-lg mt-6 border border-secondary/20">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-secondary/10 text-secondary">
                <tr>
                  <th className="w-16"></th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Member Since</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(pagination.pageSize)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5}>
                        <div className="flex items-center space-x-4 p-4">
                          <div className="skeleton w-12 h-12 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-3/4"></div>
                            <div className="skeleton h-4 w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <div className="text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="mt-2 font-medium">{error}</p>
                        <button
                          className="btn btn-sm btn-outline btn-secondary mt-4"
                          onClick={getCustomers}
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <div className="text-secondary/70">
                        <FiShoppingBag className="h-12 w-12 mx-auto" />
                        <p className="mt-2 font-medium">No customers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleCustomers.map((user) => (
                    <tr key={user._id} className="hover:bg-secondary/5 transition-colors">
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12 bg-secondary/10 flex items-center justify-center">
                            {user.img ? (
                              <img
                                src={user.img}
                                alt={user.username}
                                onError={(e) => (e.target.src = '/default-avatar.png')}
                              />
                            ) : (
                              <FiUser className="w-6 h-6 text-secondary" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-sm text-secondary/70">ID: {user._id.slice(-6)}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FiMail className="text-secondary/70" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary badge-sm gap-1">
                          <FiUser className="mr-1" />
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="btn btn-ghost btn-sm btn-square text-secondary hover:bg-secondary/10">
                          <FiEye />
                        </button>

                        <button
                          className='btn btn-ghost btn-sm btn-square text-secondary hover:bg-secondary/10'
                          onClick={() => UpToAdmins(user._id)}
                        >
                          <GrUserAdmin />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && !error && customers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-secondary/10">
              <div className="text-sm text-secondary/70">
                Showing <span className="font-medium text-secondary">{start + 1}</span> to{' '}
                <span className="font-medium text-secondary">{Math.min(end, pagination.total)}</span> of{' '}
                <span className="font-medium text-secondary">{pagination.total}</span> customers
              </div>

              <div className="join">
                <button
                  className="join-item btn btn-sm btn-ghost text-secondary hover:bg-secondary/10"
                  disabled={pagination.current === 1}
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === pagination.current ||
                    page === pagination.current - 1 ||
                    page === pagination.current + 1 ||
                    page === totalPages
                  )
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn btn-sm ${pagination.current === page ? 'btn-secondary' : 'btn-ghost text-secondary hover:bg-secondary/10'}`}
                        onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))
                }

                <button
                  className="join-item btn btn-sm btn-ghost text-secondary hover:bg-secondary/10"
                  disabled={pagination.current >= totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ContainerTemplate>
  );
};

export default Customers;