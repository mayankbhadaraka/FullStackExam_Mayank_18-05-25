'use client';

import { useEffect, useState } from 'react';

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function AdminReports() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchUser, setSearchUser] = useState('');
  const debouncedSearch = useDebounce(searchUser);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => setMounted(true), []);

  useEffect(() => setCurrentPage(1), [debouncedSearch]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    async function fetchReports() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });

        const res = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setReports(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [currentPage, debouncedSearch, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Orders Report</h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-6 max-w-md">
        <input
          type="text"
          placeholder="Search by user..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="mb-4 md:mb-0 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
        />

        <div className="flex items-center space-x-2">
          <label className="font-medium text-gray-700">Sort By:</label>
          <button
            onClick={() => toggleSort('date')}
            className={`px-3 py-1 rounded border ${
              sortBy === 'date'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-400 hover:bg-indigo-100'
            }`}
          >
            Date {sortBy === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>
          <button
            onClick={() => toggleSort('total')}
            className={`px-3 py-1 rounded border ${
              sortBy === 'total'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-400 hover:bg-indigo-100'
            }`}
          >
            Total {sortBy === 'total' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-center font-semibold mt-8">
          Error: {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="ml-3 text-indigo-600 font-medium">Loading orders...</span>
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center mt-8 text-gray-600 font-medium">No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-5 text-left">Order ID</th>
                  <th className="py-3 px-5 text-left">User</th>
                  <th className="py-3 px-5 text-left cursor-pointer" onClick={() => toggleSort('total')}>
                    Total ($) {sortBy === 'total' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-3 px-5 text-left cursor-pointer" onClick={() => toggleSort('date')}>
                    Date {sortBy === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-3 px-5 text-left">Items</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((order) => (
                  <tr key={order.id} className="even:bg-gray-50 hover:bg-gray-100 transition-colors">
                    <td className="py-3 px-5 border-b border-gray-300">{order.id}</td>
                    <td className="py-3 px-5 border-b border-gray-300">{order.User?.username || 'N/A'}</td>
                    <td className="py-3 px-5 border-b border-gray-300">${order.total}</td>
                    <td className="py-3 px-5 border-b border-gray-300">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-5 border-b border-gray-300">
                      <ul className="list-disc list-inside">
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.product?.name || 'Unknown'} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="mt-6 flex justify-center items-center space-x-3 text-gray-700">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'hover:bg-indigo-100 border-gray-400'
              }`}
            >
              Previous
            </button>

            {[...Array(totalPages).keys()].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-400 hover:bg-indigo-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'hover:bg-indigo-100 border-gray-400'
              }`}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
