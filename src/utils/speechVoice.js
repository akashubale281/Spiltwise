// Speech Recognition and Text-To-Speech (TTS) Voice Engine for SplitVerse AI

export const VOICE_PERSONAS = [
  {
    id: 'zara',
    name: 'Zara (Indian English - Warm & Natural)',
    lang: 'en-IN',
    gender: 'female',
    pitch: 1.1,
    rate: 1.02,
    avatar: '🌸',
    desc: 'Friendly, clear Indian female voice'
  },
  {
    id: 'aryan',
    name: 'Aryan (Indian English - Crisp Fintech)',
    lang: 'en-IN',
    gender: 'male',
    pitch: 0.95,
    rate: 1.0,
    avatar: '⚡',
    desc: 'Authoritative, sharp Indian male advisor'
  },
  {
    id: 'nova',
    name: 'Nova (Futuristic AI - Cyberpunk Synth)',
    lang: 'en-US',
    gender: 'female',
    pitch: 1.25,
    rate: 1.12,
    avatar: '🤖',
    desc: 'Ultra-fast, futuristic cyber assistant'
  },
  {
    id: 'marcus',
    name: 'Marcus (British English - Sophisticated)',
    lang: 'en-GB',
    gender: 'male',
    pitch: 0.85,
    rate: 0.95,
    avatar: '🎩',
    desc: 'Deep, polite British executive tone'
  }
];

// Clean markdown characters before speech synthesis
const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks
    .replace(/\*(.*?)\*/g, '$1')     // remove italics
    .replace(/#{1,6}\s+/g, '')       // remove markdown headers
    .replace(/₹(\d+)/g, '$1 rupees') // pronounce currency cleanly
    .replace(/`([^`]+)`/g, '$1')     // remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove markdown links
    .replace(/[#*_~>]/g, '')
    .trim();
};

export const speakText = (text, personaId = 'zara', onEndCallback) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  const persona = VOICE_PERSONAS.find((p) => p.id === personaId) || VOICE_PERSONAS[0];

  utterance.pitch = persona.pitch;
  utterance.rate = persona.rate;

  // Attempt to match best available voice in browser
  const availableVoices = window.speechSynthesis.getVoices();
  if (availableVoices && availableVoices.length > 0) {
    let matchedVoice = null;
    if (persona.lang === 'en-IN') {
      matchedVoice = availableVoices.find(
        (v) =>
          v.lang.includes('en-IN') ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('ravi')
      );
    } else if (persona.lang === 'en-GB') {
      matchedVoice = availableVoices.find(
        (v) =>
          v.lang.includes('en-GB') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('uk')
      );
    }

    if (!matchedVoice) {
      matchedVoice = availableVoices.find((v) => v.lang.startsWith('en'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

// Speech Recognition helper
export const createSpeechRecognizer = ({ onResult, onError, onEnd }) => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-IN'; // Indian English default, also recognizes general English

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    onError?.(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  return recognition;
};
