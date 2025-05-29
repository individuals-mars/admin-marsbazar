
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Admins = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [admins, setAdmins] = useState([])


  const getAdmins = async () => {
    setLoading(true)
    try {
      const response = await axios.get(URL)
      setAdmins(response.data)
      console.log('Get Admin working', response.data)
    } catch (error) {
      setError('Xatolik', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAdmins()
    console.log('Get admins working');

  }, [])
  return (
    <ContainerTemplate>
      <div>
        <div>
          <TitleTemplate title="Admins" description='Here is all admins list' />
        </div>
        <div className="overflow-x-auto bg-base-100 mt-5 rounded-lg">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>
                  <label>
                    <p>ID</p>
                  </label>
                </th>
                <th>Name</th>
                <th>Job</th>
                <th>Favorite Color</th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              { loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex justify-center items-center p-5">
                        <span className="loading loading-spinner loading-lg"></span>
                      </div>
                    </td>
                  </tr>
              ) : admins.length ? (
                admins.filter(admins => admins.role === 'admin').map((admin, index,) => (
                  <tr key={index}>
                    <th>
                      <label>
                        <p>{admin._id}</p>
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={admin.img}
                              alt="Avatar Tailwind CSS Component" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{admin.username}</div>
                          <div className="text-sm opacity-50">{admin.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {admin.email}
                    </td>
                    <th>
                      <button className="btn btn-ghost btn-xs">details</button>
                    </th>
                  </tr>
                ))
              ) : (
                 <tr>
                    <td colSpan={5} className="text-center p-5">
                     Users not found
                    </td>
                  </tr>
             ) }
            </tbody>
          </table>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default Admins