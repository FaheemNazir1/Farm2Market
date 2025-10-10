import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">Farm2Market</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              A digital bridge connecting farmers directly to buyers, eliminating middlemen 
              and maximizing farmer profits for a sustainable agricultural future.
            </p>
            <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Home
              </Link>
              <Link to="/marketplace" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Marketplace
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* For Farmers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Farmers</h3>
            <div className="space-y-2">
              <Link to="/register?type=farmer" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Join as Farmer
              </Link>
              <Link to="/marketplace" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Sell Your Crops
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                How It Works
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Support
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 text-sm">support@farm2market.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 text-sm">+91 6006097169</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  KIT Kolhapur<br />
                  Maharashtra, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Farm2Market. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for Smart India Hackathon 2025</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
