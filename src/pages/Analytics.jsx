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
import { FiTrendingUp } from "react-icons/fi";
import { IoReload } from "react-icons/io5";

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

const makeLoadingData = (label = 'Loading...') => ({
  labels: [label],
  datasets: [{ label, data: [0], borderWidth: 1 }]
});

const makeOrdersAnalysisDataset = ({ currentStock, totalIn, totalOut, totalAdjust }) => ({
  labels: ['Current', 'Incoming', 'Outgoing', 'Adjusted'],
  datasets: [{
    label: 'Stock Summary',
    data: [currentStock, totalIn, totalOut, totalAdjust],
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    borderColor: 'rgba(59, 130, 246, 1)',
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
  }]
});

const makeOrdersGraphDataset = ({ months, counts }) => ({
  labels: months,
  datasets: [{
    label: 'Monthly Orders',
    data: counts,
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    borderColor: 'rgba(34, 197, 94, 1)',
    borderWidth: 2,
    tension: 0.3,
    fill: true,
    pointRadius: 3,
    pointHoverRadius: 5,
  }]
});

const makePredictDataset = (products) => ({
  labels: products.map((p) => p.name),
  datasets: [{
    label: 'Predicted Sales',
    data: products.map((p) => p.predictedSales),
    backgroundColor: 'rgba(139, 92, 246, 0.6)',
    borderColor: 'rgba(139, 92, 246, 1)',
    borderWidth: 1
  }]
});

const makeLowStockDataset = (items) => ({
  labels: items.map((i) => i.name),
  datasets: [{
    label: 'Low Stock Items',
    data: items.map((i) => i.stock),
    backgroundColor: 'rgba(239, 68, 68, 0.6)',
    borderColor: 'rgba(239, 68, 68, 1)',
    borderWidth: 1
  }]
});

const Analytics = () => {
  const [ordersAnalysisData, setOrdersAnalysisData] = useState(makeLoadingData());
  const [ordersGraphData, setOrdersGraphData] = useState(makeLoadingData());
  const [predictData, setPredictData] = useState(makeLoadingData());
  const [lowStockData, setLowStockData] = useState(makeLoadingData());

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
        months: ['Jan', 'Feb', 'Mar'], counts: [10, 20, 30]
      }));
    }
  }, []);

  const fetchPredict = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/product/predict`);
      setPredictData(makePredictDataset(data.products || []));
    } catch (err) {
      setPredictData(makePredictDataset([
        { name: 'Prod A', predictedSales: 12 },
        { name: 'Prod B', predictedSales: 25 }
      ]));
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/product/low-stock-summary`);
      setLowStockData(makeLowStockDataset(data.lowStock || []));
    } catch (err) {
      setLowStockData(makeLowStockDataset([
        { name: 'Item A', stock: 5 },
        { name: 'Item B', stock: 2 }
      ]));
    }
  }, []);

  useEffect(() => {
    fetchOrdersAnalysis();
    fetchOrdersGraph();
    fetchPredict();
    fetchLowStock();
  }, [fetchOrdersAnalysis, fetchOrdersGraph, fetchPredict, fetchLowStock]);

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    },
    scales: { y: { beginAtZero: true } }
  };

  const Card = ({ title, children }) => (
    <div className="bg-gradient-to-tr from-base-200 to-base-300 hover:shadow-xl transition-all duration-300 p-5 rounded-2xl shadow-lg">
      <h3 className="mb-3 text-lg font-semibold flex items-center gap-2 text-base-content">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-3xl "> Analytics Dashboard</h1>
        <button
          className="btn btn-sm btn-primary flex items-center gap-2"
          onClick={() => {
            fetchOrdersAnalysis();
            fetchOrdersGraph();
            fetchPredict();
            fetchLowStock();
          }}
        >
          <IoReload className="text-lg" /> Refresh
        </button>
      </div>
      <hr className="border-base-300" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={<><FiTrendingUp /> Orders Analysis</>}>
          <div className="h-72"><Line data={ordersAnalysisData} options={baseOptions} /></div>
        </Card>
        <Card title="Monthly Orders">
          <div className="h-72"><Line data={ordersGraphData} options={baseOptions} /></div>
        </Card>
        <Card title="Product Sales Prediction">
          <div className="h-72"><Bar data={predictData} options={baseOptions} /></div>
        </Card>
        <Card title="Low Stock Summary">
          <div className="h-72"><Bar data={lowStockData} options={baseOptions} /></div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
