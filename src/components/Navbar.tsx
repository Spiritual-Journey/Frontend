import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Ticket, LogOut, BookOpen, ChevronDown, ShieldCheck, Menu, X, Home, Phone, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/spiritual_journey_logo.png';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logoImg}
                alt="Spiritual Journey Logo"
                className="h-9 sm:h-14 max-w-[130px] sm:max-w-none object-contain"
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
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

          {/* Right Side Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropRef}>
                <button
                  id="user-menu-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-primary-50 hover:bg-primary-100 text-primary-800 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition-all border border-primary-200 text-xs sm:text-sm whitespace-nowrap"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-accent/20 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-hover" />
                  </div>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="flex items-center text-primary-800 hover:text-accent font-semibold transition-colors gap-1 text-xs sm:text-sm px-2 py-1.5 rounded-lg whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-white px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold transition-all shadow-sm text-xs sm:text-sm whitespace-nowrap shrink-0"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Book Ticket</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-800 font-medium hover:bg-primary-50 transition-colors text-sm"
            >
              <Home className="w-4 h-4 text-accent" /> ዋና ገጽ (Home)
            </Link>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-800 font-medium hover:bg-primary-50 transition-colors text-sm"
            >
              <Info className="w-4 h-4 text-accent" /> ስለ ጉዞው (About Journey)
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-800 font-medium hover:bg-primary-50 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-accent" /> አድራሻችን (Contact)
            </a>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {!isAdmin && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-800 font-medium hover:bg-primary-50 transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" /> ዳሽቦርድ (Dashboard)
                    </Link>
                    <Link
                      to="/dashboard?book=true"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-800 font-medium hover:bg-primary-50 transition-colors text-sm"
                    >
                      <Ticket className="w-4 h-4 text-amber-600" /> ትኬት ይቁረጡ (Book Ticket)
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-accent font-semibold hover:bg-accent/10 transition-colors text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-primary-200 text-primary-800 font-semibold text-sm hover:bg-primary-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors shadow-sm"
                >
                  ትኬት ይቁረጡ (Book Ticket)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

