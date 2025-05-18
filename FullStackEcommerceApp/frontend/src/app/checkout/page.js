'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
const router = useRouter();

  useEffect(() => {
    async function fetchCart() {
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
    }

    fetchCart();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!res.ok) throw new Error('Checkout failed');
      const data = await res.json();

      setMessage(`✅ Order placed! Order ID: ${data.orderId}`);
      localStorage.removeItem('cartItems');
      setCartItems([]);
    } catch (e) {
      setMessage(`❌ ${e.message}`);
    }

    setLoading(false);
  };

  const total = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Checkout</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="bg-white shadow rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{item.productId?.name}</h2>
                  <p className="text-sm text-gray-500">
                    ${item.productId?.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="text-md font-semibold text-indigo-600">
                  ${(item.productId?.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 flex justify-between items-center">
            <p className="text-xl font-semibold text-gray-800">Total:</p>
            <p className="text-xl font-bold text-indigo-700">${total.toFixed(2)}</p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </>
      )}

      {message && (
        <p
          className={`mt-4 text-center font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
