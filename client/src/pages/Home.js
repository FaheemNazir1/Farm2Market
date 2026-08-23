import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScrollReveal } from '../components/UI/ScrollReveal';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  Sparkles,
  Award,
  CheckCircle2,
  MapPin,
  Star,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, isFarmer } = useAuth();
  const [activeTab, setActiveTab] = useState('farmer');

  const categories = [
    { name: 'Vegetables', icon: '🥦', count: '140+ Crops', color: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-200' },
    { name: 'Cereals & Grains', icon: '🌾', count: '85+ Varieties', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-200' },
    { name: 'Organic Fruits', icon: '🍎', count: '90+ Orchards', color: 'from-rose-500/20 to-red-500/10', border: 'border-rose-200' },
    { name: 'Pulses & Legumes', icon: '🫘', count: '60+ Types', color: 'from-teal-500/20 to-emerald-500/10', border: 'border-teal-200' },
    { name: 'Exotic Spices', icon: '🌶️', count: '45+ Fresh Spices', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-200' },
    { name: 'Farm Dairy & Oils', icon: '🥛', count: '30+ Products', color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-200' },
  ];

  const stats = [
    { value: '₹1.8 Cr+', label: 'Farmer Direct Payouts', change: '+24% this month' },
    { value: '14,200+', label: 'Registered Farmers', change: 'Across 18 States' },
    { value: '62,000+', label: 'Quintals Produce Sold', change: '100% Quality Checked' },
    { value: '0%', label: 'Middlemen Commission', change: 'Direct Profit to Producer' },
  ];

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: "Fair Transparent Pricing",
      description: "Direct price negotiation and real-time mandi APMC market rates ensure farmers retain up to 40% higher profits.",
      highlight: "+40% Higher Margins"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      title: "Guaranteed Escrow Payments",
      description: "Instant UPI & automated escrow settlement protects farmers and buyers against fraudulent payment delays.",
      highlight: "Instant UPI & Escrow"
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      title: "Direct Farm Logistics",
      description: "Optimized multi-tier delivery routes ensure farm-fresh produce arrives from field to buyer within 24 to 48 hours.",
      highlight: "< 48h Delivery"
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: "Organic & Quality Certified",
      description: "Produce quality grading with lab certification badges gives buyers confidence in origin and organic purity.",
      highlight: "Verified Badges"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Patil",
      role: "Organic Tomato Farmer",
      location: "Pune, Maharashtra",
      quote: "Before Farm2Market, local agents took 30% cuts. Now I sell directly to Pune supermarkets and get paid the same day on UPI.",
      metric: "+45% Income Increase",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Fresh Foods Retail Chain",
      location: "Mumbai, Maharashtra",
      quote: "The quality traceability is outstanding. We source Grade-A Basmati and spinach straight from verified farms with zero logistics headaches.",
      metric: "99.2% Quality Rate",
      rating: 5
    },
    {
      name: "Suresh Choudhary",
      role: "Wheat & Mustard Producer",
      location: "Karnal, Haryana",
      quote: "The voice command feature in Hindi makes it so easy to list crops straight from the tractor. A true game changer for rural farmers.",
      metric: "350+ Quintals Sold",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* =========================================================================
          HERO SECTION (High Impact Modern Layout)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Badge */}
              <ScrollReveal animation="fade-down" delay={100}>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-inner">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Smart India Hackathon 2025 • Direct Agri-Commerce</span>
                </div>
              </ScrollReveal>

              {/* Title */}
              <ScrollReveal animation="fade-up" delay={200}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-heading">
                  Empowering Farmers. <br className="hidden sm:inline" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-300">
                    Fresh Produce.
                  </span> <br />
                  Zero Middlemen.
                </h1>
              </ScrollReveal>

              {/* Description */}
              <ScrollReveal animation="fade-up" delay={300}>
                <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  A modern digital bridge connecting verified local farmers directly with wholesale buyers and consumers. Fair transparent pricing, secure UPI escrow, and field-to-door fresh delivery.
                </p>
              </ScrollReveal>

              {/* CTAs */}
              <ScrollReveal animation="fade-up" delay={400}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <Link
                    to="/marketplace"
                    className="btn-accent text-base px-8 py-3.5 group font-bold shadow-lg"
                  >
                    <span>Browse Fresh Produce</span>
                    <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1.5 transition-transform" />
                  </Link>

                  {!isAuthenticated ? (
                    <Link
                      to="/register?type=farmer"
                      className="btn-outline text-base px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 backdrop-blur-md"
                    >
                      <span>Join as Farmer</span>
                    </Link>
                  ) : isFarmer ? (
                    <Link
                      to="/crops/new"
                      className="btn-outline text-base px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 backdrop-blur-md"
                    >
                      <span>+ List New Crop</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="btn-outline text-base px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 backdrop-blur-md"
                    >
                      <span>Go to Dashboard</span>
                    </Link>
                  )}
                </div>
              </ScrollReveal>

              {/* Trust Micro-Badges */}
              <ScrollReveal animation="fade-up" delay={500}>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-emerald-200/80">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>100% Escrow Protected</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>APMC Verified Rates</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Bilingual Voice Support</span>
                  </div>
                </div>
              </ScrollReveal>

            </div>

            {/* Right Column: Interactive Live Showcase Card */}
            <div className="lg:col-span-5 relative">
              <ScrollReveal animation="zoom-in" delay={300}>
                
                {/* Floating Preview Card */}
                <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl text-slate-900 overflow-hidden">
                  
                  {/* Glowing Edge Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/30 rounded-full blur-2xl"></div>

                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/15">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
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
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      🌿 Organic Grade A
                    </span>
                  </div>

                  {/* Crop Showcase Image with Tag */}
                  <div className="relative my-4 rounded-2xl overflow-hidden bg-slate-800 shadow-inner group">
                    <img
                      src="/uploads/crops/1760276060831-671568258.jpeg"
                      alt="Organic Cherry Tomatoes"
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/10">
                      🍅 Freshly Harvested
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-lg">
                      100 kg In Stock
                    </div>
                  </div>

                  {/* Comparison Stats */}
                  <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-300 font-medium">Farm2Market Direct Price</p>
                        <p className="text-2xl font-black text-emerald-400">₹80 <span className="text-xs font-normal text-slate-300">/ kg</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 line-through">Middleman APMC: ₹45</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300">
                          +78% Farmer Profit
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full w-4/5 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Interactive Action */}
                  <div className="mt-4 pt-2">
                    <Link
                      to="/marketplace"
                      className="w-full btn-primary text-sm py-2.5 justify-center shadow-lg"
                    >
                      <span>Explore Listing in Marketplace</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                </div>

              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE STATS COUNTER STRIP
          ========================================================================= */}
      <section className="bg-white border-y border-slate-200/80 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <div className="text-center lg:text-left border-l-2 border-emerald-500 pl-4 py-1">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-heading">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    {stat.label}
                  </div>
                  <div className="text-xs font-medium text-emerald-600 mt-1">
                    {stat.change}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPLORE CATEGORIES SECTION
          ========================================================================= */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="glass-pill text-emerald-700">🌱 Handpicked Produce</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
                Explore Agricultural Categories
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Directly sourced from organic farms, certified orchards, and grain reserves across India.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 80}>
                <Link
                  to={`/marketplace?category=${encodeURIComponent(cat.name.split(' ')[0])}`}
                  className={`group block p-5 rounded-2xl bg-white border ${cat.border} shadow-sm hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1.5 text-center`}
                >
                  <div className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {cat.count}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          WHY FARM2MARKET (BENTO GRID FEATURE SECTION)
          ========================================================================= */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="glass-pill text-emerald-700">⚡ Breakthrough Platform</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
                Why Farmers & Buyers Choose Us
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Built specifically to solve structural supply chain inefficiencies in Indian agriculture.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <div className="card-hover h-full flex flex-col justify-between p-7 bg-gradient-to-b from-white to-slate-50/50">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold text-emerald-800 bg-emerald-100/70">
                      {feature.highlight}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE "HOW IT WORKS" WORKFLOW
          ========================================================================= */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="glass-pill text-emerald-700">🔄 Simple 3-Step Process</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
                How Farm2Market Works
              </h2>
              
              {/* Role Switcher Tabs */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 mt-4">
                <button
                  onClick={() => setActiveTab('farmer')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === 'farmer'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  🌾 For Farmers (Selling)
                </button>
                <button
                  onClick={() => setActiveTab('buyer')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === 'buyer'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  🛒 For Buyers (Sourcing)
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12">
            
            {activeTab === 'farmer' ? (
              <>
                <ScrollReveal animation="fade-right" delay={100}>
                  <div className="card-hover bg-white p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">List Your Harvest</h3>
                    <p className="text-slate-600 text-sm">
                      Upload crop pictures, set your own fair pricing per kg, and specify harvest date with optional voice commands.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={200}>
                  <div className="card-hover bg-white p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Receive Direct Orders</h3>
                    <p className="text-slate-600 text-sm">
                      Buyers and retail chains send verified purchase orders with escrow-backed payment assurance.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-left" delay={300}>
                  <div className="card-hover bg-white p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Dispatch & Get Paid</h3>
                    <p className="text-slate-600 text-sm">
                      Partner logistics picks up produce from your field. Funds transfer directly to your UPI bank account upon delivery.
                    </p>
                  </div>
                </ScrollReveal>
              </>
            ) : (
              <>
                <ScrollReveal animation="fade-right" delay={100}>
                  <div className="card-hover bg-white p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-teal-600/30">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Search & Filter</h3>
                    <p className="text-slate-600 text-sm">
                      Browse organic produce across India filtered by state, price bracket, harvest freshness, and farmer ratings.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={200}>
                  <div className="card-hover bg-white p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-teal-600/30">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Instant Checkout</h3>
                    <p className="text-slate-600 text-sm">
                      Place single or bulk orders with secure payment choices: UPI (Razorpay), Credit/Debit Card, or Cash on Delivery.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-left" delay={300}>
                  <div className="card-hover bg-white p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-teal-600/30">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Track & Receive Fresh</h3>
                    <p className="text-slate-600 text-sm">
                      Track live transit status and receive fresh, unadulterated farm produce directly at your doorstep.
                    </p>
                  </div>
                </ScrollReveal>
              </>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          VERIFIED TESTIMONIALS & FARMER SPOTLIGHT
          ========================================================================= */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="glass-pill text-emerald-700">⭐ Real Stories</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
                Trusted by Farmers & Retailers
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                See how direct agricultural trade is creating financial freedom for farming families.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 120}>
                <div className="card-hover bg-slate-50/70 p-7 flex flex-col justify-between h-full border border-slate-200/80">
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex items-center space-x-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-slate-700 text-sm italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-500">{t.role}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">{t.location}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100/90">
                      {t.metric}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION (CTA) SECTION
          ========================================================================= */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          <ScrollReveal animation="fade-up">
            <span className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold backdrop-blur-md">
              🚀 Join The Agricultural Revolution
            </span>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-heading leading-tight">
              Ready to Maximize Profits & <br className="hidden sm:inline" />
              Source Fresher Produce?
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto">
              Whether you're a farmer looking for fair rates or a buyer searching for farm-fresh stock, Farm2Market is your direct gateway.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/marketplace"
                className="btn-accent text-base px-8 py-3.5 shadow-xl font-bold"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn-outline text-base px-8 py-3.5 bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  <span>Create Free Account</span>
                </Link>
              )}
            </div>
          </ScrollReveal>

        </div>
      </section>

    </div>
  );
};

export default Home;
