'use client';

import { useEffect, useState } from 'react';

export default function AdminViewEditProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
  });
  const [message, setMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5; 

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    async function fetchProducts() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
        });

        const res = await fetch(`http://localhost:5000/api/admin/products?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();

        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage, searchTerm]);

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
    });
    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setMessage('');
    setError('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${editingProduct}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
        }),
      });

      if (!res.ok) throw new Error('Failed to update product');

      setProducts((prev) =>
        prev.map((p) =>
          p._id === editingProduct
            ? { ...p, ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) }
            : p
        )
      );

      setMessage('Product updated successfully');
      setEditingProduct(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const changePage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    setEditingProduct(null);
    setMessage('');
    setError('');
  };

  useEffect(() => {
    setCurrentPage(1);
    setEditingProduct(null);
    setMessage('');
    setError('');
  }, [searchTerm]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-indigo-600 font-semibold">Loading products...</span>
      </div>
    );

  if (error)
    return <p className="text-red-600 text-center font-semibold mt-8">Error: {error}</p>;

  if (products.length === 0)
    return <p className="text-center mt-8 text-gray-600 font-medium">No products found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">View & Edit Products</h1>

      {/* Search input */}
      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md border border-green-300 font-semibold">
          {message}
        </div>
      )}

      {editingProduct && (
        <form
          onSubmit={handleUpdate}
          className="mb-8 p-6 bg-white shadow-md rounded-md max-w-lg mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Edit Product</h2>

          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block mb-1 font-medium text-gray-700">
              Category
            </label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="price" className="block mb-1 font-medium text-gray-700">
                Price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block mb-1 font-medium text-gray-700">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-white shadow rounded-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-5 text-left font-semibold">ID</th>
              <th className="py-3 px-5 text-left font-semibold">Name</th>
              <th className="py-3 px-5 text-left font-semibold">Category</th>
              <th className="py-3 px-5 text-left font-semibold">Price ($)</th>
              <th className="py-3 px-5 text-left font-semibold">Stock</th>
              <th className="py-3 px-5 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <td className="py-3 px-5 border-b border-gray-300 break-all">{p._id}</td>
                <td className="py-3 px-5 border-b border-gray-300">{p.name}</td>
                <td className="py-3 px-5 border-b border-gray-300">{p.category}</td>
                <td className="py-3 px-5 border-b border-gray-300">{p.price.toFixed(2)}</td>
                <td className="py-3 px-5 border-b border-gray-300">{p.stock}</td>
                <td className="py-3 px-5 border-b border-gray-300">
                  <button
                    onClick={() => startEdit(p)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav
        className="mt-6 flex justify-center items-center space-x-3 text-gray-700"
        aria-label="Pagination"
      >
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border ${currentPage === 1
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
              onClick={() => changePage(pageNum)}
              aria-current={currentPage === pageNum ? 'page' : undefined}
              className={`px-3 py-1 rounded border ${currentPage === pageNum
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-400 hover:bg-indigo-100'
                }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border ${currentPage === totalPages
            ? 'text-gray-400 border-gray-300 cursor-not-allowed'
            : 'hover:bg-indigo-100 border-gray-400'
            }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
}