import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';

import './index.css';
import '../src/i18n';

import { store, persistor } from './store';
import ProtectedRoute from './guard/ProtectedRoute.jsx';
import ScreenLoader from './components/shared/ScreenLoader.jsx';
import ErrorBoundary from './components/shared/ErrorBoundry.jsx';
import App from './App.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Inventory = lazy(() => import('./pages/Inventory.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const ProductsDetail = lazy(() => import('./pages/ProductsDetail.jsx'));
const CreateCupons = lazy(() => import('./pages/CreateCupons.jsx'));
const OrdersInfo = lazy(() => import('./pages/OrderInfo.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Categories = lazy(() => import('./pages/Categories.jsx'));
const Allusers = lazy(() => import('./pages/Allusers.jsx'));
const Sellers = lazy(() => import('./pages/Sellers.jsx'));
const Admins = lazy(() => import('./pages/Admins.jsx'));
const Customers = lazy(() => import('./pages/Customers.jsx'));
const Shops = lazy(() => import('./pages/Shops.jsx'));
const ShopsDetail = lazy(() => import('./pages/ShopsDetail.jsx'));
const Envelope = lazy(() => import('./pages/Envelope.jsx'));
const Subcategories = lazy(() => import('./pages/Subcategories.jsx'));

const withSuspense = (Component) => (
  <ErrorBoundary>
    <Suspense fallback={<ScreenLoader />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'seller']}>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: withSuspense(Dashboard) },
      { path: 'categories', element: withSuspense(Categories) },
      { path: 'orders', element: withSuspense(Orders) },
      { path: 'products', element: withSuspense(Products) },
      { path: 'profile', element: withSuspense(Profile) },
      { path: 'allusers', element: withSuspense(Allusers) },
      { path: 'sellers', element: withSuspense(Sellers) },
      { path: 'admins', element: withSuspense(Admins) },
      { path: 'customers', element: withSuspense(Customers) },
      { path: 'shops', element: withSuspense(Shops) },
      { path: 'shopdetail/:id', element: withSuspense(ShopsDetail) },
      { path: 'envelope', element: withSuspense(Envelope) },
      { path: 'subcategories', element: withSuspense(Subcategories) },
      { path: 'createcupon', element: withSuspense(CreateCupons) },
      { path: 'productsdetail/:id', element: withSuspense(ProductsDetail) },
      { path: 'ordersinfo/:id', element: withSuspense(OrdersInfo) },
      { path: 'inventory', element: withSuspense(Inventory) },
      { path: 'analytics', element: withSuspense(Analytics) },
      { path: '*', element: withSuspense(NotFound) },
    ],
  },
  { path: '/login', element: withSuspense(Login) },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </StrictMode>
);
