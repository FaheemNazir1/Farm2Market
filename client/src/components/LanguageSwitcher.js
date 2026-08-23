import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language?.split('-')[0]) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/70 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="font-heading hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 border border-slate-100 py-1.5 z-50 animate-scale-up">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Select Language
          </div>
          {languages.map((language) => {
            const isSelected = currentLanguage.code === language.code;
            return (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{language.flag}</span>
                  <div className="text-left">
                    <div>{language.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{language.name}</div>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
