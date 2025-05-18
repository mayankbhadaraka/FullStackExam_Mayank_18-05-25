'use client';

import { useEffect, useState } from 'react';

export default function ViewOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (currentPage = 1) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('⚠️ You must be logged in to view your orders.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders?page=${currentPage}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🛒 Your Orders</h1>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : message ? (
        <p className="text-red-500">{message}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You have no orders.</p>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                <p className="font-semibold text-lg text-gray-700 mb-2">
                  Order ID: <span className="text-blue-600">{order.id}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Total:</strong> ${order.total}
                </p>
                <p className="text-gray-600">
                  <strong>Placed on:</strong> {new Date(order.created_at).toLocaleString()}
                </p>
                <div className="mt-4">
                  <p className="font-medium text-gray-700">Items:</p>
                  <ul className="ml-4 list-disc text-sm text-gray-600">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.product.name} - ${item.product.price} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md ${
                page === 1
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md ${
                page === totalPages
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
