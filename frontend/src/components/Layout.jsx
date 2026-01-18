import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/fraud-detection', label: 'Fraud Detection' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen">
      <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl">💰</span>
              <div className="ml-2">
                <div className="text-white font-bold text-lg">Smart FinSecure</div>
                <div className="text-slate-400 text-xs hidden md:block">Financial Dashboard</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-sm text-white font-medium">{user.name || 'User'}</div>
                <div className="text-xs text-slate-400">{user.email || ''}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                LOGOUT
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm ${
                    isActive(link.path) ? 'text-blue-400' : 'text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
