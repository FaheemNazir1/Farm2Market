import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Headphones,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-primary-600" />,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "support@farm2market.com",
      action: "mailto:support@farm2market.com"
    },
    {
      icon: <Phone className="w-6 h-6 text-green-600" />,
      title: "Call Us",
      description: "Mon-Fri from 9am to 6pm",
      contact: "+91 6006097169",
      action: "tel:+916006097169"
    },
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      title: "Visit Us",
      description: "Come say hello at our office",
      contact: "KIT Kolhapur, Maharashtra, India",
      action: "#"
    }
  ];

  const faqs = [
    {
      question: "How do I register as a farmer?",
      answer: "Click on 'Join as Farmer' on our homepage, fill in your details including farm information, and verify your account. You can start listing your crops immediately after registration."
    },
    {
      question: "What types of crops can I sell?",
      answer: "You can sell any type of agricultural produce including cereals, pulses, vegetables, fruits, spices, medicinal plants, and more. We support both organic and conventional farming."
    },
    {
      question: "How do payments work?",
      answer: "We support multiple payment methods including credit/debit cards, UPI, net banking, and cash on delivery. Payments are processed securely and farmers receive their earnings after successful delivery."
    },
    {
      question: "Is there a fee for using Farm2Market?",
      answer: "Farm2Market charges a small commission only on successful transactions. There are no upfront fees or subscription costs for farmers or buyers."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is confirmed, you'll receive tracking information via SMS and email. You can also track your order status in your dashboard."
    },
    {
      question: "What if I'm not satisfied with my purchase?",
      answer: "We have a quality guarantee policy. If you're not satisfied with the quality of produce received, contact our support team within 24 hours of delivery for a refund or replacement."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions or need help? We're here to assist you. 
              Get in touch with our team and we'll respond promptly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Contact Methods */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {method.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{method.title}</h3>
                        <p className="text-gray-600 text-sm mb-1">{method.description}</p>
                        <a 
                          href={method.action}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {method.contact}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-primary-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              {/* Support Types */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Quick Support</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700">Live Chat</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                    <Headphones className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700">Customer Support</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                    <HelpCircle className="w-5 h-5 text-primary-600" />
                    <span className="text-gray-700">Help Center</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="farmer">Farmer Support</option>
                    <option value="buyer">Buyer Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field resize-none"
                    placeholder="Enter your message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner w-5 h-5 mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about Farm2Market. 
              Can't find what you're looking for? Contact us!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <div className="w-6 h-6 text-gray-400">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-20">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Find Us</h3>
              <p className="text-gray-600">Visit our office in New Delhi</p>
            </div>
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive map would be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  KIT Kolhapur, Maharashtra, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
