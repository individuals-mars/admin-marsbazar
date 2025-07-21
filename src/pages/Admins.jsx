import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { toast } from 'react-toastify';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const Admins = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users';

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // загружаем админов
  const getAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(URL, {
        params: {
          page:  pagination.current,
          limit: pagination.pageSize,
          role:  'admin',              
        },
      });

      const fetched = data.users ?? data.data ?? data ?? [];
      const onlyAdmins = fetched.filter(u => u.role === 'admin');

      const total = data.total ?? data.count ?? onlyAdmins.length;

      setAdmins(onlyAdmins);
      setPagination(prev => ({ ...prev, total }));
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке администраторов');
      toast.error('Не удалось загрузить админов'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdmins();
  }, [pagination.current, pagination.pageSize]);

  const start = (pagination.current - 1) * pagination.pageSize;
  const end   = start + pagination.pageSize;
  const visibleAdmins = admins.slice(start, end);

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  return (
    <ContainerTemplate>
      <TitleTemplate title="Admins" description="List of administrators" />
      <div className="overflow-x-auto bg-base-100 mt-5 rounded-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5}>
                    <div className="skeleton h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5}>
                  <p className="text-center text-red-500 mt-3">{error}</p>
                </td>
              </tr>
            ) : (
              visibleAdmins.map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img
                            src={user.img || '/default-avatar.png'}
                            onError={e => (e.target.src = '/default-avatar.png')}
                            alt="Admin"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user.username}</div>
                        <div className="text-sm opacity-50">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="btn btn-ghost btn-xs">Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 mb-5 p-4">
          <div className="text-sm text-gray-600">
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} Admins
          </div>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current === 1}
              onClick={() =>
                setPagination(prev => ({ ...prev, current: prev.current - 1 }))
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
                setPagination(prev => ({ ...prev, current: prev.current + 1 }))
              }
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </ContainerTemplate>
  );
};

export default Admins;
