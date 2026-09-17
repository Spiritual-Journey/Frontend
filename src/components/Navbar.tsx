import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Ticket, LogOut, BookOpen, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/spiritual_journey_logo.png';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-24">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <img src={logoImg} alt="Spiritual Journey Logo" className="h-10 sm:h-16 object-contain" />
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8 mt-2">
            {!location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/admin') && !isAuthenticated && (
              <Link to="/" className={`${location.pathname === '/' ? 'text-primary-800 border-b-2 border-accent' : 'text-primary-500 hover:text-primary-800'} font-semibold pb-1 transition-colors`}>Home</Link>
            )}
            {isAuthenticated && !isAdmin && (
              <Link to="/dashboard" className={`${location.pathname.startsWith('/dashboard') ? 'text-primary-800 border-b-2 border-accent' : 'text-primary-500 hover:text-primary-800'} font-semibold pb-1 transition-colors`}>
                Dashboard
              </Link>
            )}
            {!location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/admin') && (
              <>
                <a href="/#about" className="text-primary-500 hover:text-primary-800 transition-colors font-medium pb-1">About</a>
                <a href="/#contact" className="text-primary-500 hover:text-primary-800 transition-colors font-medium pb-1">Contact</a>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-accent font-semibold flex items-center gap-1 hover:text-accent-hover transition-colors">
                <ShieldCheck className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropRef}>
                <button
                  id="user-menu-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-800 px-4 py-2.5 rounded-full font-semibold transition-all border border-primary-200"
                >
                  <div className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-hover" />
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-primary-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-primary-100">
                      <p className="font-semibold text-primary-900 text-sm truncate">{user.name}</p>
                      <p className="text-primary-400 text-xs truncate">{user.email}</p>
                    </div>
                    {!isAdmin && (
                      <>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors text-sm font-medium">
                          <BookOpen className="w-4 h-4 text-amber-600" /> ዳሽቦርድና ትኬቶች (Dashboard)
                        </Link>
                        <Link to="/dashboard?book=true" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors text-sm font-medium">
                          <Ticket className="w-4 h-4 text-amber-600" /> ትኬት ይቁረጡ (Book Ticket)
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-accent hover:bg-accent/10 transition-colors text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-primary-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center text-primary-800 font-medium hover:text-accent transition-colors gap-1 text-sm sm:text-base">
                  <User className="w-4 h-4" /> <span className="hidden xs:inline">Log In</span><span className="xs:hidden">Login</span>
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold transition-all shadow-md text-sm sm:text-base">
                  <Ticket className="w-4 h-4" /> <span className="hidden sm:inline">Book Ticket</span><span className="sm:hidden">Book</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
