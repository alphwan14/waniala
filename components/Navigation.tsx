'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const Navigation = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/posho-mill', label: 'Posho Mill', icon: '🌾' },
    { href: '/rentals', label: 'Rentals', icon: '🏠' },
  ];

  return (
    <nav className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-white rounded-xl p-2 shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white text-shadow">Waniala</h1>
              <p className="text-xs text-primary-200 hidden sm:block">Business Manager</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-primary-700 shadow-lg scale-105'
                      : 'text-white hover:bg-primary-600 hover:scale-105'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden bg-white/20 p-2 rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-600 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-primary-700 shadow-lg'
                        : 'text-white hover:bg-primary-600'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;