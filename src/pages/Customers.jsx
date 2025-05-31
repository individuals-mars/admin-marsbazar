import React from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../../src/components/TitleTemplate'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Customers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + "/api/auth/users"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customers, setCustomers] = useState([])

  const getCusmoters = async () => {
    setLoading(true)
    try {
      const response = await axios.get(URL)
      setCustomers(response.data)
      console.log(response);
      console.log("get cusmoter ishladi");
    } catch (error) {
      console.error("Xatolik", error);
      setError("Ko'tin boq")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCusmoters()
    console.log("Get cusmoter working");
  }, [])

  return (
   <ContainerTemplate>
    <div>
     <div>
       <TitleTemplate title="Customers" description="Here is customers list" />
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
              {
                customers.filter(customers => customers.role === 'user').map((cusmoter, index,) => (
                  <tr key={index}>
                    <th>
                      <label>
                       <p>{cusmoter._id}</p>
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={cusmoter.img}
                              alt="Avatar Tailwind CSS Component" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{cusmoter.username}</div>
                          <div className="text-sm opacity-50">{cusmoter.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                     {cusmoter.email}
                    </td>
                    <th>
                      <button className="btn btn-ghost btn-xs">details</button>
                    </th>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
    </div>
   </ContainerTemplate>
  )
}

export default Customers