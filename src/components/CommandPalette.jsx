import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Mic,
  Sparkles,
  Receipt,
  MessageSquare,
  Utensils,
  MapPin,
  Trophy,
  CreditCard,
  Flame,
  Calendar,
  Calculator,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Lock,
  X,
  ArrowRight,
  Palette,
  FileText,
  Home,
  Layers,
  Zap,
  Bot,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenVoice,
  onOpenAI,
  onOpenReceipt,
  onOpenManualBill,
  onOpenWhatsApp,
  onOpenRestaurantSplit,
  onOpenRoast,
  onOpenWrapped,
  onOpenLock,
  onOpenThemes,
  onOpenMultiAgent,
  onOpenAutoRules
}) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme, privacyMode, togglePrivacyMode } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'life-dashboard',
      name: 'Life Dashboard & Daily Holographic Radar',
      desc: 'Unified daily briefing: settlements, deals, fuel, chores, bills',
      icon: Sparkles,
      badge: 'Super App',
      color: 'from-blue-600 to-indigo-600',
      action: () => {
        onClose();
        navigate('/life');
      }
    },
    {
      id: 'create-bill',
      name: 'Create / Generate Bill Manually',
      desc: 'Generate itemized GST tax invoices, restaurant bills, and custom UPI QR codes',
      icon: FileText,
      badge: 'Bill Maker',
      color: 'from-cyan-500 to-blue-600',
      action: () => {
        onClose();
        onOpenManualBill?.();
      }
    },
    {
      id: 'home-hub',
      name: 'Roommate OS (Chore Wheel & Rent)',
      desc: 'Spin duty roulette, calculate electricity slab, domestic staff payroll',
      icon: Home,
      badge: 'Chores',
      color: 'from-emerald-500 to-teal-600',
      action: () => {
        onClose();
        navigate('/home-hub');
      }
    },
    {
      id: 'maid-payroll',
      name: 'Domestic Staff & Maid Payroll',
      desc: 'Manage attendance (20/25/30 days), leave cuts, and 1-tap UPI payouts',
      icon: UserCheck,
      badge: 'Payroll',
      color: 'from-amber-500 to-orange-600',
      action: () => {
        onClose();
        navigate('/maid');
      }
    },
    {
      id: 'specialized-hubs',
      name: 'Specialized Hubs (Goals, Vault, Arbitrage, Mobility)',
      desc: 'Dream savings pots, Encrypted vault, Swiggy vs Zomato arbitrage, Mobility radar',
      icon: Layers,
      badge: 'Ecosystem',
      color: 'from-amber-500 to-orange-600',
      action: () => {
        onClose();
        navigate('/hubs');
      }
    },
    {
      id: 'theme-studio',
      name: 'Theme Studio & Animated Avatars',
      desc: 'Switch to Cyberpunk, AMOLED Pitch Black, Glass, Luxury Gold, BMW Blue, Minimal',
      icon: Palette,
      badge: '6 Themes',
      color: 'from-purple-500 to-indigo-600',
      action: () => {
        onClose();
        onOpenThemes?.();
      }
    },
    {
      id: 'multi-agent',
      name: '5-Agent AI Command Center',
      desc: 'Money AI, Shopping AI, Housekeeper AI, Pantry AI, and Deal Hunter AI',
      icon: Bot,
      badge: 'Autonomous',
      color: 'from-indigo-600 to-cyan-600',
      action: () => {
        onClose();
        onOpenMultiAgent?.();
      }
    },
    {
      id: 'auto-rules',
      name: 'Smart Auto Rules & Recurring Engine',
      desc: 'Schedule Friday lunches, monthly rent, and power bill splits',
      icon: Zap,
      badge: 'Automation',
      color: 'from-amber-500 to-yellow-600',
      action: () => {
        onClose();
        onOpenAutoRules?.();
      }
    },
    {
      id: 'voice',
      name: 'Speak Expense (Voice Entry)',
      desc: 'Dictate expense using Web Speech AI',
      icon: Mic,
      badge: 'Voice AI',
      color: 'from-cyan-500 to-blue-500',
      action: () => {
        onClose();
        onOpenVoice?.();
      }
    },
    {
      id: 'ai-chat',
      name: 'AI Chat Accountant',
      desc: 'Ask who owes you, get predictions and budget insights',
      icon: Sparkles,
      badge: 'Assistant',
      color: 'from-purple-500 to-indigo-500',
      action: () => {
        onClose();
        onOpenAI?.();
      }
    },
    {
      id: 'receipt-ocr',
      name: 'AI Receipt Scanner (Gemini Vision)',
      desc: 'Scan paper receipt or bill to auto-extract items',
      icon: Receipt,
      badge: 'Vision',
      color: 'from-emerald-500 to-teal-500',
      action: () => {
        onClose();
        onOpenReceipt?.();
      }
    },
    {
      id: 'restaurant-split',
      name: 'Live Restaurant Dish Split',
      desc: 'Tap dishes and assign individual items to friends',
      icon: Utensils,
      badge: 'Fintech',
      color: 'from-amber-500 to-orange-500',
      action: () => {
        onClose();
        onOpenRestaurantSplit?.();
      }
    },
    {
      id: 'whatsapp-import',
      name: 'WhatsApp Expense Chat Import',
      desc: 'Paste chat log or screenshot to extract expenses',
      icon: MessageSquare,
      badge: 'Import',
      color: 'from-green-500 to-emerald-600',
      action: () => {
        onClose();
        onOpenWhatsApp?.();
      }
    },
    {
      id: 'maid-payroll',
      name: 'Maid & Cook Payroll Management',
      desc: 'Daily attendance sheet, leave salary deductions, and 1-tap UPI splits',
      icon: UserCheck,
      badge: 'Roommate OS',
      color: 'from-indigo-600 to-purple-600',
      action: () => {
        onClose();
        navigate('/maid');
      }
    },
    {
      id: 'gamification',
      name: 'XP, Badges & Monthly Leaderboard',
      desc: 'Check settlement streaks and unlock achievements',
      icon: Trophy,
      badge: 'Gamified',
      color: 'from-yellow-500 to-amber-600',
      action: () => {
        onClose();
        navigate('/leaderboard');
      }
    },
    {
      id: 'wrapped',
      name: 'Spotify Wrapped Settlement Story Card',
      desc: 'Generate viral Instagram story summary graphic',
      icon: Sparkles,
      badge: 'Viral',
      color: 'from-pink-500 to-rose-600',
      action: () => {
        onClose();
        onOpenWrapped?.();
      }
    },
    {
      id: 'roast',
      name: 'AI Spending Roast Mode',
      desc: 'Good-natured witty AI jokes about your spending',
      icon: Flame,
      badge: 'Humor',
      color: 'from-red-500 to-orange-600',
      action: () => {
        onClose();
        onOpenRoast?.();
      }
    },
    {
      id: 'recurring',
      name: 'Recurring Bills & Subscriptions',
      desc: 'Rent, maid salary, WiFi & Netflix with smart reminders',
      icon: Calendar,
      badge: 'Auto',
      color: 'from-indigo-500 to-blue-600',
      action: () => {
        onClose();
        navigate('/recurring');
      }
    },
    {
      id: 'privacy',
      name: privacyMode ? 'Show Balances (Disable Privacy Mode)' : 'Hide Balances (Privacy Mask ₹••••)',
      desc: 'Discreet mode for public browsing and crowded rooms',
      icon: privacyMode ? Eye : EyeOff,
      badge: 'Privacy',
      color: 'from-slate-500 to-slate-700',
      action: () => {
        togglePrivacyMode();
        onClose();
      }
    },
    {
      id: 'theme',
      name: isDark ? 'Switch to Normal (Light) Mode' : 'Switch to Dark Mode',
      desc: 'Toggle visual theme display',
      icon: isDark ? Sun : Moon,
      badge: 'Theme',
      color: 'from-slate-600 to-slate-800',
      action: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'pin-lock',
      name: 'Lock SplitVerse AI Now',
      desc: 'Protect current session with 4-digit PIN lock',
      icon: Lock,
      badge: 'Security',
      color: 'from-purple-600 to-indigo-800',
      action: () => {
        onClose();
        onOpenLock?.();
      }
    }
  ];

  const filteredActions = actions.filter((act) =>
    act.name.toLowerCase().includes(query.toLowerCase()) ||
    act.desc.toLowerCase().includes(query.toLowerCase()) ||
    act.badge.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <Search className="w-5 h-5 text-slate-400 dark:text-cyan-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search feature (e.g. voice, ai, maid, bill, upi)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching commands found.
            </div>
          ) : (
            filteredActions.map((act) => {
              const IconComp = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.action}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group text-left"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${act.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                          {act.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">ESC to close</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl + K</kbd>
          </div>
          <span className="text-cyan-500 font-medium">SplitVerse AI v2.5</span>
        </div>
      </div>
    </div>
  );
}
