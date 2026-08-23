import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { ScrollReveal } from '../components/UI/ScrollReveal';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Award,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Mic
} from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isFarmer } = useAuth();

  const categories = [
    { name: 'Vegetables', label: '🥦 Vegetables / भाजीपाला', count: '140+ Crops', color: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-200' },
    { name: 'Cereals', label: '🌾 Cereals & Grains / धान्य', count: '85+ Varieties', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-200' },
    { name: 'Fruits', label: '🍎 Fresh Fruits / फळे', count: '90+ Orchards', color: 'from-rose-500/20 to-red-500/10', border: 'border-rose-200' },
    { name: 'Pulses', label: '🫘 Pulses & Dal / डाळी', count: '60+ Types', color: 'from-teal-500/20 to-emerald-500/10', border: 'border-teal-200' },
    { name: 'Spices', label: '🌶️ Spices / मसाले', count: '45+ Fresh Spices', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-200' },
    { name: 'Oilseeds', label: '🌻 Oilseeds / तेलबिया', count: '30+ Products', color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-200' },
  ];

  const stats = [
    { value: '5,000+', label: t('home.statsFarmers', '5,000+ Verified Farmers'), change: 'Across India' },
    { value: '100%', label: t('home.statsCrops', '100% Direct Field Sourcing'), change: 'Quality Inspected' },
    { value: '0%', label: t('home.statsFairPrice', 'Zero Exploitative Middlemen'), change: 'Fair Direct Profits' },
    { value: '24/7', label: t('home.statsSupport', '24/7 Multilingual Support'), change: 'English, Hindi, Marathi' },
  ];

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: t('home.featureDirectTitle', 'Direct-from-Farm Commerce'),
      description: t('home.featureDirectDesc', 'Buyers purchase directly from growers with full traceability and transparent market pricing.')
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      title: t('home.featureFairTitle', 'Fair Minimum Price Guarantee'),
      description: t('home.featureFairDesc', 'Farmers retain the true value of their harvests without paying heavy commission fees to brokers.')
    },
    {
      icon: <Mic className="w-6 h-6 text-amber-600" />,
      title: t('home.featureAITitle', 'Voice & Multilingual AI'),
      description: t('home.featureAIDesc', 'Order and manage crop listings via voice in English, Hindi, or Marathi with GPS geolocation.')
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: t('home.featureQualityTitle', 'Quality & Freshness Assured'),
      description: t('home.featureQualityDesc', 'Harvest dates, organic certifications, and grade details are verified for every listing.')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              <ScrollReveal animation="fade-down" delay={100}>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-inner">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{t('home.badge', 'Smart India Hackathon 2025 • Direct Agri Commerce')}</span>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={200}>
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.2] font-heading">
                  {t('home.heroTitle', "Empowering India's Farmers, Delivering Freshness Directly")}
                </h1>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={300}>
                <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  {t('home.heroSubtitle', 'A digital marketplace connecting hardworking farmers directly with bulk buyers, retailers, and consumers. Eliminate middlemen and maximize fair agricultural profits.')}
                </p>
              </ScrollReveal>

              {/* CTAs */}
              <ScrollReveal animation="fade-up" delay={400}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <Link
                    to="/marketplace"
                    className="btn-accent text-base px-8 py-3.5 group font-bold shadow-lg justify-center"
                  >
                    <span>{t('home.browseMarketplace', 'Explore Fresh Produce')}</span>
                    <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform" />
                  </Link>

                  {!isAuthenticated ? (
                    <Link
                      to="/register?type=farmer"
                      className="btn-outline text-base px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 backdrop-blur-md justify-center"
                    >
                      <span>{t('home.joinAsFarmer', 'Join as a Farmer')}</span>
                    </Link>
                  ) : isFarmer ? (
                    <Link
                      to="/crops/new"
                      className="btn-outline text-base px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 backdrop-blur-md justify-center"
                    >
                      <span>+ {t('nav.addCrop', 'Add New Crop')}</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="btn-outline text-base px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 backdrop-blur-md justify-center"
                    >
                      <span>{t('nav.dashboard', 'Go to Dashboard')}</span>
                    </Link>
                  )}
                </div>
              </ScrollReveal>

              {/* Trust Micro-Badges */}
              <ScrollReveal animation="fade-up" delay={500}>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4 text-xs font-semibold text-emerald-200/80">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero Middlemen</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>GPS Farm Geolocation</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>English • हिन्दी • मराठी Voice AI</span>
                  </div>
                </div>
              </ScrollReveal>

            </div>

            {/* Right Column: Live Showcase Card */}
            <div className="lg:col-span-5 relative">
              <ScrollReveal animation="zoom-in" delay={300}>
                <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white overflow-hidden space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-base shadow-md">
                        RK
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-bold text-white">Rajesh Kumar</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <p className="text-xs text-emerald-200/80 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" /> Pune, Maharashtra
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Verified
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden relative h-48 bg-slate-800">
                    <img
                      src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
                      alt="Organic Tomatoes"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-xs font-bold backdrop-blur-md">
                      🌱 Certified Organic
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-xs font-black shadow-md">
                      120 kg Available
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs text-emerald-200/80">Direct Farm Price</p>
                      <p className="text-2xl font-black text-white font-heading">₹60 <span className="text-xs text-emerald-200">/ kg</span></p>
                    </div>

                    <Link
                      to="/marketplace"
                      className="btn-primary text-xs py-2 px-4 shadow-md font-bold"
                    >
                      View Live Crops
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-white border-y border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-heading">{stat.value}</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{stat.label}</p>
                <p className="text-[11px] text-slate-400 font-medium">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Features & Benefits</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              {t('home.featuresTitle', 'Why Choose Farm2Market?')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {t('home.featuresSubtitle', 'Transforming the agricultural supply chain with cutting-edge digital infrastructure')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="card p-6 bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Produce Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
                {t('home.categoriesTitle', 'Popular Harvest Categories')}
              </h2>
            </div>

            <Link to="/marketplace" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center">
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 transition-all text-center space-y-2 group shadow-sm"
              >
                <div className="text-3xl">{cat.label.split(' ')[0]}</div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 font-heading">
                  {cat.label.split('/')[0].replace(/^[^\w]+/, '')}
                </div>
                <div className="text-[10px] text-slate-400">{cat.count}</div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl font-black font-heading">{t('home.howItWorksTitle', 'How It Works')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* For Farmers */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-lg font-heading">
                <span>🌾</span>
                <span>{t('home.howForFarmersTitle', 'For Farmers')}</span>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 font-medium">
                  {t('home.howForFarmersStep1', '1. Register & Verify Your Farm')}
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 font-medium">
                  {t('home.howForFarmersStep2', '2. List Harvest with Price & GPS')}
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 font-medium">
                  {t('home.howForFarmersStep3', '3. Receive Orders & Direct Payments')}
                </div>
              </div>
              <Link to="/register?type=farmer" className="btn-primary text-xs w-full justify-center py-3">
                {t('home.ctaButtonFarmer', 'Start Selling Today')}
              </Link>
            </div>

            {/* For Buyers */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-lg font-heading">
                <span>🛒</span>
                <span>{t('home.howForBuyersTitle', 'For Buyers')}</span>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 font-medium">
                  {t('home.howForBuyersStep1', '1. Browse Local Crops & Mandis')}
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 font-medium">
                  {t('home.howForBuyersStep2', '2. Chat with Farmers on WhatsApp')}
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 font-medium">
                  {t('home.howForBuyersStep3', '3. Secure Checkout & Fresh Delivery')}
                </div>
              </div>
              <Link to="/marketplace" className="btn-accent text-xs w-full justify-center py-3 font-bold">
                {t('home.ctaButtonBuyer', 'Browse Live Marketplace')}
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-heading">
            {t('home.ctaTitle', 'Ready to Transform Agricultural Trade?')}
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl mx-auto">
            {t('home.ctaSubtitle', 'Join thousands of farmers and buyers enjoying direct trade with transparent pricing.')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link to="/register" className="btn-accent text-sm px-8 py-3 font-bold">
              {t('nav.register', 'Get Started')}
            </Link>
            <Link to="/contact" className="btn-outline text-sm px-8 py-3 bg-white/10 text-white border-white/30">
              {t('nav.contact', 'Contact Us')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
