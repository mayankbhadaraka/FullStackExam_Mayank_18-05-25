'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="bg-indigo-800 text-white fixed top-0 left-0 right-0 shadow-md z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 md:px-8">
          <div className="flex items-center space-x-8 text-lg font-semibold">
            <Link href="/admin" className="hover:text-indigo-300 transition">
              Dashboard
            </Link>
            <Link href="/admin/products/view" className="hover:text-indigo-300 transition">
              Products
            </Link>
            <Link href="/admin/products" className="hover:text-indigo-300 transition">
              Add Products
            </Link>
            <Link href="/admin/orders" className="hover:text-indigo-300 transition">
              View Orders
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2 rounded-md font-medium"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="pt-20 max-w-7xl mx-auto px-4 md:px-8 min-h-[calc(100vh-80px)] bg-gray-50">
        {children}
      </main>
    </>
  );
}
