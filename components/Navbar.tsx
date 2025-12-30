'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, UserCircle, Info, Activity } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Don't show navbar on login and signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <div className="sticky top-0 flex-shrink-0 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 backdrop-blur-md border-b border-blue-500/30 shadow-lg shadow-blue-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all shadow-lg shadow-blue-600/40 relative overflow-hidden">
              <Activity className="h-6 w-6 text-white heartbeat" strokeWidth={2.5} />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent tracking-tight">MEDA</h1>
          </Link>
          

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                pathname === '/dashboard'
                  ? 'text-cyan-400 bg-blue-900/30'
                  : 'text-gray-300 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              Dashboard
              {pathname === '/dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50"></span>
              )}
            </Link>
            
            <Link
              href="/medical-arena"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                pathname === '/medical-arena'
                  ? 'text-cyan-400 bg-blue-900/30'
                  : 'text-gray-300 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              Medical Arena
              {pathname === '/medical-arena' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50"></span>
              )}
            </Link>
            
            <Link
              href="/latest-news"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                pathname === '/latest-news'
                  ? 'text-cyan-400 bg-blue-900/30'
                  : 'text-gray-300 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              Latest News
              {pathname === '/latest-news' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50"></span>
              )}
            </Link>
          </nav>
          

          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm hidden lg:block">
              Welcome to MEDA
            </div>
            

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 hover:shadow-lg hover:shadow-blue-500/50 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg shadow-blue-600/40 ${
                  isDropdownOpen ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-blue-500/60' : ''
                }`}
                title="Profile"
              >
                <User className="h-5 w-5" />
              </button>


              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-md rounded-lg shadow-2xl border border-blue-500/30 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/account"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-900/40 hover:text-cyan-400 transition-all duration-200 rounded-md mx-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    Account
                  </Link>
                  
                  <Link
                    href="/about"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-900/40 hover:text-cyan-400 transition-all duration-200 rounded-md mx-2"
                  >
                    <Info className="h-4 w-4" />
                    About Us
                  </Link>
                  
                  <div className="border-t border-blue-500/20 my-2"></div>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200 rounded-md mx-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

