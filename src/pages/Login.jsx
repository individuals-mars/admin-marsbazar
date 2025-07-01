import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../store/userSlice';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (res.ok) {
        dispatch(
          login({
            token: data.token,
            user:
              data.user || {
                _id: data._id,
                username: data.username,
                email: data.email,
                img: data.img,
              },
            role: data.role || (data.user?.role ?? null),
          })
        );
        toast.success('Успешный вход!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Сервер недоступен');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-base-200">
      <img
        className="w-full lg:w-[60%] h-[40vh] lg:h-screen object-cover"
        src="https://t4.ftcdn.net/jpg/10/02/26/95/360_F_1002269509_CxzaEMTWOJqMcI8bcKO1KOEEuviJrZWA.jpg"
        alt="Login"
      />
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
