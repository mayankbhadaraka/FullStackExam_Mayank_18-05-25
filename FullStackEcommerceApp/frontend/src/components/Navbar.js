'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-indigo-600">
            <Link href="/">E-Commerce</Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
              Cart
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-indigo-600">
              Orders
            </Link>
            {user ? (
              <>
                <span className="text-gray-600 text-sm">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
                <Link href="/admin/login" className="text-gray-700 hover:text-indigo-600">
                  Admin
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span className="block h-0.5 bg-gray-700"></span>
              <span className="block h-0.5 bg-gray-700"></span>
              <span className="block h-0.5 bg-gray-700"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-t border-gray-200 space-y-2">
          <Link href="/cart" className="block text-gray-700 hover:text-indigo-600">
            Cart
          </Link>
          <Link href="/orders" className="block text-gray-700 hover:text-indigo-600">
            Orders
          </Link>
          {user ? (
            <>
              <div className="text-sm text-gray-600">Hi, {user.username}</div>
              <button
                onClick={handleLogout}
                className="w-full text-left bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link
                href="/register"
                className="block bg-indigo-600 text-white py-2 rounded text-center hover:bg-indigo-700"
              >
                Register
              </Link>
              <Link href="/admin/login" className="block text-gray-700 hover:text-indigo-600">
                Admin
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
