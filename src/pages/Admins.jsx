import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { toast } from 'react-toastify';
import { FiChevronRight, FiChevronLeft, FiUser, FiMail, FiKey, FiEye } from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";

const Admins = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const getAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(URL, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          role: 'admin',
        },
      });

      const fetched = data.users ?? data.data ?? data ?? [];
      const onlyAdmins = fetched.filter(u => u.role === 'admin');
      const total = data.total ?? data.count ?? onlyAdmins.length;

      setAdmins(onlyAdmins);
      setPagination(prev => ({ ...prev, total }));
    } catch (err) {
      setError('Failed to load administrators');
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdmins();
  }, [pagination.current, pagination.pageSize]);

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleAdmins = admins.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  return (
    <ContainerTemplate>
      <TitleTemplate 
        title="Administrators" 
        description="Management team with full system access" 
        titleClassName="text-primary"
      />
      
      <div className="card bg-gradient-to-br from-primary/5 to-base-100 shadow-lg mt-6 border border-primary/20">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-primary/10 text-primary">
                <tr>
                  <th className="w-16"></th>
                  <th>Administrator</th>
                  <th>Contact</th>
                  <th>Access Level</th>
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
                          className="btn btn-sm btn-outline btn-primary mt-4"
                          onClick={getAdmins}
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <div className="text-primary/70">
                        <RiAdminLine className="h-12 w-12 mx-auto" />
                        <p className="mt-2 font-medium">No administrators found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleAdmins.map((user) => (
                    <tr key={user._id} className="hover:bg-primary/5 transition-colors">
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12 bg-primary/10 flex items-center justify-center">
                            {user.img ? (
                              <img 
                                src={user.img} 
                                alt={user.username}
                                onError={(e) => (e.target.src = '/default-avatar.png')}
                              />
                            ) : (
                              <RiAdminLine className="w-6 h-6 text-primary" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-sm text-primary/70">ID: {user._id.slice(-6)}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FiMail className="text-primary/70" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary badge-sm gap-1">
                          <RiAdminLine className="mr-1" />
                          {user.role}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="btn btn-ghost btn-sm btn-square text-primary hover:bg-primary/10">
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && !error && admins.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-primary/10">
              <div className="text-sm text-primary/70">
                Showing <span className="font-medium text-primary">{start + 1}</span> to{' '}
                <span className="font-medium text-primary">{Math.min(end, pagination.total)}</span> of{' '}
                <span className="font-medium text-primary">{pagination.total}</span> administrators
              </div>
              
              <div className="join">
                <button
                  className="join-item btn btn-sm btn-ghost text-primary hover:bg-primary/10"
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
                      {i > 0 && arr[i-1] !== page - 1 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn btn-sm ${pagination.current === page ? 'btn-primary' : 'btn-ghost text-primary hover:bg-primary/10'}`}
                        onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))
                }
                
                <button
                  className="join-item btn btn-sm btn-ghost text-primary hover:bg-primary/10"
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

export default Admins;