/**
 * HEADER COMPONENT
 *
 * Contains the navigation bar with horizontal top navigation.
 * Includes responsive design with collapsible mobile menu and role-based navigation.
 * Fixed positioned at the top of the page.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { gsap } from 'gsap';

const Header: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Navigation items based on user role
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      current: location.pathname.startsWith('/projects')
    },
    {
      name: 'Bugs',
      href: '/bugs',
      icon: Bug,
      current: location.pathname.startsWith('/bugs')
    },
    // Admin-only navigation items
    ...(hasRole('Admin') ? [{
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      current: location.pathname.startsWith('/admin')
    }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // GSAP animations for header
  useEffect(() => {
    if (navbarRef.current) {
      gsap.fromTo(navbarRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <>
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Top Navigation Bar - Fixed at the very top */}
      <header
        ref={navbarRef}
        className="bg-base-100/95 backdrop-blur-sm shadow-lg border-b border-accent-primary/50 fixed top-0 left-0 right-0 z-[100] glow-primary"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold gradient-accent glow-primary">Bug Tracker</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    item.current
                      ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white glow-primary'
                      : 'text-base-content hover:bg-base-200 hover:glow-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* User avatar and dropdown */}
              <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-semibold glow-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </button>
                <ul className="dropdown-content z-[110] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                  <li className="menu-title">
                    <span className="text-base-content">
                      Welcome back, <span className="gradient-accent font-semibold">{user?.username}</span>
                      <span className="badge badge-ghost badge-sm ml-2 capitalize">{user?.role}</span>
                    </span>
                  </li>
                  <li><button onClick={handleLogout} className="text-error">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button></li>
                </ul>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden btn btn-ghost btn-sm hover:glow-secondary"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="py-4 border-t border-accent-primary/30">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                      item.current
                        ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white glow-primary'
                        : 'text-base-content hover:bg-base-200 hover:glow-secondary'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;