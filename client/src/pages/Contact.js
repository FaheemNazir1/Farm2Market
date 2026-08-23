import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { getSupportWhatsAppLink, WHATSAPP_SUPPORT_NUMBER } from '../utils/whatsapp';
import toast from 'react-hot-toast';

const Contact = () => {
  const { t } = useTranslation();
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

    setTimeout(() => {
      toast.success(t('common.success', 'Message sent successfully! We will get back to you soon.'));
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleWhatsAppHelp = () => {
    const link = getSupportWhatsAppLink(`Hello Farm2Market Support! My name is ${formData.name || 'User'}. I need help with: ${formData.subject || 'General Inquiry'}`);
    window.open(link, '_blank');
  };

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
      title: t('contact.whatsappTitle', 'WhatsApp Support'),
      description: t('contact.whatsappDesc', 'Chat directly with our support team on WhatsApp'),
      contact: WHATSAPP_SUPPORT_NUMBER,
      action: getSupportWhatsAppLink(),
      isWhatsApp: true
    },
    {
      icon: <Mail className="w-6 h-6 text-emerald-600" />,
      title: t('contact.emailTitle', 'Email Support'),
      description: t('contact.emailDesc', 'Send us your queries anytime'),
      contact: 'support@farm2market.in',
      action: 'mailto:support@farm2market.in',
      isWhatsApp: false
    },
    {
      icon: <Phone className="w-6 h-6 text-emerald-600" />,
      title: t('contact.phoneTitle', 'Phone Helpline'),
      description: t('contact.phoneDesc', 'Mon - Sat from 9:00 AM to 7:00 PM IST'),
      contact: '+91 6006097169',
      action: 'tel:+916006097169',
      isWhatsApp: false
    },
    {
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      title: t('contact.officeTitle', 'Innovation Office'),
      description: t('contact.officeDesc', 'KIT Kolhapur, Maharashtra, India'),
      contact: 'Kolhapur, India',
      action: '#',
      isWhatsApp: false
    }
  ];

  const faqs = [
    {
      question: t('contact.faq1Q', 'How do farmers receive payments?'),
      answer: t('contact.faq1A', 'Payments are processed securely via direct bank transfer or UPI once the buyer confirms delivery inspection.')
    },
    {
      question: t('contact.faq2Q', 'Is there a registration fee for farmers?'),
      answer: t('contact.faq2A', 'No, joining Farm2Market is completely free for all Indian farmers with zero upfront subscription costs.')
    },
    {
      question: t('contact.faq3Q', 'Can buyers request sample batches or negotiate bulk pricing?'),
      answer: t('contact.faq3A', 'Yes! Buyers can use the WhatsApp chat button to speak directly with the farmer and agree on custom bulk orders.')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('contact.badge', 'Get in Touch')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">
            {t('contact.title', "We're Here to Help")}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base max-w-2xl mx-auto">
            {t('contact.subtitle', 'Have questions about crop listings, buyer bulk orders, or technical support? Contact our 24/7 helpline.')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              target={method.isWhatsApp ? '_blank' : '_self'}
              rel={method.isWhatsApp ? 'noopener noreferrer' : ''}
              className={`card p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 block ${
                method.isWhatsApp 
                  ? 'border-2 border-[#25D366]/40 bg-gradient-to-br from-white to-emerald-50/60 ring-2 ring-emerald-500/10' 
                  : 'border border-slate-200/80 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                {method.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base font-heading mb-1">{method.title}</h3>
              <p className="text-xs text-slate-500 mb-3">{method.description}</p>
              <div className="text-xs font-bold text-emerald-700 break-all">{method.contact}</div>
            </a>
          ))}
        </div>

        {/* Main Content: Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-heading">
                    {t('contact.formTitle', 'Send Us a Message')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">We typically reply within 2 hours</p>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Live</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('contact.formName', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('contact.formEmail', 'Email Address')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('contact.formType', 'Inquiry Type')}
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="input-field text-sm"
                    >
                      <option value="general">{t('contact.typeGeneral', 'General Inquiry')}</option>
                      <option value="farmer">{t('contact.typeFarmer', 'Farmer Support & Onboarding')}</option>
                      <option value="buyer">{t('contact.typeBuyer', 'Buyer Bulk Purchase')}</option>
                      <option value="technical">{t('contact.typeTechnical', 'Technical Issue')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('contact.formSubject', 'Subject')} *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Summary of inquiry"
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('contact.formMessage', 'Your Message')} *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="How can our agricultural support team help you today?"
                    className="input-field text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-sm font-bold justify-center shadow-lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>{isSubmitting ? t('contact.formSending', 'Sending Message...') : t('contact.formSubmit', 'Send Message')}</span>
                </button>
              </form>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-6 bg-white border border-slate-200/80 shadow-md space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 font-heading text-lg">
                  {t('contact.faqsTitle', 'Frequently Asked Questions')}
                </h3>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{faq.question}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;
