import React, { useEffect } from 'react';
import {
  Sparkles,
  Share2,
  Download,
  X,
  Flame,
  CheckCircle2,
  Trophy,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SpotifyWrappedModal({ isOpen, onClose, analytics }) {
  const { user } = useAuth();
  const { formatAmount } = useTheme();

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSpent = analytics?.totalSpent || 28450;
  const debtSaved = Math.round(totalSpent * 0.18);
  const friendName = 'Alex';

  const handleShare = () => {
    const text = `🚀 My SplitVerse AI Wrapped 2026:\n💰 Total Tracked: ${formatAmount(totalSpent)}\n⚡ Saved via Debt Simplification: ${formatAmount(debtSaved)}\n🔥 Longest Streak: 14 Days\n👑 Personality: Wallet Warrior\nCheck out SplitVerse AI!`;
    if (navigator.share) {
      navigator.share({
        title: 'My SplitVerse AI Wrapped',
        text: text
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Wrapped summary copied to clipboard! Ready to share on WhatsApp & Instagram.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#111827] via-[#090e17] to-[#05070c] rounded-[36px] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden p-6 sm:p-8 text-white space-y-6">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-cyan-500/30 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SPLITVERSE REWIND 2026
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono">
            #FintechWrapped
          </span>
        </div>

        {/* Card Main Headline */}
        <div className="space-y-1">
          <span className="text-xs text-slate-400">Hey {user?.name || 'Friend'}, here is your</span>
          <h2 className="text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Money Story
          </h2>
        </div>

        {/* Visual Stats Bento */}
        <div className="space-y-3">
          {/* Big Stat */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Expenses Handled
            </span>
            <span className="text-3xl font-black font-mono text-cyan-400 mt-1 block">
              {formatAmount(totalSpent)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Across your groups and roadtrips
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Debt Saved</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-400 block">
                {formatAmount(debtSaved)}
              </span>
              <span className="text-[10px] text-slate-400 block">Fewer wire transfers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-1.5 text-amber-400 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Payment Streak</span>
              </div>
              <span className="text-lg font-black font-mono text-amber-300 block">
                14 Days
              </span>
              <span className="text-[10px] text-slate-400 block">Zero late settlements</span>
            </div>
          </div>

          {/* Persona Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                AI Financial Persona
              </span>
              <h4 className="font-extrabold text-base text-white">Wallet Warrior ⚡</h4>
              <p className="text-[11px] text-slate-300">
                You're the reliable friend who always pays upfront & settles fast.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xl shrink-0 ml-3">
              🛡️
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Story to Instagram</span>
          </button>
        </div>
      </div>
    </div>
  );
}
