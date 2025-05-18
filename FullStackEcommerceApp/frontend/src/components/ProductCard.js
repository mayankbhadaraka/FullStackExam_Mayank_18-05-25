'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-1">{product.category}</p>
      <p className="text-base text-indigo-600 font-medium mb-3">${product.price.toFixed(2)}</p>
      
      <Link href={`/products/${product._id}`} passHref>
        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          View Details
        </button>
      </Link>
    </div>
  );
}
