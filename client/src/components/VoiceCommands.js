import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  HelpCircle, 
  X, 
  Sparkles, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VoiceCommands = () => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-IN');
  const [manualCommandInput, setManualCommandInput] = useState('');
  const [lastErrorMsg, setLastErrorMsg] = useState(null);

  const recognitionRef = useRef(null);
  const isStartingRef = useRef(false);
  const navigate = useNavigate();
  const { isAuthenticated, isFarmer } = useAuth();

  // Map i18n language to BCP 47 Speech Recognition locale codes
  const getSpeechLangCode = useCallback((lang) => {
    const code = (lang || 'en').split('-')[0].toLowerCase();
    switch (code) {
      case 'hi':
        return 'hi-IN'; // Hindi (India)
      case 'mr':
        return 'mr-IN'; // Marathi (India)
      case 'en':
      default:
        return 'en-IN'; // English (India)
    }
  }, []);

  // Text-To-Speech response matching current language
  const speakResponse = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLanguage;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const currentLangCode = speechLanguage.split('-')[0];
      const matchingVoice = voices.find(v => v.lang.startsWith(currentLangCode)) || voices[0];
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }, [speechLanguage]);

  // Command execution handler
  const processCommand = useCallback((rawCommand) => {
    if (!rawCommand || typeof rawCommand !== 'string') return;
    const cmd = rawCommand.toLowerCase().trim();
    console.log('[Voice AI] Received command:', cmd, 'Lang:', speechLanguage);

    const lang = speechLanguage.split('-')[0];
    setLastErrorMsg(null);

    // ==========================================
    // 1. NAVIGATION: Marketplace / Products
    // ==========================================
    if (
      cmd.includes('marketplace') ||
      cmd.includes('show products') ||
      cmd.includes('browse crops') ||
      cmd.includes('market') ||
      cmd.includes('बाजार') ||
      cmd.includes('मार्केट') ||
      cmd.includes('मार्केटप्लेस') ||
      cmd.includes('बाजारपेठ') ||
      cmd.includes('पिके दाखवा') ||
      cmd.includes('उत्पादने दाखवा') ||
      cmd.includes('शेतमाल दाखवा')
    ) {
      navigate('/marketplace');
      if (lang === 'hi') speakResponse('बाजार खोल रहा हूँ');
      else if (lang === 'mr') speakResponse('बाजारपेठ उघडत आहे');
      else speakResponse('Opening marketplace');
      return;
    }

    // ==========================================
    // 2. NAVIGATION: Add Crop / Produce
    // ==========================================
    if (
      cmd.includes('add crop') ||
      cmd.includes('add product') ||
      cmd.includes('new crop') ||
      cmd.includes('list produce') ||
      cmd.includes('फसल जोड़') ||
      cmd.includes('नई फसल') ||
      cmd.includes('उत्पाद जोड़') ||
      cmd.includes('पीक जोडा') ||
      cmd.includes('नवीन पीक') ||
      cmd.includes('उत्पादन जोडा')
    ) {
      if (isAuthenticated && isFarmer) {
        navigate('/crops/new');
        if (lang === 'hi') speakResponse('नई फसल जोड़ने का पेज खोल रहा हूँ');
        else if (lang === 'mr') speakResponse('नवीन पीक जोडण्याचे पृष्ठ उघडत आहे');
        else speakResponse('Opening add crop page');
      } else if (!isAuthenticated) {
        navigate('/login');
        if (lang === 'hi') speakResponse('कृपया पहले किसान के रूप में लॉगिन करें');
        else if (lang === 'mr') speakResponse('कृपया प्रथम शेतकरी म्हणून लॉगिन करा');
        else speakResponse('Please login as a farmer first');
      } else {
        if (lang === 'hi') speakResponse('केवल किसान ही फसल जोड़ सकते हैं');
        else if (lang === 'mr') speakResponse('फक्त शेतकरी पीक जोडू शकतात');
        else speakResponse('Only farmers can list crops');
      }
      return;
    }

    // ==========================================
    // 3. NAVIGATION: Dashboard
    // ==========================================
    if (
      cmd.includes('dashboard') ||
      cmd.includes('my farm') ||
      cmd.includes('डैशबोर्ड') ||
      cmd.includes('डॅशबोर्ड') ||
      cmd.includes('माझे शेत')
    ) {
      if (isAuthenticated) {
        navigate('/dashboard');
        if (lang === 'hi') speakResponse('डैशबोर्ड खोल रहा हूँ');
        else if (lang === 'mr') speakResponse('डॅशबोर्ड उघडत आहे');
        else speakResponse('Opening your dashboard');
      } else {
        navigate('/login');
        if (lang === 'hi') speakResponse('कृपया पहले लॉगिन करें');
        else if (lang === 'mr') speakResponse('कृपया प्रथम लॉगिन करा');
        else speakResponse('Please login first');
      }
      return;
    }

    // ==========================================
    // 4. NAVIGATION: Orders
    // ==========================================
    if (
      cmd.includes('my orders') ||
      cmd.includes('show orders') ||
      cmd.includes('open orders') ||
      cmd.includes('मेरे ऑर्डर') ||
      cmd.includes('ऑर्डर दिखाओ') ||
      cmd.includes('माझे ऑर्डर') ||
      cmd.includes('ऑर्डर दाखवा')
    ) {
      if (isAuthenticated) {
        navigate('/orders');
        if (lang === 'hi') speakResponse('आपके ऑर्डर खोल रहा हूँ');
        else if (lang === 'mr') speakResponse('तुमचे ऑर्डर्स उघडत आहे');
        else speakResponse('Opening your orders');
      } else {
        navigate('/login');
        speakResponse(lang === 'hi' ? 'कृपया पहले लॉगिन करें' : lang === 'mr' ? 'कृपया प्रथम लॉगिन करा' : 'Please login first');
      }
      return;
    }

    // ==========================================
    // 5. NAVIGATION: Cart
    // ==========================================
    if (
      cmd.includes('cart') ||
      cmd.includes('my cart') ||
      cmd.includes('show cart') ||
      cmd.includes('कार्ट') ||
      cmd.includes('टोकरी')
    ) {
      if (isAuthenticated) {
        navigate('/cart');
        speakResponse(lang === 'hi' ? 'कार्ट खोल रहा हूँ' : lang === 'mr' ? 'कार्ट उघडत आहे' : 'Opening your cart');
      } else {
        navigate('/login');
        speakResponse(lang === 'hi' ? 'कृपया पहले लॉगिन करें' : lang === 'mr' ? 'कृपया लॉगिन करा' : 'Please login first');
      }
      return;
    }

    // ==========================================
    // 6. NAVIGATION: Profile
    // ==========================================
    if (
      cmd.includes('profile') ||
      cmd.includes('my account') ||
      cmd.includes('प्रोफाइल') ||
      cmd.includes('खाता')
    ) {
      if (isAuthenticated) {
        navigate('/profile');
        speakResponse(lang === 'hi' ? 'प्रोफाइल खोल रहा हूँ' : lang === 'mr' ? 'प्रोफाइल उघडत आहे' : 'Opening your profile');
      } else {
        navigate('/login');
        speakResponse(lang === 'hi' ? 'कृपया लॉगिन करें' : lang === 'mr' ? 'कृपया लॉगिन करा' : 'Please login first');
      }
      return;
    }

    // ==========================================
    // 7. NAVIGATION: Nearby / GPS
    // ==========================================
    if (
      cmd.includes('near me') ||
      cmd.includes('nearby') ||
      cmd.includes('nearby buyers') ||
      cmd.includes('nearby farmers') ||
      cmd.includes('आसपास') ||
      cmd.includes('पास के') ||
      cmd.includes('जवळचे') ||
      cmd.includes('माझ्या जवळ')
    ) {
      navigate('/marketplace?nearMe=true');
      if (lang === 'hi') speakResponse('आसपास की फसलें खोज रहा हूँ');
      else if (lang === 'mr') speakResponse('जवळची पिके शोधत आहे');
      else speakResponse('Searching nearby produce');
      return;
    }

    // ==========================================
    // 8. CATEGORY SEARCH
    // ==========================================
    if (cmd.includes('vegetable') || cmd.includes('सब्जी') || cmd.includes('भाजीपाला')) {
      navigate('/marketplace?category=Vegetables');
      speakResponse(lang === 'hi' ? 'सब्जियां खोज रहा हूँ' : lang === 'mr' ? 'भाजीपाला शोधत आहे' : 'Searching for fresh vegetables');
      return;
    }
    if (cmd.includes('fruit') || cmd.includes('फल') || cmd.includes('फळे')) {
      navigate('/marketplace?category=Fruits');
      speakResponse(lang === 'hi' ? 'ताज़े फल खोज रहा हूँ' : lang === 'mr' ? 'ताजी फळे शोधत आहे' : 'Searching for fresh fruits');
      return;
    }
    if (cmd.includes('cereal') || cmd.includes('grain') || cmd.includes('अनाज') || cmd.includes('धान्य') || cmd.includes('तांदूळ') || cmd.includes('चावल')) {
      navigate('/marketplace?category=Cereals');
      speakResponse(lang === 'hi' ? 'अनाज खोज रहा हूँ' : lang === 'mr' ? 'धान्य शोधत आहे' : 'Searching for cereals and grains');
      return;
    }

    // ==========================================
    // 9. GENERAL SEARCH
    // ==========================================
    if (
      cmd.startsWith('search') ||
      cmd.startsWith('find') ||
      cmd.startsWith('show') ||
      cmd.includes('खोजो') ||
      cmd.includes('ढूंढो') ||
      cmd.includes('शोधा')
    ) {
      const cleanTerm = cmd
        .replace(/search|find|show|for|खोजो|ढूंढो|शोधा|दिखाओ|दाखवा/gi, '')
        .trim();
      if (cleanTerm) {
        navigate(`/marketplace?search=${encodeURIComponent(cleanTerm)}`);
        speakResponse(lang === 'hi' ? `${cleanTerm} खोज रहा हूँ` : lang === 'mr' ? `${cleanTerm} शोधत आहे` : `Searching for ${cleanTerm}`);
        return;
      }
    }

    // ==========================================
    // 10. HELP / COMMANDS LIST
    // ==========================================
    if (
      cmd.includes('help') ||
      cmd.includes('command') ||
      cmd.includes('मदद') ||
      cmd.includes('सहायता') ||
      cmd.includes('मदत') ||
      cmd.includes('काय करू शकतो')
    ) {
      setShowHelpModal(true);
      speakResponse(lang === 'hi' ? 'उपलब्ध आदेश स्क्रीन पर दिखाए जा रहे हैं' : lang === 'mr' ? 'उपलब्ध आज्ञा पडद्यावर दाखवल्या आहेत' : 'Here are the available voice commands');
      return;
    }

    // Fallback unknown command
    if (lang === 'hi') {
      speakResponse('माफ़ कीजिए, मैं समझ नहीं पाया। मदद के लिए "मदद" बोलें।');
    } else if (lang === 'mr') {
      speakResponse('माफ करा, मला समजले नाही. मदतीसाठी "मदत" म्हणा.');
    } else {
      speakResponse("Sorry, I didn't recognize that command. Say 'help' to see all commands.");
    }
  }, [isAuthenticated, isFarmer, navigate, speakResponse, speechLanguage]);

  // Sync recognition language whenever i18n language changes
  useEffect(() => {
    const langCode = getSpeechLangCode(i18n.language);
    setSpeechLanguage(langCode);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = langCode;
      } catch (e) {}
    }
  }, [i18n.language, getSpeechLangCode]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = getSpeechLangCode(i18n.language);

    recognition.onstart = () => {
      setIsListening(true);
      isStartingRef.current = false;
      setLastErrorMsg(null);
    };

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        processCommand(speechResult);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      isStartingRef.current = false;
    };

    recognition.onerror = (event) => {
      console.warn('[Voice AI] Speech recognition error event:', event.error);
      setIsListening(false);
      isStartingRef.current = false;

      let userFriendlyMessage = '';

      switch (event.error) {
        case 'network':
          userFriendlyMessage = t('voice.networkError', 'Speech recognition service could not be reached. Please check your internet connection or try typing your command.');
          break;
        case 'not-allowed':
        case 'permission-denied':
          userFriendlyMessage = t('voice.permissionDenied', 'Microphone permission was denied. Please allow microphone access in your browser settings to use voice commands.');
          break;
        case 'no-speech':
          userFriendlyMessage = t('voice.noSpeech', 'No speech detected. Please speak closer to your microphone.');
          break;
        case 'audio-capture':
          userFriendlyMessage = t('voice.audioError', 'No microphone hardware found. Please connect a working microphone.');
          break;
        case 'language-not-supported':
          userFriendlyMessage = 'Selected voice language is not supported by your browser engine. Falling back to English.';
          try {
            recognition.lang = 'en-IN';
          } catch (e) {}
          break;
        case 'aborted':
          // Silently ignore aborted actions triggered by user toggle
          return;
        default:
          userFriendlyMessage = t('voice.genericError', { error: event.error, defaultValue: `Voice error: ${event.error}` });
      }

      setLastErrorMsg(userFriendlyMessage);
      toast.error(userFriendlyMessage, { duration: 5000 });
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [i18n.language, getSpeechLangCode, processCommand, t]);

  const toggleListening = () => {
    if (!isSupported) {
      toast.error(t('voice.notSupported', 'Voice commands are not supported in this browser. Try Google Chrome or Edge.'));
      setShowHelpModal(true);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
      setIsListening(false);
    } else {
      if (isStartingRef.current) return;
      isStartingRef.current = true;
      setTranscript('');
      setLastErrorMsg(null);

      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechLanguage;
          recognitionRef.current.start();
        }
      } catch (error) {
        isStartingRef.current = false;
        console.error('Failed to start speech recognition:', error);
        // If already started or transitioning, abort and retry
        try {
          recognitionRef.current?.abort();
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }, 200);
        } catch (e) {}
      }
    }
  };

  const handleManualCommandSubmit = (e) => {
    e.preventDefault();
    if (!manualCommandInput.trim()) return;
    const cmd = manualCommandInput.trim();
    setTranscript(cmd);
    setManualCommandInput('');
    processCommand(cmd);
  };

  const getLanguageLabel = () => {
    if (speechLanguage.startsWith('hi')) return 'हिन्दी (Hindi - hi-IN)';
    if (speechLanguage.startsWith('mr')) return 'मराठी (Marathi - mr-IN)';
    return 'English (India - en-IN)';
  };

  return (
    <>
      {/* Floating Voice Assistant Action */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        
        {/* Live Transcript / Feedback Pill */}
        {transcript && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200/80 p-3.5 max-w-xs animate-scale-up text-slate-800">
            <div className="flex items-center justify-between space-x-2 text-[11px] font-bold text-emerald-700 mb-1">
              <div className="flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{t('voice.heardCommand', 'Heard Command:')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{speechLanguage}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 capitalize">"{transcript}"</p>
          </div>
        )}

        {/* Listening Indicator Badge */}
        {isListening && (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>{t('voice.listening', 'Listening... Speak now')}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Help & Text Input Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-3 rounded-2xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-white shadow-lg border border-slate-200/80 transition-all duration-200 hover:scale-105"
            title="Voice Commands Guide & Manual Input"
            aria-label="Open voice commands guide"
          >
            <HelpCircle className="w-5 h-5 text-emerald-600" />
          </button>

          {/* Main Microphone Action Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 ${
              isListening
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30 ring-4 ring-rose-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 hover:shadow-emerald-600/40 ring-2 ring-emerald-500/20'
            }`}
            title={isListening ? 'Click to stop listening' : `Voice AI Assistant (${getLanguageLabel()})`}
            aria-label="Toggle voice recognition"
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 animate-bounce" />
                <span className="text-xs font-black tracking-wide pr-1">Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black tracking-wide hidden sm:inline">{t('voice.clickToSpeak', 'Voice AI')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Voice Commands Cheat Sheet & Manual Input Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Mic className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-heading">
                    {t('voice.assistant', 'Voice AI Assistant')}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-0.5">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>{getLanguageLabel()}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message banner if any occurred */}
            {lastErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{lastErrorMsg}</span>
              </div>
            )}

            {/* Manual Command Input Fallback */}
            <form onSubmit={handleManualCommandSubmit} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('voice.typeCommandPlaceholder', 'Type or Speak a Command')}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualCommandInput}
                  onChange={(e) => setManualCommandInput(e.target.value)}
                  placeholder="e.g., 'Show marketplace', 'बाजार दिखाओ', 'पीक जोडा'..."
                  className="input-field text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-2 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {t('voice.guideTip', 'Switch the application language in the navbar to speak in English, हिन्दी (Hindi), or मराठी (Marathi).')}
                </p>
              </div>

              {/* Sample Commands Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('voice.guideTitle', 'Supported Commands')}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-700 font-bold">🛒 Marketplace:</span> "Show marketplace" / "बाजार दिखाओ" / "बाजारपेठ दाखवा"
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-700 font-bold">🌾 Add Produce:</span> "Add crop" / "नई फसल जोड़ो" / "नवीन पीक जोडा"
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-700 font-bold">📦 My Orders:</span> "Show my orders" / "मेरे ऑर्डर दिखाओ" / "माझे ऑर्डर्स दाखवा"
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-700 font-bold">📍 Near Me:</span> "Nearby buyers" / "आसपास के खरीदार" / "जवळचे खरेदीदार"
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-700 font-bold">🥦 Category:</span> "Search vegetables" / "सब्जी खोजो" / "भाजीपाला शोधा"
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-700 font-bold">📊 Dashboard:</span> "Open dashboard" / "डैशबोर्ड" / "डॅशबोर्ड"
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false);
                  toggleListening();
                }}
                className="w-full btn-primary py-3 text-sm font-bold shadow-lg justify-center"
              >
                <Mic className="w-4 h-4 mr-2" />
                <span>Start Microphone Listening</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default VoiceCommands;
