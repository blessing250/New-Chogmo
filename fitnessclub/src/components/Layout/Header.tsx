import React, { useState } from 'react';
import { Menu, X, User, LogOut, Settings, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-black/80 backdrop-blur-lg border-b border-orange-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">
              <span className="text-orange-500">CHOGM</span>
              <span className="text-white">Spa</span>
            </div>
          </div>

       

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block">{user?.name}</span>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-xl border border-orange-500/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-orange-500/20">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-orange-500/10 transition-colors duration-200 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  {user?.role === 'client' && (
                    <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-orange-500/10 transition-colors duration-200 flex items-center space-x-2">
                      <QrCode className="w-4 h-4" />
                      <span>My QR Code</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-orange-500 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-orange-500/20">
            <nav className="space-y-2">
              <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                Dashboard
              </a>
              {user?.role === 'admin' && (
                <>
                  <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                    Users
                  </a>
                  <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                    Services
                  </a>
                  <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                    Analytics
                  </a>
                </>
              )}
              {user?.role === 'client' && (
                <>
                  <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                    Bookings
                  </a>
                  <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                    Packages
                  </a>
                  <a href="#" className="block text-white hover:text-orange-500 transition-colors duration-200 py-2">
                    History
                  </a>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;