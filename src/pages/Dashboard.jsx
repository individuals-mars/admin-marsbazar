import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw,
  FiShoppingBag,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiBox,
  FiUsers
} from 'react-icons/fi';
import { IoStatsChart, IoCalendar } from 'react-icons/io5';
import { BsGraphUp, BsExclamationTriangleFill } from 'react-icons/bs';
import { MdDashboardCustomize } from "react-icons/md";

// Register Chart.js components (unchanged)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Color palette and base chart options (unchanged)
const CHART_COLORS = {
  blue: { fill: 'rgba(59, 130, 246, 0.2)', stroke: 'rgba(59, 130, 246, 1)' },
  emerald: { fill: 'rgba(16, 185, 129, 0.2)', stroke: 'rgba(16, 185, 129, 1)' },
  amber: { fill: 'rgba(245, 158, 11, 0.2)', stroke: 'rgba(245, 158, 11, 1)' },
  rose: { fill: 'rgba(244, 63, 94, 0.2)', stroke: 'rgba(244, 63, 94, 1)' },
  violet: { fill: 'rgba(139, 92, 246, 0.2)', stroke: 'rgba(139, 92, 246, 1)' },
  indigo: { fill: 'rgba(99, 102, 241, 0.2)', stroke: 'rgba(99, 102, 241, 1)' }
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

const DEFAULT_DATA = {
  // Existing default data (unchanged)
  summary: {
    totalOrders: 1245,
    totalRevenue: 68450,
    totalProducts: 156,
    totalShops: 8
  },
  ordersGraph: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    data: [120, 190, 170, 220, 300, 280, 350]
  },
  topProducts: [
    { name: 'Product A', sales: 235 },
    { name: 'Product B', sales: 180 },
    { name: 'Product C', sales: 150 },
    { name: 'Product D', sales: 120 },
    { name: 'Product E', sales: 95 }
  ],
  shopPerformance: [
    { name: 'Shop 1', orders: 320, revenue: 18500 },
    { name: 'Shop 2', orders: 280, revenue: 16200 },
    { name: 'Shop 3', orders: 215, revenue: 12500 },
    { name: 'Shop 4', orders: 180, revenue: 9800 },
    { name: 'Shop 5', orders: 150, revenue: 8500 }
  ],
  recentOrders: [
    { id: 'ORD-001', customerName: 'John Doe', date: '2023-07-15', amount: 125.99, status: 'completed' },
    // ... other orders
  ],
  // Add default data for orders analysis
  ordersAnalysis: {
    labels: ['Category A', 'Category B', 'Category C', 'Category D'],
    data: [100, 200, 150, 300]
  }
};

// Base chart options (unchanged)
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { family: 'Inter, sans-serif' },
        boxWidth: 12,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += context.parsed.y.toLocaleString();
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(226, 232, 240, 0.2)', drawBorder: false },
      ticks: { color: 'rgba(148, 163, 184, 1)' }
    },
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: 'rgba(148, 163, 184, 1)' }
    }
  },
  elements: {
    bar: { borderRadius: 6 }
  }
};

// StatCard and ChartCard components (unchanged)
const StatCard = ({ title, value, icon, trend, description }) => {
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-info';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-base-content/70 flex items-center gap-2">
            {icon}
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-base-content/50 mt-2">{description}</p>
      )}
    </div>
  );
};

const ChartCard = ({ title, icon, children, className = '' }) => (
  <div className={`bg-base-100 p-5 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-all ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {icon}
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalShops: 0
  });
  const [ordersData, setOrdersData] = useState({ labels: [], datasets: [] });
  const [productsData, setProductsData] = useState({ labels: [], datasets: [] });
  const [shopsData, setShopsData] = useState({ labels: [], datasets: [] });
  const [recentOrders, setRecentOrders] = useState([]);
  // Add state for orders analysis
  const [ordersAnalysisData, setOrdersAnalysisData] = useState({ labels: [], datasets: [] });
  const [ordersAnalysisChartType, setOrdersAnalysisChartType] = useState('line');

  // Fetch data using axios
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Existing API calls (unchanged)
      const statsRes = await axios.get(`${API_BASE}/api/dashboard/summary`)
        .catch(() => ({ data: DEFAULT_DATA.summary }));
      setStats({
        totalOrders: statsRes.data.totalOrders || 0,
        totalRevenue: statsRes.data.totalRevenue || 0,
        totalProducts: statsRes.data.totalProducts || 0,
        totalShops: statsRes.data.totalShops || 0
      });

      const ordersRes = await axios.get(`${API_BASE}/api/dashboard/orders-graph`)
        .catch(() => ({ data: DEFAULT_DATA.ordersGraph }));
      setOrdersData({
        labels: ordersRes.data.labels || DEFAULT_DATA.ordersGraph.labels,
        datasets: [{
          label: 'Orders',
          data: ordersRes.data.data || DEFAULT_DATA.ordersGraph.data,
          backgroundColor: CHART_COLORS.indigo.fill,
          borderColor: CHART_COLORS.indigo.stroke,
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      });

      const productsRes = await axios.get(`${API_BASE}/api/dashboard/top-products`)
        .catch(() => ({ data: DEFAULT_DATA.topProducts }));
      setProductsData({
        labels: productsRes.data.map(p => p.name) || DEFAULT_DATA.topProducts.map(p => p.name),
        datasets: [{
          label: 'Sales',
          data: productsRes.data.map(p => p.sales) || DEFAULT_DATA.topProducts.map(p => p.sales),
          backgroundColor: [
            CHART_COLORS.violet.fill,
            CHART_COLORS.blue.fill,
            CHART_COLORS.emerald.fill,
            CHART_COLORS.amber.fill,
            CHART_COLORS.rose.fill
          ],
          borderColor: [
            CHART_COLORS.violet.stroke,
            CHART_COLORS.blue.stroke,
            CHART_COLORS.emerald.stroke,
            CHART_COLORS.amber.stroke,
            CHART_COLORS.rose.stroke
          ],
          borderWidth: 1
        }]
      });

      const shopsRes = await axios.get(`${API_BASE}/api/dashboard/shop-performance`)
        .catch(() => ({ data: DEFAULT_DATA.shopPerformance }));
      setShopsData({
        labels: shopsRes.data.map(s => s.name) || DEFAULT_DATA.shopPerformance.map(s => s.name),
        datasets: [
          {
            label: 'Orders',
            data: shopsRes.data.map(s => s.orders) || DEFAULT_DATA.shopPerformance.map(s => s.orders),
            backgroundColor: CHART_COLORS.blue.fill,
            borderColor: CHART_COLORS.blue.stroke,
            borderWidth: 1
          },
          {
            label: 'Revenue',
            data: shopsRes.data.map(s => s.revenue) || DEFAULT_DATA.shopPerformance.map(s => s.revenue),
            backgroundColor: CHART_COLORS.emerald.fill,
            borderColor: CHART_COLORS.emerald.stroke,
            borderWidth: 1
          }
        ]
      });

      const recentRes = await axios.get(`${API_BASE}/api/dashboard/recent-orders`)
      setRecentOrders(recentRes.data || DEFAULT_DATA.recentOrders);

      // Add orders analysis API call using axios
      const ordersAnalysisRes = await axios.get(`${API_BASE}/api/dashboard/orders-analysis`)
        .catch(() => ({ data: DEFAULT_DATA.ordersAnalysis }));
      setOrdersAnalysisData({
        labels: ordersAnalysisRes.data.labels || DEFAULT_DATA.ordersAnalysis.labels,
        datasets: [{
          label: 'Orders Analysis',
          data: ordersAnalysisRes.data.data || DEFAULT_DATA.ordersAnalysis.data,
          backgroundColor: CHART_COLORS.rose.fill,
          borderColor: CHART_COLORS.rose.stroke,
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Showing default data instead.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Chart type states (existing)
  const [ordersChartType, setOrdersChartType] = useState('line');
  const [productsChartType, setProductsChartType] = useState('bar');
  const [shopsChartType, setShopsChartType] = useState('bar');

  // Render charts (existing)
  const renderOrdersChart = useMemo(() => {
    if (ordersChartType === 'bar') {
      return <Bar data={ordersData} options={baseChartOptions} />;
    }
    return <Line data={ordersData} options={baseChartOptions} />;
  }, [ordersChartType, ordersData]);

  const renderProductsChart = useMemo(() => {
    if (productsChartType === 'pie') {
      return <Pie data={productsData} options={baseChartOptions} />;
    }
    if (productsChartType === 'doughnut') {
      return <Doughnut data={productsData} options={baseChartOptions} />;
    }
    return <Bar data={productsData} options={baseChartOptions} />;
  }, [productsChartType, productsData]);

  const renderShopsChart = useMemo(() => {
    if (shopsChartType === 'line') {
      return <Line data={shopsData} options={baseChartOptions} />;
    }
    return <Bar data={shopsData} options={{
      ...baseChartOptions,
      scales: {
        ...baseChartOptions.scales,
        x: { stacked: true },
        y处理的: { stacked: true }
      }
    }} />;
  }, [shopsChartType, shopsData]);

  // Add render for orders analysis chart
  const renderOrdersAnalysisChart = useMemo(() => {
    if (ordersAnalysisChartType === 'bar') {
      return <Bar data={ordersAnalysisData} options={baseChartOptions} />;
    }
    return <Line data={ordersAnalysisData} options={baseChartOptions} />;
  }, [ordersAnalysisChartType, ordersAnalysisData]);

  return (
    <div className="p-6 space-y-6">
      {/* Header (unchanged) */}
      <div className="flex justify-between items-center">
        <div>
          <div className='flex gap-2'>
            <span><MdDashboardCustomize className='text-3xl font-bold text-primary mt-1' /></span>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <div className="alert alert-warning py-1 px-3">
              <BsExclamationTriangleFill className="mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchData}
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <hr className='flex text-base-300'/>

      {/* Stat cards (unchanged) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<FiShoppingCart />} trend={8.5} description="Last 30 days" />
        <StatCard title="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={<FiDollarSign />} trend={12.3} description="Current month" />
        <StatCard title="Products" value={stats.totalProducts} icon={<FiPackage />} trend={3.2} description="In inventory" />
        <StatCard title="Shops" value={stats.totalShops} icon={<FiShoppingBag />} trend={1.8} description="Active locations" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend (unchanged) */}
        <ChartCard title="Orders Trend" icon={<BsGraphUp />}>
          <div className="flex justify-end mb-2">
            <div className="join join-sm">
              <button className={`join-item btn btn-xs ${ordersChartType === 'line' ? 'btn-active' : ''}`} onClick={() => setOrdersChartType('line')}>
                Line
              </button>
              <button className={`join-item btn btn-xs ${ordersChartType === 'bar' ? 'btn-active' : ''}`} onClick={() => setOrdersChartType('bar')}>
                Bar
              </button>
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              renderOrdersChart
            )}
          </div>
        </ChartCard>

        {/* Orders Analysis (new) */}
        <ChartCard title="Buyurtmalar tahlili" icon={<IoStatsChart />}>
          <div className="flex justify-end mb-2">
            <div className="join join-sm">
              <button className={`join-item btn btn-xs ${ordersAnalysisChartType === 'line' ? 'btn-active' : ''}`} onClick={() => setOrdersAnalysisChartType('line')}>
                Line
              </button>
              <button className={`join-item btn btn-xs ${ordersAnalysisChartType === 'bar' ? 'btn-active' : ''}`} onClick={() => setOrdersAnalysisChartType('bar')}>
                Bar
              </button>
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              renderOrdersAnalysisChart
            )}
          </div>
        </ChartCard>

        {/* Shops Performance (unchanged) */}
        <ChartCard title="Shops Performance" icon={<IoStatsChart />}>
          <div className="flex justify-end mb-2">
            <div className="join join-sm">
              <button className={`join-item btn btn-xs ${shopsChartType === 'bar' ? 'btn-active' : ''}`} onClick={() => setShopsChartType('bar')}>
                Bar
              </button>
              <button className={`join-item btn btn-xs ${shopsChartType === 'line' ? 'btn-active' : ''}`} onClick={() => setShopsChartType('line')}>
                Line
              </button>
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              renderShopsChart
            )}
          </div>
        </ChartCard>

        {/* Top Products (unchanged) */}
        <ChartCard title="Top Products" icon={<FiPackage />}>
          <div className="flex justify-end mb-2">
            <div className="join join-sm">
              <button className={`join-item btn btn-xs ${productsChartType === 'bar' ? 'btn-active' : ''}`} onClick={() => setProductsChartType('bar')}>
                Bar
              </button>
              <button className={`join-item btn btn-xs ${productsChartType === 'pie' ? 'btn-active' : ''}`} onClick={() => setProductsChartType('pie')}>
                Pie
              </button>
              <button className={`join-item btn btn-xs ${productsChartType === 'doughnut' ? 'btn-active' : ''}`} onClick={() => setProductsChartType('doughnut')}>
                Doughnut
              </button>
            </div>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              renderProductsChart
            )}
          </div>
        </ChartCard>

        {/* Recent Orders (unchanged) */}
        <ChartCard title="Recent Orders" icon={<IoCalendar />} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <span className="loading loading-spinner"></span>
                    </td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id?.slice(0, 8) || 'N/A'}</td>
                      <td>{order.customerName || 'Unknown'}</td>
                      <td>{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                      <td>${order.amount ? order.amount.toFixed(2) : '0.00'}</td>
                      <td>
                        <span className={`badge badge-sm ${order.status === 'completed' ? 'badge-success' :
                          order.status === 'pending' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                          {order.status || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;