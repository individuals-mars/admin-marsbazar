import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../store/userSlice';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Auth response:', data);

      if (res.ok) {
        if (isLogin) {
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
          toast.success('Регистрация успешна! Войдите в систему.');
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '' });
        }
      } else {
        toast.error(data.message || `Ошибка ${isLogin ? 'входа' : 'регистрации'}`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Сервер недоступен');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex bg-base-200">
      {/* Левая часть - декоративная */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-success">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-success to-success-focus opacity-95"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-base-100/20 rounded-full blur-xl animate-bounce backdrop-blur-sm"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-base-100/30 rounded-full blur-lg animate-bounce backdrop-blur-sm" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-base-100/20 rounded-full blur-xl animate-bounce backdrop-blur-sm" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-base-100/40 rounded-full blur-md animate-bounce backdrop-blur-sm" style={{ animationDelay: '2s' }}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-base-100/30 rotate-45 animate-pulse backdrop-blur-sm"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-base-100/40 rounded-full animate-pulse backdrop-blur-sm" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="flex flex-col justify-center items-center text-base-100 p-20 relative z-10">
          <div className="text-7xl font-bold mb-8 text-center leading-tight">
            <span className="bg-gradient-to-r from-base-100 to-base-100/80 bg-clip-text text-transparent">
              Welcome
            </span>
            <br />
            <span className="text-base-100 text-6xl">
              Back
            </span>
          </div>
          <p className="text-xl opacity-90 text-center max-w-lg leading-relaxed text-base-100">
            Войдите в свой аккаунт и продолжайте свое путешествие с нами
          </p>
          
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-base-100/50 to-transparent mt-8 rounded-full"></div>
        </div>
      </div>

      {/* Правая часть с формой */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-base-100 relative">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-base-100"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-success/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-20">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-success mb-4">
               Welcome
            </h1>
            <p className="text-neutral text-lg">
              Login to your account
            </p>
          </div>

          <div className="bg-base-100 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-success/20 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent rounded-3xl"></div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-neutral mb-3">
                  Email
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    className="w-full px-4 py-4 bg-success/10 border-2 border-success/20 rounded-xl focus:border-success focus:bg-base-100 transition-all duration-300 outline-none text-neutral placeholder-neutral/60 group-hover:border-success/40"
                    placeholder="Введите email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral mb-3">
                  Password
                </label>
                <div className="relative group">
                  <input
                    name="password"
                    type="password"
                    className="w-full px-4 py-4 bg-success/10 border-2 border-success/20 rounded-xl focus:border-success focus:bg-base-100 transition-all duration-300 outline-none text-neutral placeholder-neutral/60 group-hover:border-success/40"
                    placeholder="Введите пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="w-full bg-success hover:bg-success-focus text-base-100 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-base-100/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-base-100 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2 relative z-10">
                    <span>🚀 Войти</span>
                  </span>
                )}
              </button>
            </div>

            {/* Переключатель режимов */}
            <div className="mt-8 text-center">
              <button
                onClick={toggleMode}
                className="text-success hover:text-success-focus font-medium transition-all duration-300 relative group px-4 py-2"
              >
                <span className="relative z-10">Переключить режим</span>
                <div className="absolute inset-0 bg-success/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-success group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;