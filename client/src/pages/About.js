import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Shield, 
  Award,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Direct Connection",
      description: "Connect farmers directly with buyers, eliminating middlemen and reducing costs."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: "Fair Pricing",
      description: "Farmers get better prices while buyers get fresh produce at competitive rates."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Quality Assurance",
      description: "Verified farmers and quality checks ensure you get the best produce."
    },
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: "Trusted Platform",
      description: "Secure transactions and reliable delivery with customer support."
    }
  ];

  const values = [
    {
      title: "Empowering Farmers",
      description: "We believe farmers deserve fair compensation for their hard work and dedication."
    },
    {
      title: "Quality First",
      description: "Fresh, high-quality produce is our commitment to every customer."
    },
    {
      title: "Transparency",
      description: "Clear pricing, honest communication, and transparent processes."
    },
    {
      title: "Sustainability",
      description: "Promoting sustainable farming practices and environmental responsibility."
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold">
              About Farm2Market
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing agriculture by connecting farmers directly with buyers, 
              eliminating middlemen, and ensuring fair prices for all.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To create a digital bridge that maximizes farmer profits while providing 
                buyers with fresh, high-quality produce at fair prices. We're committed 
                to transforming agriculture through technology and eliminating the barriers 
                that prevent farmers from getting their fair share.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Direct Trade:</strong> Farmers sell directly to buyers without middlemen
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Fair Pricing:</strong> Transparent pricing that benefits both farmers and buyers
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Quality Assurance:</strong> Verified farmers and quality checks for every order
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                    <div className="text-sm text-gray-600">Active Farmers</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 mb-2">5000+</div>
                    <div className="text-sm text-gray-600">Happy Buyers</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 mb-2">50K+</div>
                    <div className="text-sm text-gray-600">Orders Delivered</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 mb-2">₹2M+</div>
                    <div className="text-sm text-gray-600">Farmer Earnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose Farm2Market?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of agriculture with innovative solutions 
              that benefit everyone in the supply chain.
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

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment 
              to transforming agriculture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Farm2Market was born from a simple observation: farmers work incredibly hard 
                to grow quality produce, but they often receive only a fraction of the final 
                price due to multiple middlemen in the supply chain.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our founder, having grown up in a farming family, witnessed this firsthand. 
                The idea was to create a platform that connects farmers directly with buyers, 
                ensuring fair prices for farmers and fresh produce for buyers.
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
              Join the Agricultural Revolution
            </h2>
            <p className="text-xl text-green-100">
              Whether you're a farmer looking to sell directly or a buyer seeking fresh produce, 
              Farm2Market is here to connect you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?type=farmer" className="btn-secondary text-lg px-8 py-3">
                Join as Farmer
              </Link>
              <Link to="/register?type=buyer" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-lg transition-colors">
                Join as Buyer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
