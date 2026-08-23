import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Target, 
  CheckCircle2,
  Sparkles,
  Globe2
} from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      title: t('about.valueTransparency', 'Total Price Transparency'),
      description: 'Clear market-driven pricing with real-time APMC data, eliminating hidden commissions.'
    },
    {
      title: t('about.valueEmpowerment', 'Farmer-First Empowerment'),
      description: 'Equipping growers with direct digital reach, AI tools, and instant escrow settlements.'
    },
    {
      title: t('about.valueInnovation', 'Inclusive Multilingual AI'),
      description: 'Empowering farmers to trade via voice in English, हिन्दी, and मराठी.'
    },
    {
      title: t('about.valueQuality', 'Field-Fresh Quality Assurance'),
      description: 'Harvest verification, organic certifications, and grade details for every single listing.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('about.badge', 'Our Mission & Vision')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">
            {t('about.title', 'Bridging the Gap Between Soil and Table')}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base max-w-2xl mx-auto">
            {t('about.subtitle', 'Farm2Market was engineered to dismantle legacy supply chain inefficiencies and return agricultural prosperity to Indian farmers.')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-12">
        
        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8 bg-white border border-slate-200/80 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-heading">
              {t('about.missionTitle', 'Our Mission')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('about.missionDesc', 'To maximize farmer earnings by providing direct market access, voice-assisted technology, and transparent agricultural trade.')}
            </p>
          </div>

          <div className="card p-8 bg-white border border-slate-200/80 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Globe2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-heading">
              {t('about.visionTitle', 'Our Vision')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('about.visionDesc', 'A digitally inclusive agricultural ecosystem where every Indian farmer has equitable access to buyers and fair market value.')}
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="card p-8 sm:p-12 bg-white border border-slate-200/80 shadow-md space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {t('about.storyTitle', 'The Story Behind Farm2Market')}
          </h2>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>{t('about.storyP1', 'In traditional agricultural supply chains, farmers often receive as little as 20-30% of the retail price paid by end consumers, with intermediaries capturing the majority of profit margins.')}</p>
            <p>{t('about.storyP2', 'Farm2Market provides a transparent, multilingual, GPS-enabled digital platform that enables direct transaction, verified farm listing, and instant digital payments.')}</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 font-heading text-center">
            {t('about.valuesTitle', 'Our Core Values')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <div key={i} className="card p-6 bg-white border border-slate-200/80 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <h3 className="font-bold text-slate-900 text-sm font-heading">{val.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default About;
