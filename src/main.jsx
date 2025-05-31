import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './pages/Categories.jsx';
import { store, persistor } from './store/index.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ProtectedRoute from './guard/ProtectedRoute.jsx';
import Allusers from './pages/Allusers.jsx';
import Sellers from './pages/Sellers.jsx';
import Admins from './pages/Admins.jsx';
import Customers from './pages/Customers.jsx';
import OrdersInfo from './pages/OrderInfo.jsx';
import OrderInfo from './pages/OrderInfo.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={['admin', 'seller']}>
      <App />
    </ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/404', element: <NotFound /> },
      { path: '/categories', element: <Categories /> },
      { path: '/orders', element: <Orders /> },
      { path: '/products', element: <Products /> },
      { path: '/profile', element: <Profile /> },
      { path: '/allusers', element: <Allusers /> },
      { path: '/sellers', element: <Sellers /> },
      { path: '/admins', element: <Admins /> },
      { path: '/customers', element: <Customers /> },
      { path: '/order/:id', element: <OrderInfo /> }

    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  }


]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
