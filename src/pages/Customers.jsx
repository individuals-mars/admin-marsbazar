import React, { useState, useEffect } from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import axios from 'axios'

const Customers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + "/api/auth/users"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customers, setCustomers] = useState([])

  const getCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(URL)
      setCustomers(response.data)
      console.log("getCustomers worked", response.data)
    } catch (error) {
      console.error("Error:", error)
      setError("Что-то пошло не так, братан")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCustomers()
  }, [])

  if (loading) return <p className="text-center mt-5">Loading customers...</p>
  if (error) return <p className="text-center text-red-500 mt-5">{error}</p>

  return (
    <ContainerTemplate>
      <div>
        <TitleTemplate title="Customers" description="Here is customers list" />
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
              {customers
                .filter(customer => customer.role === 'user')
                .map(customer => (
                  <tr key={customer._id}>
                    <th>{customer._id}</th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={customer.img || '/default-avatar.png'}
                              alt="Avatar"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{customer.username}</div>
                          <div className="text-sm opacity-50">{customer.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.role}</td>
                    <td>
                      <button className="btn btn-ghost btn-xs">details</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default Customers
