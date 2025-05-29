import React, { useEffect } from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { useState } from 'react'
import axios from 'axios'

const Allusers = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/auth/users'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])


  const getUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(URL)
      console.log(response);
      console.log('Working');
      setUsers(response.data)

    } catch (error) {
      console.error('Error', error);
      setError("Ko'tin boq")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsers()
    console.log("GetUser working");
  }, [])


  return (
    <ContainerTemplate>
      <div>
        <div>
          <TitleTemplate title='All Users' description='Here is all users list' />
        </div>
        <div>
          <div className="overflow-x-auto mt-5 bg-base-100 rounded-lg">
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
                  <th>Email</th>
                  <th>Settings</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex justify-center items-center p-5">
                        <span className="loading loading-spinner loading-lg"></span>
                      </div>
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((user, index) => (
                    <tr key={index}>
                      <th>
                        <label>
                          <p>{user._id}</p>
                        </label>
                      </th>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle bg-base-300 h-12 w-12">
                              <img
                                src={user.img}
                                alt="Avatar Tailwind CSS Component"
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
                      <td>Purple</td>
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
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default Allusers