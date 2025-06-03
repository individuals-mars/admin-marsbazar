import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { toast } from 'react-toastify'

const Sellers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sellers, setSellers] = useState([])

  const getSellers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(URL)
      setSellers(res.data.filter((user) => user.role === 'seller'))
    } catch (err) {
      setError("Ошибка при загрузке продавцов")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSellers()
  }, [])

  return (
    <ContainerTemplate>
      <TitleTemplate title="Sellers" description="List of sellers" />
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
              sellers.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img
                            src={user.img || '/default-avatar.png'}
                            onError={(e) => (e.target.src = '/default-avatar.png')}
                            alt="Seller"
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
      </div>
    </ContainerTemplate>
  )
}

export default Sellers
