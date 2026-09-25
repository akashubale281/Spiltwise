import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  Check,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function VoiceExpenseModal({ isOpen, onClose, onParsedExpense }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      parseSpeechToExpense(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  if (!isOpen) return null;

  const toggleListen = () => {
    if (!speechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setParsedData(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Start speech error:', err);
      }
    }
  };

  const parseSpeechToExpense = (text) => {
    if (!text) return;
    const lower = text.toLowerCase();

    // Extract amount
    let amount = '';
    const amountMatch =
      lower.match(/(?:rs\.?|inr|rupees|₹)\s*(\d+(?:\.\d+)?)/) ||
      lower.match(/(\d+(?:\.\d+)?)\s*(?:rs\.?|rupees|bucks|inr)/) ||
      lower.match(/(\d+(?:\.\d+)?)/);

    if (amountMatch) {
      amount = amountMatch[1];
    }

    // Extract category
    let category = 'General';
    if (
      lower.includes('dinner') ||
      lower.includes('lunch') ||
      lower.includes('food') ||
      lower.includes('pizza') ||
      lower.includes('burger') ||
      lower.includes('restaurant') ||
      lower.includes('cafe') ||
      lower.includes('coffee') ||
      lower.includes('drinks') ||
      lower.includes('swiggy') ||
      lower.includes('zomato')
    ) {
      category = 'Food';
    } else if (
      lower.includes('uber') ||
      lower.includes('ola') ||
      lower.includes('cab') ||
      lower.includes('petrol') ||
      lower.includes('fuel') ||
      lower.includes('toll') ||
      lower.includes('flight') ||
      lower.includes('train') ||
      lower.includes('travel')
    ) {
      category = 'Travel';
    } else if (
      lower.includes('grocery') ||
      lower.includes('groceries') ||
      lower.includes('supermarket') ||
      lower.includes('milk') ||
      lower.includes('vegetables')
    ) {
      category = 'Groceries';
    } else if (
      lower.includes('wifi') ||
      lower.includes('electricity') ||
      lower.includes('bill') ||
      lower.includes('gas') ||
      lower.includes('water')
    ) {
      category = 'Utilities';
    } else if (
      lower.includes('movie') ||
      lower.includes('netflix') ||
      lower.includes('game') ||
      lower.includes('party')
    ) {
      category = 'Entertainment';
    } else if (lower.includes('rent')) {
      category = 'Rent';
    }

    // Extract title
    let title = text.trim();
    if (title.length > 50) title = title.substring(0, 50);

    setParsedData({
      amount: amount || '0',
      category,
      description: title || 'Voice Expense',
      rawText: text
    });
  };

  const handleApplySample = (sample) => {
    setTranscript(sample);
    parseSpeechToExpense(sample);
  };

  const handleConfirm = () => {
    if (parsedData && onParsedExpense) {
      onParsedExpense(parsedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Voice Assistant</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Speak Your Expense
          </h3>
          <p className="text-xs text-slate-400">
            SplitVerse will extract the amount, category, and items automatically.
          </p>
        </div>

        {/* Microphone Button with Waveform */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
            )}
            <button
              onClick={toggleListen}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition shadow-xl ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-rose-500/30 scale-105'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:scale-105'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          {/* Sound wave bars */}
          {isListening && (
            <div className="flex items-center justify-center space-x-1.5 h-8">
              <span className="w-1 bg-cyan-400 rounded-full wave-bar" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-cyan-400 rounded-full wave-bar" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-cyan-400 rounded-full wave-bar" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-cyan-400 rounded-full wave-bar" style={{ animationDelay: '75ms' }} />
              <span className="w-1 bg-cyan-400 rounded-full wave-bar" style={{ animationDelay: '225ms' }} />
            </div>
          )}

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isListening
              ? 'Listening... Speak now!'
              : 'Tap microphone to start speaking'}
          </span>
        </div>

        {/* Live Transcript Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-left min-h-[70px] flex items-center">
          {transcript ? (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Your voice transcript will appear here in real-time...
            </p>
          )}
        </div>

        {/* Extracted Entity Preview */}
        {parsedData && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-500/30 text-left space-y-2 animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              AI Extracted Entity
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Amount:</span>
                <span className="font-extrabold text-base font-mono text-emerald-400">
                  ₹{parsedData.amount}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-bold text-cyan-300">
                  {parsedData.category}
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Description:</span>
              <span className="font-semibold text-white text-xs truncate block">
                {parsedData.description}
              </span>
            </div>
          </div>
        )}

        {/* Sample Voice Prompts */}
        <div className="space-y-2 text-left">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Or try these sample phrases:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'Paid 1250 for dinner with Alex and Sam',
              'Uber ride 450 to office',
              'Groceries 820 at Nature Basket',
              'Coffee and snacks 280 at Starbucks'
            ].map((sample, i) => (
              <button
                key={i}
                onClick={() => handleApplySample(sample)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsedData || !parsedData.amount || parsedData.amount === '0'}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 disabled:opacity-40 transition flex items-center space-x-1.5"
          >
            <span>Proceed to Add Expense</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
