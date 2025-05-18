'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCart({ productId }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) throw new Error('Failed to add to cart');
      alert('Added to cart');
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={e => setQuantity(parseInt(e.target.value))}
        className="w-20 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
          loading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}