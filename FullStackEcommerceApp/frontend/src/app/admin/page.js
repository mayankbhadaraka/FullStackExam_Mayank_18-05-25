'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [token, setToken] = useState(null);

  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [topSellingProduct, setTopSellingProduct] = useState(null);
  const [topBuyer, setTopBuyer] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (!savedToken) {
      window.location.href = '/admin/login';
      return;
    }
    setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const isValidRange =
      (!startDate && !endDate) ||
      (startDate && endDate && startDate <= endDate);

    if (!isValidRange) {
      return;
    }

    async function fetchDashboardData() {
      setLoading(true);
      setError('');

      try {
        let url = 'http://localhost:5000/api/admin/dashboard';
        const params = new URLSearchParams();

        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();

        setProductsCount(data.totalProducts);
        setOrdersCount(data.totalOrders);
        setTotalRevenue(data.totalRevenue);

        setTopSellingProduct(data.topSellingProduct || null);
        setTopBuyer(data.topBuyer || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [token, startDate, endDate]);

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    if (endDate && value > endDate) {
      setEndDate(value);
    }
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    if (startDate && value < startDate) {
      setStartDate(value);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <div className="flex justify-end mb-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-4 bg-white shadow rounded p-4"
        >
          <div className="flex flex-col">
            <label htmlFor="start-date" className="font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate || today}
              className="border rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="end-date" className="font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              max={today}
              className="border rounded p-2"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="bg-gray-300 hover:bg-gray-400 transition rounded px-4 py-2 font-semibold"
          >
            Clear Filter
          </button>
        </form>
      </div>

      {error && (
        <p className="text-red-600 mb-4 font-semibold text-center">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded p-6 flex flex-col items-center">
          <p className="text-gray-500">Total Products</p>
          <p className="text-4xl font-bold text-indigo-600">{productsCount}</p>
        </div>

        <div className="bg-white shadow rounded p-6 flex flex-col items-center">
          <p className="text-gray-500">Total Orders</p>
          <p className="text-4xl font-bold text-indigo-600">{ordersCount}</p>
        </div>

        <div className="bg-white shadow rounded p-6 flex flex-col items-center">
          <p className="text-gray-500">Total Revenue</p>
          <p className="text-4xl font-bold text-indigo-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Top Selling Product
          </h2>
          {topSellingProduct ? (
            <div>
              <p className="text-lg font-medium">{topSellingProduct.name}</p>
              <p className="text-gray-600">
                Units Sold: {topSellingProduct.unitsSold}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data available.</p>
          )}
        </div>

        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Buyer</h2>
          {topBuyer ? (
            <div>
              <p className="text-lg font-medium">{topBuyer.name}</p>
              <p className="text-gray-600">Orders: {topBuyer.orders}</p>
              <p className="text-gray-600">
                Total Spent: ${topBuyer.totalSpent.toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data available.</p>
          )}
        </div>
      </div>

      {loading && <p className="text-center text-indigo-600 mt-6">Loading data...</p>}

      <p className="text-center text-gray-600">
        Use the navigation above to manage products and view detailed reports.
      </p>
    </div>
  );
}
