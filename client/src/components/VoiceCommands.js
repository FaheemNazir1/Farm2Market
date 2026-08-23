import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, isFarmer, isBuyer } = useAuth();

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Default to English India

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.success('Listening... Speak a command');
      };

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        setTranscript(speechResult);
        processCommand(speechResult);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processCommand = (command) => {
    console.log('Processing command:', command);

    // English commands
    if (command.includes('go to marketplace') || command.includes('show marketplace') || command.includes('open marketplace')) {
      navigate('/marketplace');
      speakResponse('Opening marketplace');
    } else if (command.includes('go to dashboard') || command.includes('show dashboard') || command.includes('open dashboard')) {
      if (isAuthenticated) {
        navigate('/dashboard');
        speakResponse('Opening dashboard');
      } else {
        speakResponse('Please login first');
      }
    } else if (command.includes('add crop') || command.includes('new crop') || command.includes('create crop')) {
      if (isAuthenticated && isFarmer) {
        navigate('/crops/new');
        speakResponse('Opening add crop page');
      } else if (!isAuthenticated) {
        speakResponse('Please login as a farmer first');
      } else {
        speakResponse('Only farmers can add crops');
      }
    } else if (command.includes('go to cart') || command.includes('show cart') || command.includes('open cart')) {
      if (isAuthenticated && isBuyer) {
        navigate('/cart');
        speakResponse('Opening cart');
      } else {
        speakResponse('Please login as a buyer to view cart');
      }
    } else if (command.includes('go to orders') || command.includes('show orders') || command.includes('my orders')) {
      if (isAuthenticated) {
        navigate('/orders');
        speakResponse('Opening orders');
      } else {
        speakResponse('Please login to view orders');
      }
    } else if (command.includes('go to profile') || command.includes('show profile') || command.includes('my profile')) {
      if (isAuthenticated) {
        navigate('/profile');
        speakResponse('Opening profile');
      } else {
        speakResponse('Please login to view profile');
      }
    } else if (command.includes('go to home') || command.includes('show home') || command.includes('home page')) {
      navigate('/');
      speakResponse('Going to home page');
    } else if (command.includes('search') || command.includes('find')) {
      if (command.includes('vegetables') || command.includes('vegetable')) {
        navigate('/marketplace?category=Vegetables');
        speakResponse('Searching for vegetables');
      } else if (command.includes('fruits') || command.includes('fruit')) {
        navigate('/marketplace?category=Fruits');
        speakResponse('Searching for fruits');
      } else if (command.includes('cereals') || command.includes('cereal')) {
        navigate('/marketplace?category=Cereals');
        speakResponse('Searching for cereals');
      } else {
        navigate('/marketplace?search=' + encodeURIComponent(command.replace('search', '').replace('find', '').trim()));
        speakResponse('Searching for ' + command.replace('search', '').replace('find', '').trim());
      }
    } else if (command.includes('help') || command.includes('commands') || command.includes('what can you do')) {
      showHelp();
    } else if (command.includes('switch to hindi') || command.includes('hindi mode')) {
      switchToHindi();
    } else if (command.includes('switch to english') || command.includes('english mode')) {
      switchToEnglish();
    }

    // Hindi commands
    else if (command.includes('मार्केटप्लेस') || command.includes('बाजार') || command.includes('जाओ बाजार')) {
      navigate('/marketplace');
      speakResponse('मार्केटप्लेस खोल रहा हूं');
    } else if (command.includes('डैशबोर्ड') || command.includes('डैशबोर्ड जाओ')) {
      if (isAuthenticated) {
        navigate('/dashboard');
        speakResponse('डैशबोर्ड खोल रहा हूं');
      } else {
        speakResponse('कृपया पहले लॉगिन करें');
      }
    } else if (command.includes('नई फसल') || command.includes('फसल जोड़') || command.includes('नया उत्पाद')) {
      if (isAuthenticated && isFarmer) {
        navigate('/crops/new');
        speakResponse('नई फसल जोड़ने का पेज खोल रहा हूं');
      } else {
        speakResponse('कृपया किसान के रूप में लॉगिन करें');
      }
    } else if (command.includes('कार्ट') || command.includes('टोकरी') || command.includes('मेरी टोकरी')) {
      if (isAuthenticated && isBuyer) {
        navigate('/cart');
        speakResponse('कार्ट खोल रहा हूं');
      } else {
        speakResponse('कृपया खरीदार के रूप में लॉगिन करें');
      }
    } else if (command.includes('ऑर्डर') || command.includes('मेरे ऑर्डर')) {
      if (isAuthenticated) {
        navigate('/orders');
        speakResponse('ऑर्डर खोल रहा हूं');
      } else {
        speakResponse('कृपया लॉगिन करें');
      }
    } else if (command.includes('प्रोफाइल') || command.includes('मेरी प्रोफाइल')) {
      if (isAuthenticated) {
        navigate('/profile');
        speakResponse('प्रोफाइल खोल रहा हूं');
      } else {
        speakResponse('कृपया लॉगिन करें');
      }
    } else if (command.includes('होम') || command.includes('मुख्य पेज')) {
      navigate('/');
      speakResponse('होम पेज पर जा रहा हूं');
    } else if (command.includes('खोज') || command.includes('ढूंढ')) {
      if (command.includes('सब्जी') || command.includes('सब्जियां')) {
        navigate('/marketplace?category=Vegetables');
        speakResponse('सब्जियां खोज रहा हूं');
      } else if (command.includes('फल') || command.includes('फलों')) {
        navigate('/marketplace?category=Fruits');
        speakResponse('फल खोज रहा हूं');
      } else if (command.includes('अनाज') || command.includes('अनाजों')) {
        navigate('/marketplace?category=Cereals');
        speakResponse('अनाज खोज रहा हूं');
      } else {
        const searchTerm = command.replace('खोज', '').replace('ढूंढ', '').trim();
        navigate('/marketplace?search=' + encodeURIComponent(searchTerm));
        speakResponse(searchTerm + ' खोज रहा हूं');
      }
    } else if (command.includes('मदद') || command.includes('कमांड') || command.includes('क्या कर सकते हो')) {
      showHelp();
    } else if (command.includes('अंग्रेजी') || command.includes('english')) {
      switchToEnglish();
    } else {
      speakResponse('Sorry, I didn\'t understand that command. Say "help" for available commands.');
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = recognitionRef.current?.lang || 'en-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1;

      // Try to use a female voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.lang.startsWith(utterance.lang.split('-')[0]) &&
        voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang === utterance.lang) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  const showHelp = () => {
    const helpText = `
      Available voice commands:
      English: go to marketplace, add crop, go to dashboard, go to cart, search vegetables/fruits/cereals, help
      Hindi: बाजार जाओ, नई फसल जोड़ो, डैशबोर्ड जाओ, कार्ट खोलो, सब्जी खोजो, मदद
    `;
    speakResponse('Here are the available commands. Check the console for details.');
    console.log(helpText);
  };

  const switchToHindi = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'hi-IN';
      speakResponse('हिंदी मोड में स्विच किया गया है');
      toast.success('Switched to Hindi voice commands');
    }
  };

  const switchToEnglish = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'en-IN';
      speakResponse('Switched to English voice commands');
      toast.success('Switched to English voice commands');
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {transcript && (
        <div className="mb-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-100 p-3.5 max-w-xs animate-fade-in text-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Heard Command:</span>
          </div>
          <p className="text-sm font-bold text-slate-900 capitalize">"{transcript}"</p>
        </div>
      )}

      <button
        onClick={toggleListening}
        className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isListening
            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30 animate-pulse'
            : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 hover:shadow-glow'
        }`}
        title={isListening ? 'Listening... Click to stop' : 'Voice Assistant (Hindi / English)'}
        aria-label="Toggle voice commands"
      >
        {isListening ? (
          <div className="flex items-center space-x-2">
            <MicOff className="w-5 h-5 animate-bounce" />
            <span className="text-xs font-bold pr-1">Listening...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span className="text-xs font-bold pr-1 hidden sm:inline">Voice AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default VoiceCommands;
