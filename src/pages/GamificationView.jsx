import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Flame,
  Shield,
  Award,
  Crown,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const BADGES = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    icon: '⚡',
    desc: 'Settled debt within 15 minutes of bill receipt',
    unlocked: true,
    category: 'Speed',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'zero-debt',
    name: 'Zero Debt Hero',
    icon: '🛡️',
    desc: 'Maintained 0 debt across all groups for 7 days',
    unlocked: true,
    category: 'Reliability',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'upi-ninja',
    name: 'UPI Ninja',
    icon: '🥷',
    desc: 'Completed 10 seamless 1-tap UPI QR settlements',
    unlocked: true,
    category: 'Fintech',
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'trip-king',
    name: 'Trip King',
    icon: '👑',
    desc: 'Tracked and settled a multi-destination road trip',
    unlocked: true,
    category: 'Travel',
    color: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'receipt-master',
    name: 'Receipt Master',
    icon: '📜',
    desc: 'Itemized 5 receipts with Gemini Vision AI',
    unlocked: true,
    category: 'AI Tool',
    color: 'from-rose-400 to-pink-500'
  },
  {
    id: 'bill-boss',
    name: 'Bill Boss',
    icon: '💼',
    desc: 'Organized and split shared expenses over ₹50,000',
    unlocked: false,
    progress: 78,
    category: 'Leadership',
    color: 'from-slate-400 to-slate-600'
  }
];

const LEADERBOARD = [
  { rank: 1, name: 'Alex M.', xp: 2850, streak: 21, role: 'Fastest Settler', avatar: 'A', bg: 'from-amber-500 to-yellow-600' },
  { rank: 2, name: 'You', xp: 2150, streak: 14, role: 'Wallet Warrior', avatar: 'Y', bg: 'from-cyan-500 to-blue-600' },
  { rank: 3, name: 'Sam K.', xp: 1780, streak: 12, role: 'Food Monster', avatar: 'S', bg: 'from-slate-400 to-slate-600' },
  { rank: 4, name: 'Priya R.', xp: 1420, streak: 8, role: 'Budget Ninja', avatar: 'P', bg: 'from-purple-500 to-pink-600' }
];

export default function GamificationView() {
  const { user } = useAuth();
  const [celebrating, setCelebrating] = useState(false);

  const triggerConfetti = () => {
    setCelebrating(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCelebrating(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header with Level Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Fintech Gamification & XP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              SplitVerse Reputation Tier
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Earn XP by settling debts instantly, scanning receipts, and maintaining zero-debt streaks.
            </p>
          </div>

          <button
            onClick={triggerConfetti}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition flex items-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Streak 🔥</span>
          </button>
        </div>
      </div>

      {/* Level & Streak Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level Progress */}
        <div className="glass-card rounded-3xl p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-cyan-500/20">
                Lvl 4
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Fintech Prodigy
                </h3>
                <span className="text-xs text-slate-400">
                  Next Rank: Level 5 (Fintech Master)
                </span>
              </div>
            </div>
            <span className="text-xs font-black font-mono text-cyan-400">
              2,150 / 3,000 XP
            </span>
          </div>

          {/* XP Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: '71%' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>850 XP needed for next milestone</span>
              <span>71% Complete</span>
            </div>
          </div>
        </div>

        {/* Payment Streak Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Settlement Streak
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black font-mono text-orange-500">
              14 Days 🔥
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Never delayed any payment past 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Badges Bento Grid */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Achievement Badges
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            5 / 6 Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                badge.unlocked
                  ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center text-xl shadow-xs`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {badge.name}
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {badge.category}
                    </span>
                  </div>
                </div>

                {badge.unlocked ? (
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1 rounded-full bg-slate-500/10 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                {badge.desc}
              </p>

              {!badge.unlocked && badge.progress && (
                <div className="mt-3 space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right">
                    {badge.progress}% completed
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Squad Leaderboard */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Monthly Friends Leaderboard
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 font-bold">
            September 2026 Cycle
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {LEADERBOARD.map((entry) => (
            <div
              key={entry.rank}
              className={`p-4 flex items-center justify-between transition ${
                entry.name === 'You'
                  ? 'bg-cyan-500/5 dark:bg-cyan-500/10'
                  : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-7 text-center font-black font-mono text-sm text-slate-400">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </div>
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${entry.bg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                >
                  {entry.avatar}
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                    {entry.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {entry.role} • {entry.streak}d streak
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black font-mono text-xs sm:text-sm text-cyan-500 block">
                  {entry.xp} XP
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Reputation
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
