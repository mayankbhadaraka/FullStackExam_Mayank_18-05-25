'use client';

import { useState, useEffect } from 'react';

export default function AdminAddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) window.location.href = '/admin/login';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          category,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
        }),
      });

      if (!res.ok) throw new Error('Failed to add product');

      setMessage('Product added successfully');
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setStock('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Product name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Product description"
          />
        </div>

        <div>
          <label htmlFor="category" className="block mb-1 font-medium text-gray-700">
            Category
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Product category"
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-1 font-medium text-gray-700">
            Price ($)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Product price"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block mb-1 font-medium text-gray-700">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Available stock"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-700 transition"
        >
          Add Product
        </button>
      </form>

      {message && <p className="mt-4 text-green-600 font-medium">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
    </div>
  );
}
