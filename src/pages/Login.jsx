import React, { useState } from 'react'
import axios from 'axios'
import { login } from '../store/userSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'


const Login = () => {
  const postURL = import.meta.env.VITE_BACKEND_URL + '/api/auth/login'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const handleCHange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  };

  const handleSumbit = async (e)  => {
    try {
      const request = await fetch(postURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const response = await request.json()
      console.log(response)
      dispatch(login({
        token: response?.token,
        user: response,
        role: response?.role
      }))
      navigate('/dashboard')
      // setFormData(response.data)
      setLoading(true)
    } catch (error) {
      console.error('Error', error);
      setLoading(false)
    } finally {
      setLoading(false)
    }
  };
  return (
    <div className='flex gap-5'>
      <img className='h-screen rounded-r-3xl  max-w-[70%]' src="https://t4.ftcdn.net/jpg/10/02/26/95/360_F_1002269509_CxzaEMTWOJqMcI8bcKO1KOEEuviJrZWA.jpg" alt="" />
      <div className='flex max-w-[30%] mx-auto h-screen flex-col items-center justify-center p-2 flex-1 gap-3'>
        <h1 className='font-bold text-2xl'>Get started now</h1>
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Login</legend>
          <input onChange={handleCHange} name='email' value={formData.email} type="text" className="input input-primary w-full" placeholder="Login" />
        </fieldset>

        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Password</legend>
          <input onChange={handleCHange} name='password' value={formData.password} type="password" className="input input-primary w-full" placeholder="Password" />
        </fieldset>
        <button onClick={handleSumbit} className='btn btn-primary w-full'>Log in</button>
      </div>
    </div>
  )
}

export default Login