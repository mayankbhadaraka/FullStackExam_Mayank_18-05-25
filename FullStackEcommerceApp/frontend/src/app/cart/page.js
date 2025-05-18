'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const res = await fetch('http://localhost:5000/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setCartItems(data.items || []);
    } else {
      setCartItems([]);
    }
    setLoading(false);
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/cart/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (res.ok) fetchCart();
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) fetchCart();
  };

  const total = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading cart...
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl">
        Your cart is empty.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Your Cart</h1>

      <ul className="space-y-4">
        {cartItems.map((item) => (
          <li
            key={item.productId?._id}
            className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900">{item.productId?.name}</h2>
              <p className="text-sm text-gray-500 mb-2">
                ${item.productId?.price.toFixed(2)} × {item.quantity}
              </p>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId._id, parseInt(e.target.value))
                  }
                  className="w-12 text-center border rounded"
                />
                <button
                  onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between h-full">
              <p className="text-md font-semibold text-indigo-600">
                ${(item.productId?.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.productId._id)}
                className="text-red-600 text-sm hover:underline mt-2"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <p className="text-xl font-semibold text-gray-800">Total:</p>
        <p className="text-xl font-bold text-indigo-700">${total.toFixed(2)}</p>
      </div>

      <button
        onClick={() => (window.location.href = '/checkout')}
        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
