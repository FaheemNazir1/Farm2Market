import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Sprout, 
  Send, 
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { getSupportWhatsAppLink, WHATSAPP_SUPPORT_NUMBER } from '../../utils/whatsapp';
import toast from 'react-hot-toast';

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to Agricultural Updates!');
    setEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        
        {/* Top Newsletter Strip */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-teal-950 border border-emerald-500/20 mb-16 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-black text-white font-heading">
              {t('footer.mandiUpdates', 'Stay Updated with Mandi & Crop Prices')}
            </h3>
            <p className="text-sm text-emerald-200/80 max-w-xl">
              {t('footer.mandiSub', 'Get weekly agricultural price trend reports, seasonal harvest advisories, and organic farming insights directly to your inbox.')}
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="px-4 py-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full sm:w-72"
            />
            <button type="submit" className="btn-primary text-sm px-5 py-3 flex-shrink-0">
              <span>{t('footer.subscribe', 'Subscribe')}</span>
              <Send className="w-4 h-4 ml-1.5" />
            </button>
          </form>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                Farm<span className="text-emerald-400">2</span>Market
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {t('footer.brandDesc', "Empowering India's farmers with direct-to-buyer agricultural commerce. Eliminating exploitative middlemen and delivering freshness from field to table.")}
            </p>

            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart India Hackathon 2025 Approved Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              {t('footer.platform', 'Platform')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('nav.home', 'Home')}
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('nav.marketplace', 'Marketplace')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('nav.about', 'About Us')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('nav.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              {t('footer.forFarmers', 'For Farmers')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register?type=farmer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('home.joinAsFarmer', 'Join as a Farmer')}
                </Link>
              </li>
              <li>
                <Link to="/crops/new" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('nav.addCrop', 'Add New Crop')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              {t('footer.support', 'Helpline & Office')}
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <a
                href={getSupportWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-[#25D366] hover:text-[#20bd5a] font-bold text-xs bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('footer.whatsappHelpline', 'WhatsApp Support:')} {WHATSAPP_SUPPORT_NUMBER}</span>
              </a>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">support@farm2market.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 6006097169</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>KIT Kolhapur, Maharashtra, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal */}
        <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Farm2Market. {t('footer.rights', 'All rights reserved. Built with ❤️ for Indian Farmers.')}
          </div>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">
              {t('footer.privacy', 'Privacy Policy')}
            </Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">
              {t('footer.terms', 'Terms of Service')}
            </Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">
              {t('nav.contact', 'Contact Support')}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
