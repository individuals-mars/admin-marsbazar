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
import Shops from './pages/Shops.jsx';
import Envelope from './pages/Envelope.jsx';
import { ToastContainer, toast } from 'react-toastify';
import CreateProducts from './pages/CreateProducts.jsx';
import Enventory from './pages/Enventory.jsx';
import ShopsDetail from './pages/ShopsDetail.jsx';
import ModalCreateShops from './pages/ModalCreateShops.jsx';
import Subcategories from './pages/Subcategories.jsx';
import CreateCupons from './pages/CreateCupons.jsx';


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
      { path: '/shops', element: <Shops /> },
      { path: '/shopdetail/:id', element: <ShopsDetail /> },
      { path: '/CreateProduct', element: <CreateProducts /> },
      { path: '/Enventory', element: <Enventory /> },
      { path: '/envelope', element: <Envelope /> },
      { path: '/modalcreateshops', element: <ModalCreateShops /> },
      { path: '/subcategories', element: <Subcategories /> },
      { path: '/createcupon', element: <CreateCupons /> },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },


]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
