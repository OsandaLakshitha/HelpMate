  import React, { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import { Menu, X, Sparkles, Brain } from 'lucide-react';

  const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-lg shadow-teal-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-teal-600 bg-clip-text text-transparent">
                HelpMate
              </span>
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/features"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/how-it-works"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/pricing"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/about"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="relative group overflow-hidden bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/50 hover:scale-105"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 bg-white/95 backdrop-blur-lg rounded-b-2xl shadow-xl">
              <Link
                to="/features"
                className="block px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
              >
                Features
              </Link>
              <Link
                to="/how-it-works"
                className="block px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
              >
                How It Works
              </Link>
              <Link
                to="/pricing"
                className="block px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
              >
                About
              </Link>
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block mx-4 text-center bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2.5 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  };

  export default Navbar;