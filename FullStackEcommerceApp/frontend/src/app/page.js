'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const pageSize = 10;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `http://localhost:5000/api/products?page=${currentPage}&limit=${pageSize}&sortBy=created_at&sortOrder=desc`,
          { cache: 'no-store' }
        );

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Products</h1>

      {loading ? (
        <p className="text-indigo-600 font-medium">Loading...</p>
      ) : error ? (
        <p className="text-red-600 font-semibold">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center space-x-2">
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

            {[...Array(totalPages).keys()].map((i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-400 hover:bg-indigo-100'
                  }`}
                >
                  {pageNum}
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
          </div>
        </>
      )}
    </div>
  );
}
