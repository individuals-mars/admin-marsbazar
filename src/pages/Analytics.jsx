import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiAlertTriangle
} from "react-icons/fi";
import {
  IoReload,
  IoStatsChart,
  IoCalendar,
  IoPieChart
} from "react-icons/io5";
import {
  BsBoxSeam,
  BsGraphUp,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Utility functions for chart data
const makeLoadingData = (label = 'Loading...') => ({
  labels: [label],
  datasets: [{
    label,
    data: [0],
    borderWidth: 1,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderColor: 'rgba(200, 200, 200, 0.5)'
  }]
});

const makeOrdersAnalysisDataset = ({ currentStock, totalIn, totalOut, totalAdjust }) => ({
  labels: ['Current Stock', 'Incoming', 'Outgoing', 'Adjusted'],
  datasets: [{
    label: 'Inventory Movement',
    data: [currentStock, totalIn, totalOut, totalAdjust],
    backgroundColor: [
      'rgba(59, 130, 246, 0.7)',
      'rgba(16, 185, 129, 0.7)',
      'rgba(239, 68, 68, 0.7)',
      'rgba(245, 158, 11, 0.7)'
    ],
    borderColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(245, 158, 11, 1)'
    ],
    borderWidth: 1,
    borderRadius: 6,
  }]
});

const makeOrdersGraphDataset = ({ months, counts }) => ({
  labels: months,
  datasets: [{
    label: 'Order Volume',
    data: counts,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 1)',
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
    pointRadius: 4,
    pointHoverRadius: 6,
  }]
});

const makePredictDataset = (products) => ({
  labels: products.map((p) => p.name),
  datasets: [{
    label: 'Projected Sales',
    data: products.map((p) => p.predictedSales),
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    borderColor: 'rgba(168, 85, 247, 1)',
    borderWidth: 1,
    borderRadius: 4,
  }]
});

const makeLowStockDataset = (items) => ({
  labels: items.map((i) => i.name),
  datasets: [{
    label: 'Remaining Stock',
    data: items.map((i) => i.stock),
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
    borderColor: 'rgba(239, 68, 68, 1)',
    borderWidth: 1,
    borderRadius: 4,
  }]
});

// Custom chart options
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          family: 'Inter, sans-serif'
        },
        boxWidth: 12,
        padding: 20
      }
    },
    tooltip: {
      enabled: true,
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
      grid: {
        color: 'rgba(226, 232, 240, 0.2)',
        drawBorder: false
      },
      ticks: {
        color: 'rgba(148, 163, 184, 1)'
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: 'rgba(148, 163, 184, 1)'
      }
    }
  },
  elements: {
    bar: {
      borderRadius: 8
    }
  }
};

const Analytics = () => {
  const [ordersAnalysisData, setOrdersAnalysisData] = useState(makeLoadingData());
  const [ordersGraphData, setOrdersGraphData] = useState(makeLoadingData());
  const [predictData, setPredictData] = useState(makeLoadingData());
  const [lowStockData, setLowStockData] = useState(makeLoadingData());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrdersAnalysis = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/dashboard/orders-analysis`);
      setOrdersAnalysisData(makeOrdersAnalysisDataset(data));
    } catch (err) {
      setOrdersAnalysisData(makeOrdersAnalysisDataset({
        currentStock: 50, totalIn: 40, totalOut: 20, totalAdjust: 5
      }));
    }
  }, []);

  const fetchOrdersGraph = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/dashboard/orders-graph`);
      setOrdersGraphData(makeOrdersGraphDataset(data));
    } catch (err) {
      setOrdersGraphData(makeOrdersGraphDataset({
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        counts: [10, 20, 30, 25, 40, 35]
      }));
    }
  }, []);

  const fetchPredict = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/product/predict`);
      setPredictData(makePredictDataset(data.products || []));
    } catch (err) {
      setPredictData(makePredictDataset([
        { name: 'Premium Widget', predictedSales: 120 },
        { name: 'Standard Gadget', predictedSales: 85 },
        { name: 'Basic Tool', predictedSales: 45 },
        { name: 'Deluxe Package', predictedSales: 65 }
      ]));
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/product/low-stock-summary`);
      setLowStockData(makeLowStockDataset(data.lowStock || []));
    } catch (err) {
      setLowStockData(makeLowStockDataset([
        { name: 'Battery Pack', stock: 3 },
        { name: 'Charging Cable', stock: 2 },
        { name: 'Adapter', stock: 1 },
        { name: 'Protective Case', stock: 4 }
      ]));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchOrdersAnalysis(),
        fetchOrdersGraph(),
        fetchPredict(),
        fetchLowStock()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrdersAnalysis, fetchOrdersGraph, fetchPredict, fetchLowStock]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const StatCard = ({ title, value, icon, trend, description }) => {
    const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';
    const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

    return (
      <div className="bg-gradient-to-br from-base-200 to-base-300 p-5 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-all">
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

  const ChartCard = ({ title, icon, children }) => (
    <div className="bg-gradient-to-br from-base-200 to-base-300 p-5 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-all h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className='flex gap-2'>
            <span><TbDeviceDesktopAnalytics className='text-3xl font-bold text-primary mt-1' /></span>
            <h1 className="text-3xl font-bold text-base-content">Analytics</h1>
          </div>
        </div>
             
        <button
          className={`btn btn-primary btn-sm flex items-center gap-2 ${isRefreshing ? 'loading' : ''}`}
          onClick={refreshAll}
          disabled={isRefreshing}
        >
          <IoReload className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <hr className='flex text-base-300'/>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value="1,248"
          icon={<IoStatsChart />}
          trend={12.5}
          description="Last 30 days"
        />
        <StatCard
          title="Inventory Value"
          value="$42,589"
          icon={<BsBoxSeam />}
          trend={8.2}
          description="Current stock"
        />
        <StatCard
          title="Revenue"
          value="$28,745"
          icon={<FiDollarSign />}
          trend={18.7}
          description="This month"
        />
        <StatCard
          title="Low Stock Items"
          value="7"
          icon={<BsExclamationTriangleFill className="text-yellow-500" />}
          trend={-3}
          description="Need restocking"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Movement */}
        <ChartCard title="Inventory Movement" icon={<FiPackage />}>
          <div className="h-72">
            <Bar
              data={ordersAnalysisData}
              options={{
                ...baseOptions,
                plugins: {
                  ...baseOptions.plugins,
                  title: {
                    display: true,
                    text: 'Stock Changes Overview',
                    font: { size: 16 }
                  }
                }
              }}
            />
          </div>
        </ChartCard>

        {/* Order Volume */}
        <ChartCard title="Order Volume Trend" icon={<BsGraphUp />}>
          <div className="h-72">
            <Line
              data={ordersGraphData}
              options={{
                ...baseOptions,
                plugins: {
                  ...baseOptions.plugins,
                  title: {
                    display: true,
                    text: 'Monthly Order Performance',
                    font: { size: 16 }
                  }
                }
              }}
            />
          </div>
        </ChartCard>

        {/* Sales Predictions */}
        <ChartCard title="Sales Predictions" icon={<IoPieChart />}>
          <div className="h-72">
            <Bar
              data={predictData}
              options={{
                ...baseOptions,
                plugins: {
                  ...baseOptions.plugins,
                  title: {
                    display: true,
                    text: 'Next 30 Days Projection',
                    font: { size: 16 }
                  }
                },
                indexAxis: 'y' // Horizontal bars
              }}
            />
          </div>
        </ChartCard>

        {/* Low Stock Alert */}
        <ChartCard title="Low Stock Alert" icon={<FiAlertTriangle className="text-orange-500" />}>
          <div className="h-72">
            <Bar
              data={lowStockData}
              options={{
                ...baseOptions,
                plugins: {
                  ...baseOptions.plugins,
                  title: {
                    display: true,
                    text: 'Items Needing Restock',
                    font: { size: 16 }
                  }
                },
                indexAxis: 'y' // Horizontal bars
              }}
            />
          </div>
        </ChartCard>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Recent Activity" icon={<IoCalendar />}>
          <div className="space-y-4">
            {[
              { date: 'Today', event: 'New order #1248 received', value: '+$249' },
              { date: 'Yesterday', event: 'Inventory adjustment', value: '-5 items' },
              { date: 'Mar 15', event: 'Product restock completed', value: '+120 units' },
              { date: 'Mar 14', event: 'Monthly sales report generated', value: 'View' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center pb-2 border-b border-base-300/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.event}</p>
                  <p className="text-xs text-base-content/50">{item.date}</p>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top Products" icon={<FiTrendingUp />}>
          <div className="space-y-3">
            {[
              { name: 'Premium Widget', sales: 245, revenue: '$12,250' },
              { name: 'Standard Gadget', sales: 189, revenue: '$7,560' },
              { name: 'Basic Tool', sales: 132, revenue: '$3,960' },
              { name: 'Deluxe Package', sales: 98, revenue: '$6,860' }
            ].map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <div className="w-full bg-base-300 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(product.sales / 245) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">{product.sales} sales</p>
                  <p className="text-xs text-base-content/50">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Quick Actions" icon={<IoReload />}>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-sm btn-outline">Generate Report</button>
            <button className="btn btn-sm btn-outline">Email Summary</button>
            <button className="btn btn-sm btn-outline">Restock Alert</button>
            <button className="btn btn-sm btn-outline">Export Data</button>
            <button className="btn btn-sm btn-primary col-span-2">View Full Analytics</button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;