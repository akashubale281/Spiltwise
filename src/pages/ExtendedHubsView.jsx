import React, { useState } from 'react';
import {
  Target,
  Users,
  Shield,
  Utensils,
  Car,
  GraduationCap,
  Sparkles,
  Plus,
  CheckCircle2,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ArrowRight,
  Flame,
  Award,
  Zap,
  DollarSign
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ExtendedHubsView({ initialTab = 'goals' }) {
  const { formatAmount } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // --- 1. GOALS HUB STATE ---
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Living Room 4K Smart TV 📺',
      target: 42000,
      saved: 29500,
      category: 'Home & Living',
      deadline: 'Diwali 2026',
      icon: '📺',
      color: 'from-amber-500 to-orange-500',
      nudge: 'Contribute ₹750/flatmate this week to hit festival discount!'
    },
    {
      id: 2,
      title: 'PlayStation 5 Pro 🎮',
      target: 55000,
      saved: 38000,
      category: 'Gadget',
      deadline: 'Nov 2026',
      icon: '🎮',
      color: 'from-blue-600 to-indigo-600',
      nudge: 'Deposit ₹500/week to unlock by Diwali!'
    },
    {
      id: 3,
      title: 'Emergency Rainy Day Fund ☔',
      target: 100000,
      saved: 74000,
      category: 'Security',
      deadline: 'Ongoing',
      icon: '🛡️',
      color: 'from-emerald-600 to-teal-600',
      nudge: 'Current reserve covers 2.8 months of living expenses.'
    }
  ]);

  // --- 2. VAULT HUB (DOCUMENTS & PASSWORDS) ---
  const [vaultDocs, setVaultDocs] = useState([
    {
      id: 1,
      title: 'Apartment Registered Rental Agreement',
      category: 'Legal',
      dateAdded: '2026-01-15',
      access: 'Flatmates Only',
      size: '2.4 MB (PDF)'
    },
    {
      id: 2,
      title: 'Living Room Wi-Fi Credentials',
      category: 'Utility',
      dateAdded: '2026-02-01',
      access: 'Flatmates Only',
      secretValue: 'SplitVerse@Turbo5G#2026'
    },
    {
      id: 3,
      title: 'Landlord PAN & Bank Mandate',
      category: 'Tax & HRA',
      dateAdded: '2026-03-10',
      access: 'Admin Only',
      size: '1.1 MB (PDF)'
    }
  ]);
  const [showSecret, setShowSecret] = useState({});

  // --- 5. FOOD ARBITRAGE (ZOMATO VS SWIGGY) ---
  const [foodDeals, setFoodDeals] = useState([
    {
      id: 1,
      restaurant: 'Meghana Foods (Indiranagar)',
      dish: 'Special Chicken Biryani + Paneer 65',
      swiggyPrice: 385,
      zomatoPrice: 340,
      cheaperOn: 'Zomato',
      diff: 45,
      promoCode: 'ZOMATOFEAST'
    },
    {
      id: 2,
      restaurant: 'Third Wave Coffee',
      dish: 'Iced Sea Salt Mocha + Almond Croissant',
      swiggyPrice: 420,
      zomatoPrice: 465,
      cheaperOn: 'Swiggy',
      diff: 45,
      promoCode: 'SWIGGYIT'
    },
    {
      id: 3,
      restaurant: 'Truffles Burger Hub',
      dish: 'All American Cheese Burger + Fries',
      swiggyPrice: 310,
      zomatoPrice: 310,
      cheaperOn: 'Tie',
      diff: 0,
      promoCode: 'FLAT20'
    }
  ]);

  // --- 6. MOBILITY HUB (RIDE FARE COMPARE) ---
  const [rides, setRides] = useState([
    { app: 'Uber Premier', time: '3 mins away', fare: 260, surge: false, icon: '🚗' },
    { app: 'Rapido Auto', time: '1 min away', fare: 110, surge: false, icon: '🛺', recommended: true },
    { app: 'Ola Mini', time: '6 mins away', fare: 295, surge: true, surgeText: '1.2x Peak', icon: '🚕' },
    { app: 'Namma Yatri', time: '4 mins away', fare: 125, surge: false, icon: '🛺' }
  ]);

  // --- 7. STUDENT HUB (CAMPUS LIFE) ---
  const [studentStats, setStudentStats] = useState({
    semester: '6th Semester (B.Tech CS)',
    cgpa: 8.74,
    messFeeShare: 3200,
    projectFund: 1800,
    festTickets: 600,
    funCorrelation: 'High study coffee spending correlates with +0.4 CGPA bump! ☕📈'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
      {/* Header Hub Navigator */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SplitVerse Specialized Life Hubs
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ecosystem Control Deck
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Goals & Pots, Encrypted Vault, Swiggy vs Zomato Arbitrage, Mobility Radar, and Campus Edition.
            </p>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 no-scrollbar">
          {[
            { id: 'goals', label: 'Goals & Pots', icon: Target },
            { id: 'vault', label: 'Encrypted Vault', icon: Shield },
            { id: 'food', label: 'Food Arbitrage', icon: Utensils },
            { id: 'mobility', label: 'Mobility Radar', icon: Car },
            { id: 'student', label: 'Student Edition', icon: GraduationCap }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 1. GOALS HUB --- */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🎯</span> Shared & Personal Savings Pots
              </h2>
              <p className="text-xs text-slate-400">Micro-saving nudges linked to everyday spending.</p>
            </div>
            <button
              onClick={() => alert('New Savings Pot Creator opened')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
            >
              <Plus className="w-4 h-4" /> Create Dream Pot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map(goal => {
              const progressPct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
              return (
                <div
                  key={goal.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{goal.icon}</span>
                        <div>
                          <h3 className="font-bold text-base text-white">{goal.title}</h3>
                          <span className="text-xs text-slate-400">{goal.category} • Due {goal.deadline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-extrabold text-indigo-400">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-300 font-medium pt-1">
                        <span>{formatAmount(goal.saved)}</span>
                        <span className="text-slate-500">Target: {formatAmount(goal.target)}</span>
                      </div>
                    </div>

                    {/* Micro-saving Nudge */}
                    <div className="mt-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{goal.nudge}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const deposit = 500;
                      setGoals(prev =>
                        prev.map(g => (g.id === goal.id ? { ...g, saved: g.saved + deposit } : g))
                      );
                      alert(`Deposited ${formatAmount(deposit)} into "${goal.title}"!`);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    + Deposit ₹500 from Spare Change
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- 2. VAULT HUB --- */}
      {activeTab === 'vault' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔐</span> Flatmate Encrypted Document Vault
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end encrypted storage for lease agreements, Wi-Fi keys, and appliance receipts.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AES-256-GCM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {vaultDocs.map(doc => {
              const isPassword = !!doc.secretValue;
              const isVisible = showSecret[doc.id];

              return (
                <div
                  key={doc.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700">
                        {doc.category}
                      </span>
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <h3 className="text-sm font-bold text-white mt-3">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Added on {doc.dateAdded}</p>

                    {isPassword ? (
                      <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                        <span className="font-mono text-xs text-white">
                          {isVisible ? doc.secretValue : '••••••••••••••••'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowSecret(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(doc.secretValue);
                              alert('Copied Wi-Fi password to clipboard!');
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
                        <span>📄 File size: {doc.size}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => alert(`Accessing verified secure document: ${doc.title}`)}
                    className="w-full mt-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    View Decrypted File
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- 5. FOOD ARBITRAGE (ZOMATO VS SWIGGY) --- */}
      {activeTab === 'food' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍽️</span> Swiggy vs Zomato Real-Time Arbitrage
              </h2>
              <p className="text-xs text-slate-400">
                AI analyzes item prices, platform fees, and coupon codes to find the cheapest order.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Live Price Crawler
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {foodDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-white">{deal.restaurant}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{deal.dish}</p>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                    <div className={`p-3 rounded-2xl border ${deal.cheaperOn === 'Swiggy' ? 'bg-orange-500/10 border-orange-500/30 font-bold' : 'bg-slate-800/40 border-slate-700/50'}`}>
                      <div className="text-[10px] text-orange-400 font-bold uppercase">Swiggy</div>
                      <div className="text-base text-white mt-1">{formatAmount(deal.swiggyPrice)}</div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${deal.cheaperOn === 'Zomato' ? 'bg-rose-500/10 border-rose-500/30 font-bold' : 'bg-slate-800/40 border-slate-700/50'}`}>
                      <div className="text-[10px] text-rose-400 font-bold uppercase">Zomato</div>
                      <div className="text-base text-white mt-1">{formatAmount(deal.zomatoPrice)}</div>
                    </div>
                  </div>

                  {deal.diff > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-xs font-bold text-emerald-400">
                        ⚡ Save {formatAmount(deal.diff)} on {deal.cheaperOn}!
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Use Code: {deal.promoCode}</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => alert(`Ordering from ${deal.cheaperOn} and splitting bill with roommates!`)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white transition-all shadow"
                >
                  Order on {deal.cheaperOn} & Split
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 6. MOBILITY HUB --- */}
      {activeTab === 'mobility' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🚕</span> Multi-App Mobility Radar
              </h2>
              <p className="text-xs text-slate-400">
                Live price & surge comparison across Uber, Ola, Rapido, and Namma Yatri.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rides.map((ride, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border backdrop-blur-xl flex flex-col justify-between space-y-4 ${
                  ride.recommended
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{ride.icon}</span>
                    {ride.recommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Best Value
                      </span>
                    )}
                    {ride.surge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {ride.surgeText}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white mt-3">{ride.app}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ride.time}</p>
                  <div className="text-xl font-extrabold text-white mt-3">{formatAmount(ride.fare)}</div>
                </div>

                <button
                  onClick={() => alert(`Booking ${ride.app} for ${formatAmount(ride.fare)}...`)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    ride.recommended
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Book Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 7. STUDENT HUB --- */}
      {activeTab === 'student' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🎓</span> College Campus & Hostel Edition
              </h2>
              <p className="text-xs text-slate-400">
                Semester mess splits, printout funds, project hardware costs, and study habits.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {studentStats.semester}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
              <span className="text-xs text-slate-400">Current CGPA</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">{studentStats.cgpa}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
              <span className="text-xs text-slate-400">Hostel Mess Dues</span>
              <div className="text-xl font-bold text-white mt-1">{formatAmount(studentStats.messFeeShare)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
              <span className="text-xs text-slate-400">Capstone Project Fund</span>
              <div className="text-xl font-bold text-white mt-1">{formatAmount(studentStats.projectFund)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center">
              <span className="text-xs text-slate-400">College Fest Passes</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{formatAmount(studentStats.festTickets)}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-xs text-indigo-300 leading-relaxed">
              <strong>SplitVerse Student Insight:</strong> {studentStats.funCorrelation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
