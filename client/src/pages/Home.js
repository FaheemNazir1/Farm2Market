import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Truck,
  Clock,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Direct Connection",
      description: "Connect directly with farmers and buyers, eliminating middlemen and reducing costs."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: "Maximize Profits",
      description: "Farmers get better prices while buyers get fresh produce at competitive rates."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Secure Transactions",
      description: "Safe and secure payment processing with order tracking and quality assurance."
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery options to ensure freshness of your produce."
    }
  ];





  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                A Digital Bridge for
                <span className="block text-secondary-400">Maximizing Farmer Profits</span>
              </h1>
              <p className="text-xl text-green-100 leading-relaxed">
                Connect directly with farmers and buyers. Eliminate middlemen, ensure fair prices,
                and get fresh produce delivered to your doorstep.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?type=farmer" className="btn-secondary text-lg px-8 py-3">
                Join as Farmer
              </Link>
              <Link to="/register?type=buyer" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-lg transition-colors">
                Join as Buyer
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-green-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose Farm2Market?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing agriculture by connecting farmers directly with buyers, 
              ensuring fair prices and fresh produce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to connect farmers and buyers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sign Up</h3>
              <p className="text-gray-600">
                Farmers list their crops, buyers browse and select fresh produce
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Order & Pay</h3>
              <p className="text-gray-600">
                Secure payment processing with multiple payment options
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Deliver & Enjoy</h3>
              <p className="text-gray-600">
                Fast delivery of fresh produce with quality assurance
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Agriculture?
            </h2>
            <p className="text-xl text-green-100">
              Join thousands of farmers and buyers who are already benefiting from direct trade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace" className="btn-secondary text-lg px-8 py-3 inline-flex items-center">
                Browse Marketplace
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-lg transition-colors inline-flex items-center">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
