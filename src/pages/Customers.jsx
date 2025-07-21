import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { FiChevronRight } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";

const Customers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleCustumers = customers.slice(start, end);


  const getCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(URL); 
      const fetched = (data.users ?? data.data ?? data ?? []).filter(u => u.role === 'customer');
      setCustomers(fetched);
      setPagination(prev => ({ ...prev, total: fetched.length }));
    } catch (err) {
      console.error(err);
      setError("Ошибка при загрузке клиентов");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getCustomers()
  }, [pagination.current, pagination.pageSize])

  return (
    <ContainerTemplate>
      <TitleTemplate title="Customers" description="Client list" />
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
              [...Array(2)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5}>
                    <div className="skeleton h-12 w-full"></div>
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
              visibleCustumers.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img
                            src={user.img || '/default-avatar.png'}
                            onError={(e) => (e.target.src = '/default-avatar.png')}
                            alt="User"
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
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 mb-5 p-4">
            <div className="text-sm text-gray-600">
              Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} Users
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
      </div>
    </ContainerTemplate>
  )
}

export default Customers
