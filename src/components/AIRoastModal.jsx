import React, { useState } from 'react';
import { Flame, Sparkles, RefreshCw, X, Laugh, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROASTS = [
  "You spent ₹4,200 on Swiggy and Zomato this month. Your kitchen stove is currently filing for emotional abandonment.",
  "You bought coffee 18 times this week. At this point, Starbucks should give you board voting rights.",
  "You paid for the group Uber and said 'just pay me whenever'. That was 3 months ago. That money belongs to history now.",
  "Your gym membership renewed for ₹2,500. The only workout happening is your wallet losing weight.",
  "You settled your ₹45 chai debt 3 seconds after the bill came. True UPI Ninja energy.",
  "You spent ₹3,800 on weekend party snacks. Your doctor and your bank account are holding an intervention tomorrow."
];

export default function AIRoastModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [currentRoast, setCurrentRoast] = useState(ROASTS[0]);

  if (!isOpen) return null;

  const handleNextRoast = () => {
    const next = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    setCurrentRoast(next);
  };

  const handleShare = () => {
    const text = `🔥 SplitVerse AI just roasted me:\n"${currentRoast}"\n#SplitVerseAI`;
    if (navigator.share) {
      navigator.share({ title: 'SplitVerse AI Roast', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Roast copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f1422] rounded-3xl border border-orange-500/30 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>AI Roast Mode</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          The Financial Reality Check
        </h3>

        {/* Roast speech card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border border-orange-500/20 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
          "{currentRoast}"
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={handleNextRoast}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Roast Me Again</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition flex items-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Roast</span>
          </button>
        </div>
      </div>
    </div>
  );
}
