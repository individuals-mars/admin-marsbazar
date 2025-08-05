import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { toast } from 'react-toastify';
import { FiChevronRight, FiChevronLeft, FiUser, FiMail, FiKey, FiEye } from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";
import { GrUserAdmin } from "react-icons/gr";
import { useSelector } from 'react-redux';


const AllUsers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8, total: 0 });
  const [users, setUsers] = useState([]);
  const { token, role } = useSelector((state) => state.user);

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleUsers = users.slice(start, end);

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(URL, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
        }
      });

      const fetchedUsers = data.users ?? data.data ?? data ?? [];
      const total = data.total ?? fetchedUsers.length;

      setUsers(fetchedUsers);
      setPagination(prev => ({ ...prev, total }));
    } catch (err) {
      setError("Failed to load users");
      toast.error("Failed to load users");
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
      getUsers(); // обновим список
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
    getUsers();

  }, [pagination.current, pagination.pageSize]);

  const RoleBadge = ({ role }) => {
    const roleConfig = {
      admin: { color: 'badge-primary', icon: <RiAdminLine className="mr-1" /> },
      user: { color: 'badge-secondary', icon: <FiUser className="mr-1" /> },
      moderator: { color: 'badge-accent', icon: <FiKey className="mr-1" /> },
      default: { color: 'badge-neutral', icon: <FiUser className="mr-1" /> }
    };

    const config = roleConfig[role.toLowerCase()] || roleConfig.default;

    return (
      <span className={`badge ${config.color} badge-sm gap-1`}>
        {config.icon}
        {role}
      </span>
    );
  };

  return (
    <ContainerTemplate>
      <TitleTemplate
        title="User Management"
        description="Manage all registered users in the system"
      />

      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              {/* Table header */}
              <thead className="bg-base-200">
                <tr>
                  <th className="w-16"></th>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {loading ? (
                  // Skeleton loading
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
                  // Error state
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <div className="text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="mt-2 font-medium">{error}</p>
                        <button
                          className="btn btn-sm btn-outline mt-4"
                          onClick={getUsers}
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  // Empty state
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <div className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="mt-2 font-medium">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // User data
                  visibleUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-base-200/50 transition-colors">
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={user.img || '/default-avatar.png'}
                              alt={user.username}
                              onError={(e) => (e.target.src = '/default-avatar.png')}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-sm text-gray-500">ID: {user._id.slice(-6)}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FiMail className="text-gray-400" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{user.phone}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="text-right gap-2">
                        <button  className='btn btn-ghost btn-sm btn-square'>
                            <FiEye/>
                        </button>
                        {role === 'admin' && user.role !== 'admin' && (
                          <button
                            className='btn btn-ghost btn-sm btn-square'
                            onClick={() => UpToAdmins(user._id)}
                          >
                            <GrUserAdmin />
                          </button>
                        )}

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{start + 1}</span> to{' '}
                <span className="font-medium">{Math.min(end, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> users
              </div>

              <div className="join">
                <button
                  className="join-item btn btn-sm btn-ghost"
                  disabled={pagination.current === 1}
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === pagination.current ||
                    page === pagination.current - 1 ||
                    page === pagination.current + 1 ||
                    page === Math.ceil(pagination.total / pagination.pageSize)
                  )
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn btn-sm ${pagination.current === page ? 'btn-active' : ''}`}
                        onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))
                }

                <button
                  className="join-item btn btn-sm btn-ghost"
                  disabled={pagination.current * pagination.pageSize >= pagination.total}
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

export default AllUsers;