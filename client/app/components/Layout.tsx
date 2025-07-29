import { Link, useLocation } from 'react-router';
import { HardDrive, FileText, Home, Users, LogOut, User, Settings, Shield, Search, Bell, Menu, X } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home, description: 'Dashboard and overview' },
    { name: 'Browse Drive', href: '/drive', icon: HardDrive, description: 'Access Google Drive files', requiresAuth: true },
    { name: 'Documents', href: '/documents', icon: FileText, description: 'Analyzed documents archive' },
    { name: 'Entities', href: '/entities', icon: Users, description: 'Extracted historical entities' },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img 
                    src="/icon.jpg" 
                    alt="Museum Logo" 
                    className="h-10 w-10 object-contain rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">Chaim Herzog Museum</h1>
                  <p className="text-xs text-gray-500 -mt-1">Document Archive</p>
                </div>
              </Link>
            </div>

            {/* Global Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search documents, entities, or files..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile search toggle */}
              <button className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Authentication dependent content */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Mobile Search */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const isDisabled = item.requiresAuth && !isAuthenticated;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    } flex items-center px-3 py-2 rounded-r-lg font-medium transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${isDisabled ? 'text-gray-300' : ''}`} />
                    <div>
                      <div className="text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {item.requiresAuth && !isAuthenticated && (
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Sign in required
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Modern Navigation Bar - Desktop */}
      <nav className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const isDisabled = item.requiresAuth && !isAuthenticated;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all group`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${isDisabled ? 'text-gray-300' : ''}`} />
                    <span>{item.name}</span>
                    {item.requiresAuth && !isAuthenticated && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        Auth required
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <ErrorBoundary>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </ErrorBoundary>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/icon.jpg" 
                  alt="Museum Logo" 
                  className="h-8 w-8 object-contain rounded-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Chaim Herzog Museum</h3>
                  <p className="text-sm text-gray-600">Jewish Soldier in World War II</p>
                </div>
              </div>
              <p className="text-gray-600 max-w-md leading-relaxed">
                Preserving the legacy of 1.5 million Jewish soldiers who served in Allied forces, 
                Partisans, and resistance movements during World War II.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li><Link to="/documents" className="text-gray-600 hover:text-gray-900 transition-colors">Browse Documents</Link></li>
                <li><Link to="/entities" className="text-gray-600 hover:text-gray-900 transition-colors">Explore Entities</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About the Museum</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Support
              </h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-600 hover:text-gray-900 transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 The Chaim Herzog Museum. All rights reserved. Located in Latrun, Israel.
            </p>
          </div>
        </div>
      </footer>

      {/* Click outside handlers */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </div>
  );
}