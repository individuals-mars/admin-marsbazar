import React from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { useState, useEffect } from 'react'
import axios from 'axios'
const Sellers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sellers, setSellers] = useState([])

  const getSellers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(URL)
      console.log(response);
      console.log('Working');
      setSellers(response.data)

    } catch (error) {
      console.error('Error', error);
      setError("Ko'tin boq")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    getSellers()
    console.log("GetUser working");
  })
  return (
    <ContainerTemplate>
      <div>
        <div>
          <TitleTemplate title='Sellers' description='Here is all sellers list' />
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
              ) : sellers.length ? (
                 sellers.filter(sellers => sellers.role === 'seller').map((sellers, index,) => (
                  <tr key={index}>
                    <th>
                      <label>
                       <p>{sellers._id}</p>
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={sellers.img}
                              alt="Avatar Tailwind CSS Component" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{sellers.username}</div>
                          <div className="text-sm opacity-50">{sellers.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                     {sellers.email}
                    </td>
                    <td>{sellers.storeName}</td>
                    <th>
                      <button className="btn btn-ghost btn-xs">details</button>
                    </th>
                  </tr>
                ))
              ) : (
                 <tr>
                    <td colSpan={5} className="text-center p-5">
                     Sellers not found
                    </td>
                  </tr>
              )
              } 
            </tbody>
          </table>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default Sellers