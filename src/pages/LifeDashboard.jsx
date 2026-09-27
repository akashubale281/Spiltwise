import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  DollarSign,
  Fuel,
  Zap,
  TrendingUp,
  ArrowRight,
  Bot,
  Home,
  Target,
  Users,
  Shield,
  Palette,
  Utensils,
  Car,
  ChevronRight,
  Clock,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LifeDashboard({ onOpenAI, onOpenMultiAgent, onOpenThemes }) {
  const { user } = useAuth();
  const { formatAmount, activeTheme } = useTheme();
  const navigate = useNavigate();

  const briefingCards = [
    {
      id: 'debt',
      title: 'Money & Settlement Radar',
      desc: 'Rahul owes you ₹820 for Friday dinner. You owe Sam ₹350.',
      icon: DollarSign,
      actionText: '1-Tap UPI Settle',
      actionTo: '/settlements',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Action Needed'
    },
    {
      id: 'mobility',
      title: 'Fuel & Mobility Radar',
      desc: 'Indian Oil petrol station 2.1km ahead on Indiranagar 100ft Rd is ₹3/L cheaper.',
      icon: Fuel,
      actionText: 'View Mobility Radar',
      actionTo: '/hubs',
      color: 'from-amber-500 to-orange-600',
      badge: 'Smart Fuel'
    },
    {
      id: 'maid-payroll',
      title: 'Maid & Cook Payroll',
      desc: 'Shanti Bai & Ramesh Cook attendance updated. Edit working days & disburse salary via UPI.',
      icon: UserCheck,
      actionText: 'Open Maid Payroll',
      actionTo: '/maid',
      color: 'from-indigo-500 to-purple-600',
      badge: 'Payroll Ready'
    },
    {
      id: 'bill',
      title: 'Home Automation Alert',
      desc: 'Apartment BESCOM Electricity bill (₹2,400) is due today. Split 3 ways.',
      icon: Zap,
      actionText: 'View Home Hub',
      actionTo: '/home-hub',
      color: 'from-purple-500 to-indigo-600',
      badge: 'Due Today'
    },
    {
      id: 'goals-pot',
      title: 'Living Room 4K Smart TV Fund',
      desc: 'Flat pot at 70% (₹29,500 / ₹42,000). Save ₹750/flatmate this week to hit the festival discount!',
      icon: Target,
      actionText: 'View Dream Pot',
      actionTo: '/hubs',
      color: 'from-blue-600 to-indigo-800',
      badge: '₹12,500 Left'
    }
  ];

  const hubsList = [
    { name: 'Home Hub', icon: Home, to: '/home-hub', color: 'text-emerald-400', desc: 'Roommate OS, rent & chores' },
    { name: 'Maid & Staff', icon: UserCheck, to: '/maid', color: 'text-indigo-400', desc: 'Cook & maid attendance & payroll' },
    { name: 'Goals Hub', icon: Target, to: '/hubs', color: 'text-amber-400', desc: 'Shared savings countdown pots' },
    { name: 'Food Hub', icon: Utensils, to: '/hubs', color: 'text-orange-400', desc: 'Zomato vs Swiggy comparison' },
    { name: 'Mobility Hub', icon: Car, to: '/hubs', color: 'text-teal-400', desc: 'Uber vs Ola vs Rapido fares' },
    { name: 'Vault Hub', icon: Shield, to: '/hubs', color: 'text-slate-400', desc: 'Encrypted leases & invoices' }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Holographic Life Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#080d1a] via-[#10182b] to-[#0a1224] p-6 sm:p-8 text-white border border-cyan-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Holographic Life Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Life Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              One intelligent cockpit managing your shared expenses, grocery shopping, maid & cook payroll, roommate bills, and squad savings.
            </p>
          </div>

          {/* Multi-Agent Launch Button & Theme Switcher */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenMultiAgent}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition flex items-center space-x-2 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Multi-Agent AI Hub</span>
            </button>

            <button
              onClick={onOpenThemes}
              className="p-2.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition"
              title="Change Theme & Avatars"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Intelligent Daily Briefing Bento (6 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Life Overview & Intelligence
            </h3>
          </div>
          <span className="text-xs font-semibold text-cyan-500 font-mono">
            6 Alerts Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {briefingCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.id}
                className="glass-card rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center font-bold shadow-xs`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <Link
                  to={card.actionTo}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-500 dark:bg-slate-800 dark:hover:bg-cyan-500 text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10 Specialized Hubs Quick Launchpad */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              SplitVerse Specialized Super Hubs
            </h3>
            <p className="text-xs text-slate-400">
              Your comprehensive ecosystem for living, sharing, and saving
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-400">
            10 Hubs Connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {hubsList.map((hub, idx) => {
            const IconComp = hub.icon;
            return (
              <Link
                key={idx}
                to={hub.to}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 hover:scale-[1.02] transition duration-200 space-y-2 group block"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <IconComp className={`w-5 h-5 ${hub.color}`} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-cyan-400 transition">
                    {hub.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {hub.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
