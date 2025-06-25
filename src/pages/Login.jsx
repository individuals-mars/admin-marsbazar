
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../store/userSlice';

const Login = () => {
  const postURL = import.meta.env.VITE_BACKEND_URL + '/api/auth/login';
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(postURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (res.ok) {
        dispatch(login({
          token: data.token,
          user: data.user || { _id: data._id, username: data.username, email: data.email, img: data.img, role: data.role },
        }));
        toast.success('Вход выполнен успешно!');
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
    <>
      <style>
        {`
          @keyframes neonGlow {
            0%, 100% {
              text-shadow: 0 0 5px rgba(59, 130, 246, 0.8), 0 0 10px rgba(59, 130, 246, 0.6), 0 0 15px rgba(59, 130, 246, 0.4);
            }
            50% {
              text-shadow: 0 0 10px rgba(59, 130, 246, 1), 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="flex flex-col lg:flex-row min-h-screen bg-base-200 dark:bg-gray-800">
        <img
          className="w-full lg:w-[60%] h-[40vh] lg:h-screen object-cover lg:rounded-r-3xl"
          src="https://t4.ftcdn.net/jpg/10/02/26/95/360_F_1002269509_CxzaEMTWOJqMcI8bcKO1KOEEuviJrZWA.jpg"
          alt="Login background"
        />
        <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-8 bg-base-200/30 dark:bg-gray-900/30 backdrop-blur-sm animate-fadeIn">
          <h1 className="font-bold text-2xl sm:text-3xl text-base-content dark:text-gray-100 mb-6">Get started now</h1>
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-base-content dark:text-gray-200 mb-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 hover:text-shadow hover:text-shadow-blue-500/50"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`input input-primary w-full rounded-lg text-sm transition-transform duration-300 hover:scale-[1.02] ${
                  formData.email
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 animate-neonGlow'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-base-content dark:text-gray-200 mb-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 hover:text-shadow hover:text-shadow-blue-500/50"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input input-primary w-full rounded-lg text-sm transition-transform duration-300 hover:scale-[1.02] ${
                  formData.password
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 animate-neonGlow'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary w-full rounded-lg text-sm transition-transform duration-300 hover:scale-105 ${
                loading ? 'loading' : 'animate-pulse hover:animate-none'
              } bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white`}
              disabled={loading}
              aria-label={loading ? 'Logging in' : 'Log in'}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
