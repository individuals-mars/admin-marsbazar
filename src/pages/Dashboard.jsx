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
  FiRefreshCcw,
  FiShoppingBag,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
} from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';

// DaisyUI/Tailwind friendly colors (RGBA strings for Chart.js)
const TW_COLORS = {
  blue: {
    fill: 'rgba(59, 130, 246, 0.2)',
    stroke: 'rgba(59, 130, 246, 1)'
  },
  green: {
    fill: 'rgba(34, 197, 94, 0.2)',
    stroke: 'rgba(34, 197, 94, 1)'
  },
  amber: {
    fill: 'rgba(234, 179, 8, 0.2)',
    stroke: 'rgba(234, 179, 8, 1)'
  },
  rose: {
    fill: 'rgba(244, 63, 94, 0.2)',
    stroke: 'rgba(244, 63, 94, 1)'
  },
  violet: {
    fill: 'rgba(139, 92, 246, 0.2)',
    stroke: 'rgba(139, 92, 246, 1)'
  },
  cyan: {
    fill: 'rgba(6, 182, 212, 0.2)',
    stroke: 'rgba(6, 182, 212, 1)'
  },
};

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

const API_BASE = import.meta.env.VITE_BACKEND_URL;

/* =============================================================
 * Utility: safe number
 * ============================================================= */
const n = (v) => (typeof v === 'number' && !isNaN(v) ? v : 0);

/* =============================================================
 * Loading placeholders
 * ============================================================= */
const makeLoadingData = (label = 'Loading...') => ({
  labels: [label],
  datasets: [{ label, data: [0], borderWidth: 1 }]
});

/* =============================================================
 * Dataset builders
 * ============================================================= */
const makeOrdersAnalysisDataset = ({ currentStock, totalIn, totalOut, totalAdjust }) => ({
  labels: ['Current', 'Incoming', 'Outgoing', 'Adjusted'],
  datasets: [{
    label: 'Stock Summary',
    data: [n(currentStock), n(totalIn), n(totalOut), n(totalAdjust)],
    backgroundColor: TW_COLORS.blue.fill,
    borderColor: TW_COLORS.blue.stroke,
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
  }]
});

const makeOrdersGraphDataset = ({ labels, counts }) => ({
  labels,
  datasets: [{
    label: 'Monthly Orders',
    data: counts.map(n),
    backgroundColor: TW_COLORS.green.fill,
    borderColor: TW_COLORS.green.stroke,
    borderWidth: 2,
    tension: 0.3,
    fill: true,
    pointRadius: 3,
    pointHoverRadius: 5,
  }]
});

const makeTopProductsDataset = (items) => {
  const labels = items.map((p) => p.name ?? '—');
  const counts = items.map((p) => n(p.count ?? p.orders ?? p.qty));
  const bg = labels.map(() => TW_COLORS.amber.fill);
  const bd = labels.map(() => TW_COLORS.amber.stroke);
  return {
    labels,
    datasets: [{
      label: 'Orders',
      data: counts,
      backgroundColor: bg,
      borderColor: bd,
      borderWidth: 1,
    }]
  };
};

const makeTopProductsRevenueDataset = (items) => {
  const labels = items.map((p) => p.name ?? '—');
  const revenue = items.map((p) => n(p.revenue ?? p.totalRevenue));
  const bg = labels.map(() => TW_COLORS.violet.fill);
  const bd = labels.map(() => TW_COLORS.violet.stroke);
  return {
    labels,
    datasets: [{
      label: 'Revenue',
      data: revenue,
      backgroundColor: bg,
      borderColor: bd,
      borderWidth: 1,
    }]
  };
};

const makeShopPerformanceDataset = (shops) => {
  const labels = shops.map((s) => s.name ?? s.shopName ?? '—');
  const orders = shops.map((s) => n(s.orders ?? s.totalOrders));
  const revenue = shops.map((s) => n(s.revenue ?? s.totalRevenue));
  return {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: orders,
        backgroundColor: TW_COLORS.cyan.fill,
        borderColor: TW_COLORS.cyan.stroke,
        borderWidth: 1,
      },
      {
        label: 'Revenue',
        data: revenue,
        backgroundColor: TW_COLORS.rose.fill,
        borderColor: TW_COLORS.rose.stroke,
        borderWidth: 1,
      },
    ]
  };
};

/* =============================================================
 * Fallback demo data
 * ============================================================= */
const fallbackMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const fallbackTopProducts = [
  { name: 'Product A', count: 120, revenue: 1500 },
  { name: 'Product B', count: 90, revenue: 1100 },
  { name: 'Product C', count: 60, revenue: 700 },
  { name: 'Product D', count: 40, revenue: 550 },
  { name: 'Product E', count: 20, revenue: 200 },
];
const fallbackShops = [
  { name: 'Shop 1', orders: 300, revenue: 4500 },
  { name: 'Shop 2', orders: 180, revenue: 2800 },
  { name: 'Shop 3', orders: 90, revenue: 1300 },
];

/* =============================================================
 * Summary cards helper (shape-agnostic)
 * Server /api/dashboard/summary may return something like:
 * {
 *   totalOrders: 1234,
 *   totalProducts: 456,
 *   totalShops: 12,
 *   totalRevenue: 98765.43,
 *   todayOrders: 12,
 *   ...
 * }
 * We'll pick the common ones, fallback to 0.
 * ============================================================= */
const extractSummary = (data = {}) => ({
  totalOrders: n(data.totalOrders ?? data.orders),
  totalProducts: n(data.totalProducts ?? data.products),
  totalShops: n(data.totalShops ?? data.shops),
  totalRevenue: n(data.totalRevenue ?? data.revenue),
  todayOrders: n(data.todayOrders),
});

/* =============================================================
 * Chart options (base + variants)
 * ============================================================= */
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'top' },
    tooltip: { enabled: true },
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
    x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
  },
};

const stackedYOptions = {
  ...baseOptions,
  scales: {
    ...baseOptions.scales,
    x: { stacked: true, ...baseOptions.scales.x },
    y: { stacked: true, ...baseOptions.scales.y },
  }
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-base-300 p-4 rounded-lg shadow ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <h3 className="mb-4 flex items-center text-lg font-medium text-base-content">
    {Icon ? <Icon className="mr-2" /> : null}
    {children}
  </h3>
);

const SummaryCard = ({ icon: Icon, label, value, suffix }) => (
  <div className="stat">
    <div className="stat-figure text-primary">
      {Icon ? <Icon size={20} /> : null}
    </div>
    <div className="stat-title">{label}</div>
    <div className="stat-value text-primary">{value}{suffix}</div>
  </div>
);

const RecentOrdersTable = ({ rows }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o, i) => (
            <tr key={o._id ?? i}>
              <td>{i + 1}</td>
              <td>{o.code || o.orderNumber || o._id?.slice(-6) || '—'}</td>
              <td>{o.customerName || o.user?.name || '—'}</td>
              <td>{o.total?.toFixed?.(2) ?? o.total ?? '0'}</td>
              <td>
                <span className="badge badge-sm">
                  {o.status || '—'}
                </span>
              </td>
              <td>{new Date(o.createdAt || o.date || Date.now()).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const Dashboard = () => {
  const [analysisData, setAnalysisData] = useState(makeLoadingData());
  const [ordersGraphData, setOrdersGraphData] = useState(makeLoadingData());
  const [topProductsDataOrders, setTopProductsDataOrders] = useState(makeLoadingData());
  const [topProductsDataRevenue, setTopProductsDataRevenue] = useState(makeLoadingData());
  const [shopPerformanceData, setShopPerformanceData] = useState(makeLoadingData());
  const [recentOrders, setRecentOrders] = useState([]);
  const [summary, setSummary] = useState(extractSummary());

  const [loading, setLoading] = useState({
    analysis: true,
    graph: true,
    top: true,
    shops: true,
    recent: true,
    summary: true,
  });

  const [errors, setErrors] = useState({});
  const setLoad = (k, v) => setLoading((s) => ({ ...s, [k]: v }));
  const setErr = (k, v) => setErrors((s) => ({ ...s, [k]: v }));
  const fetchOrdersAnalysis = useCallback(async () => {
    setLoad('analysis', true);
    setErr('analysis', null);
    try {
      const { data } = await fetch(`${API_BASE}/api/dashboard/orders-analysis`);
      setAnalysisData(
        makeOrdersAnalysisDataset({
          currentStock: data.currentStock,
          totalIn: data.totalIn,
          totalOut: data.totalOut,
          totalAdjust: data.totalAdjust,
        })
      );
    } catch (err) {
      console.error('orders-analysis error', err);
      setErr('analysis', err?.response?.data?.message || err.message || 'orders-analysis error');
      setAnalysisData(makeOrdersAnalysisDataset({ currentStock: 50, totalIn: 45, totalOut: 30, totalAdjust: 10 }));
    } finally {
      setLoad('analysis', false);
    }
  }, []);
  const fetchOrdersGraph = useCallback(async () => {
    setLoad('graph', true);
    setErr('graph', null);
    try {
      const { data } = await fetch(`${API_BASE}/api/dashboard/orders-graph`);
      const labels = Array.isArray(data.months) ? data.months : Array.isArray(data.labels) ? data.labels : fallbackMonths;
      const counts = Array.isArray(data.counts) ? data.counts : Array.isArray(data.data) ? data.data : [10, 20, 15, 30, 25, 40];
      setOrdersGraphData(makeOrdersGraphDataset({ labels, counts }));
    } catch (err) {
      console.error('orders-graph error', err);
      setErr('graph', err?.response?.data?.message || err.message || 'orders-graph error');
      setOrdersGraphData(makeOrdersGraphDataset({ labels: fallbackMonths, counts: [10, 20, 15, 30, 25, 40] }));
    } finally {
      setLoad('graph', false);
    }
  }, []);


  const fetchTopProducts = useCallback(async () => {
    setLoad('top', true);
    setErr('top', null);
    try {
      const { data } = await fetch(`${API_BASE}/api/dashboard/top-products`);
      const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      if (!arr.length) throw new Error('empty top-products');
      setTopProductsDataOrders(makeTopProductsDataset(arr));
      setTopProductsDataRevenue(makeTopProductsRevenueDataset(arr));
    } catch (err) {
      console.error('top-products error', err);
      setErr('top', err?.response?.data?.message || err.message || 'top-products error');
      setTopProductsDataOrders(makeTopProductsDataset(fallbackTopProducts));
      setTopProductsDataRevenue(makeTopProductsRevenueDataset(fallbackTopProducts));
    } finally {
      setLoad('top', false);
    }
  }, []);


  const fetchRecentOrders = useCallback(async () => {
    setLoad('recent', true);
    setErr('recent', null);
    try {
      const { data } = await fetch(`${API_BASE}/api/dashboard/recent-orders`);
      const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setRecentOrders(arr.slice(0, 10));
    } catch (err) {
      console.error('recent-orders error', err);
      setErr('recent', err?.response?.data?.message || err.message || 'recent-orders error');
      setRecentOrders([
        { _id: '1', code: 'A-1001', customerName: 'Demo User', total: 25.5, status: 'paid', createdAt: Date.now() },
        { _id: '2', code: 'A-1002', customerName: 'Demo User 2', total: 10.0, status: 'pending', createdAt: Date.now() - 86400000 },
      ]);
    } finally {
      setLoad('recent', false);
    }
  }, []);

  const fetchShopPerformance = useCallback(async () => {
    setLoad('shops', true);
    setErr('shops', null);
    try {
      const { data } = await fetch(`${API_BASE}/api/dashboard/shop-performance`);
      const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      if (!arr.length) throw new Error('empty shop-performance');
      setShopPerformanceData(makeShopPerformanceDataset(arr));
    } catch (err) {
      console.error('shop-performance error', err);
      setErr('shops', err?.response?.data?.message || err.message || 'shop-performance error');
      setShopPerformanceData(makeShopPerformanceDataset(fallbackShops));
    } finally {
      setLoad('shops', false);
    }
  }, []);


  const fetchSummary = useCallback(async () => {
    setLoad('summary', true);
    setErr('summary', null);
    try {
      const { data } = await fetch(`${API_BASE}/api/dashboard/summary`);
      setSummary(extractSummary(data));
    } catch (err) {
      console.error('summary error', err);
      setErr('summary', err?.response?.data?.message || err.message || 'summary error');
      setSummary(extractSummary({ totalOrders: 0, totalProducts: 0, totalShops: 0, totalRevenue: 0 }));
    } finally {
      setLoad('summary', false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchSummary();
    fetchOrdersAnalysis();
    fetchOrdersGraph();
    fetchTopProducts();
    fetchRecentOrders();
    fetchShopPerformance();
  }, [
    fetchSummary,
    fetchOrdersAnalysis,
    fetchOrdersGraph,
    fetchTopProducts,
    fetchRecentOrders,
    fetchShopPerformance,
  ]);

  useEffect(() => {
    refreshAll();
    const id = setInterval(() => {
      refreshAll();
    }, 60000);
    return () => clearInterval(id);
  }, [refreshAll]);


  const [ordersGraphMode, setOrdersGraphMode] = useState('line');
  const [shopGraphMode, setShopGraphMode] = useState('bar');
  const [topProductsMode, setTopProductsMode] = useState('bar');

  const OrdersGraphChart = useMemo(() => {
    if (ordersGraphMode === 'bar') {
      return <Bar data={ordersGraphData} options={baseOptions} />;
    }
    return <Line data={ordersGraphData} options={baseOptions} />;
  }, [ordersGraphMode, ordersGraphData]);

  const ShopPerformanceChart = useMemo(() => {
    if (shopGraphMode === 'line') {
      return <Line data={shopPerformanceData} options={baseOptions} />;
    }
    return <Bar data={shopPerformanceData} options={stackedYOptions} />;
  }, [shopGraphMode, shopPerformanceData]);

  const TopProductsChart = useMemo(() => {
    if (topProductsMode === 'doughnut') {
      return <Doughnut data={topProductsDataOrders} options={{ ...baseOptions, scales: {} }} />;
    }
    if (topProductsMode === 'pie') {
      return <Pie data={topProductsDataOrders} options={{ ...baseOptions, scales: {} }} />;
    }
    return <Bar data={topProductsDataOrders} options={baseOptions} />;
  }, [topProductsMode, topProductsDataOrders]);

  return (
    <div className="p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-2xl">Dashboard Analytics</h1>
        <button
          className="btn btn-sm btn-outline flex items-center gap-1"
          onClick={refreshAll}
          disabled={Object.values(loading).some(Boolean)}
        >
          <IoReload /> Refresh
        </button>
      </div>
      <hr className="border-base-300" />

      <Card className=''>
        <SectionTitle icon={FiBarChart2}>Asosiy statistik ma'lumotlar (Summary)</SectionTitle>
        {errors.summary && (
          <div className="alert alert-warning mb-2">{errors.summary}</div>
        )}
        <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
          <SummaryCard icon={FiShoppingCart} label="Orders" value={summary.totalOrders} />
          <SummaryCard icon={FiPackage} label="Products" value={summary.totalProducts} />
          <SummaryCard icon={FiShoppingBag} label="Shops" value={summary.totalShops} />
          <SummaryCard icon={FiDollarSign} label="Revenue" value={summary.totalRevenue} suffix=" $" />
        </div>
        {loading.summary && <div className="mt-2 text-sm opacity-70 animate-pulse">Загружаю summary…</div>}
      </Card>

      <div className='flex gap-4'>
        <Card className=' w-150'>
          <SectionTitle icon={FiTrendingUp}>Buyurtmalar tahlili (Orders Analysis)</SectionTitle>
          {errors.analysis && (<div className="alert alert-warning mb-2">{errors.analysis} — fallback.</div>)}
          <div className="h-72">
            <Line data={analysisData} options={baseOptions} />
          </div>
          {loading.analysis && <div className="mt-2 text-sm opacity-70 animate-pulse">Загружаю аналитику…</div>}
        </Card>

        <Card className='w-150'>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={FiBarChart2}>Oylik buyurtmalar soni (Monthly Orders)</SectionTitle>
            <div className="join join-sm">
              <button
                className={`join-item btn btn-xs ${ordersGraphMode === 'line' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setOrdersGraphMode('line')}
              >Line</button>
              <button
                className={`join-item btn btn-xs ${ordersGraphMode === 'bar' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setOrdersGraphMode('bar')}
              >Bar</button>
            </div>
          </div>
          {errors.graph && (<div className="alert alert-warning mb-2">{errors.graph} — fallback.</div>)}
          <div className="h-72">{OrdersGraphChart}</div>
          {loading.graph && <div className="mt-2 text-sm opacity-70 animate-pulse">Загружаю график…</div>}
        </Card>
      </div>
      <div className='flex gap-5'>
        <Card className='w-150'>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={FiPackage}>Eng ko'p sotilgan mahsulotlar (Top Products)</SectionTitle>
            <div className="join join-sm">
              <button
                className={`join-item btn btn-xs ${topProductsMode === 'bar' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTopProductsMode('bar')}
              >Bar</button>
              <button
                className={`join-item btn btn-xs ${topProductsMode === 'doughnut' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTopProductsMode('doughnut')}
              >Doughnut</button>
              <button
                className={`join-item btn btn-xs ${topProductsMode === 'pie' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTopProductsMode('pie')}
              >Pie</button>
            </div>
          </div>
          {errors.top && (<div className="alert alert-warning mb-2">{errors.top} — fallback.</div>)}
          <div className="h-72">{TopProductsChart}</div>
          {loading.top && <div className="mt-2 text-sm opacity-70 animate-pulse">Загружаю топ продукты…</div>}
        </Card>

        <Card className='w-150'>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={FiShoppingBag}>Har bir shop bo'yicha buyurtma va daromad (Shop Performance)</SectionTitle>
            <div className="join join-sm">
              <button
                className={`join-item btn btn-xs ${shopGraphMode === 'bar' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setShopGraphMode('bar')}
              >Bar</button>
              <button
                className={`join-item btn btn-xs ${shopGraphMode === 'line' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setShopGraphMode('line')}
              >Line</button>
            </div>
          </div>
          {errors.shops && (<div className="alert alert-warning mb-2">{errors.shops} — fallback.</div>)}
          <div className="h-72">{ShopPerformanceChart}</div>
          {loading.shops && <div className="mt-2 text-sm opacity-70 animate-pulse">Загружаю shop performance…</div>}
        </Card>
      </div>

      <Card>
        <SectionTitle icon={FiShoppingCart}>So'nggi 10 ta buyurtma (Recent Orders)</SectionTitle>
        {errors.recent && (<div className="alert alert-warning mb-2">{errors.recent}</div>)}
        <RecentOrdersTable rows={recentOrders} />
        {loading.recent && <div className="mt-2 text-sm opacity-70 animate-pulse">Загружаю последние заказы…</div>}
      </Card>
    </div>
  );
};

export default Dashboard;
