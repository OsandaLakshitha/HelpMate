import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, MapPin, Phone, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold">HelpMate</span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering students with AI-driven tools for better learning, career planning, and mental wellness.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-colors duration-200"
                aria-label="Github"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Press Kit
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <Mail className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@helpmate.com" className="text-slate-300 hover:text-teal-400 transition-colors duration-200">
                  support@helpmate.com
                </a>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <Phone className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-slate-300 hover:text-teal-400 transition-colors duration-200">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">
                  123 Education Street,<br />
                  Learning City, LC 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {currentYear} HelpMate. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;