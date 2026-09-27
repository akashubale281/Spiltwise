import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  BarChart3,
  UserCheck,
  PlusCircle,
  Hash,
  Calculator,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Trophy,
  Sparkles,
  Home,
  Layers,
  Palette,
  Bot,
  Zap,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({
  onOpenNewGroup,
  onOpenJoinGroup,
  onOpenCalculator,
  onOpenManualBill,
  onOpenThemes,
  onOpenMultiAgent,
  onOpenAutoRules
}) {
  const [groups, setGroups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const { formatAmount } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [grpRes, anaRes] = await Promise.all([
          api.getMyGroups(),
          api.getDashboardAnalytics()
        ]);
        if (grpRes.success) setGroups(grpRes.groups || []);
        if (anaRes.success) setAnalytics(anaRes.analytics || null);
      } catch (err) {
        // Silently handle if not logged in
      }
    };
    loadSidebarData();
  }, []);

  const superAppLinks = [
    { to: '/life', label: 'Life Dashboard', icon: Sparkles, badge: 'AI Hub' },
    { to: '/home-hub', label: 'Roommate OS', icon: Home, badge: 'Chores' },
    { to: '/hubs', label: 'Specialized Hubs', icon: Layers, badge: 'Pots' }
  ];

  const coreLinks = [
    { to: '/dashboard', label: 'Expense Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'All Expenses', icon: ReceiptText },
    { to: '/maid', label: 'Maid & Cook Payroll', icon: UserCheck },
    { to: '/recurring', label: 'Recurring Bills', icon: Calendar },
    { to: '/leaderboard', label: 'Reputation & XP', icon: Trophy },
    { to: '/settlements', label: 'Settlements & UPI', icon: CreditCard },
    { to: '/reports', label: 'Reports & Export', icon: BarChart3 },
    { to: '/profile', label: 'Account Profile', icon: UserCheck }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 glass-panel min-h-[calc(100vh-4rem)] p-4 space-y-4 overflow-y-auto">
      {/* Quick Net Balance Card */}
      {analytics && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1220] to-[#12192c] text-white border border-slate-700/50 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Net Balance
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span
              className={`text-xl font-black font-mono ${
                analytics.netBalance > 0
                  ? 'text-emerald-400'
                  : analytics.netBalance < 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {analytics.netBalance > 0
                ? `+${formatAmount(analytics.netBalance)}`
                : analytics.netBalance < 0
                ? `-${formatAmount(Math.abs(analytics.netBalance))}`
                : formatAmount(0)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2.5 pt-2 border-t border-slate-700/60">
            <span className="flex items-center space-x-1 text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>{formatAmount(analytics.youAreOwed)}</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <TrendingDown className="w-3 h-3" />
              <span>{formatAmount(analytics.youOwe)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Super App Ecosystem Navigation */}
      <nav className="space-y-1">
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Super App Hubs
        </span>
        {superAppLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {item.badge}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Core Splitwise Menu */}
      <nav className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5 block">
          Finance & Groups
        </span>
        {coreLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Groups List */}
      <div className="flex-1 flex flex-col space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Your Groups ({groups.length})
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenJoinGroup}
              title="Join with Invite Code"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Hash className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenNewGroup}
              title="Create New Group"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-36 pr-1">
          {groups.length === 0 ? (
            <p className="text-[11px] text-slate-400 px-3 py-1 italic">No groups yet</p>
          ) : (
            groups.map((g) => (
              <NavLink
                key={g.id}
                to={`/groups/${g.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800/80 font-bold text-cyan-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                    {g.name.charAt(0)}
                  </div>
                  <span className="truncate max-w-[100px]">{g.name}</span>
                </div>
                <span
                  className={`font-mono text-[10px] ${
                    g.myBalance > 0
                      ? 'text-emerald-500'
                      : g.myBalance < 0
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {g.myBalance > 0
                    ? `+${formatAmount(g.myBalance)}`
                    : g.myBalance < 0
                    ? `-${formatAmount(Math.abs(g.myBalance))}`
                    : 'settled'}
                </span>
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* Quick Tool Launchers (Create Bill, Themes, Multi-Agent, Auto-Rules, Calculator) */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
        <button
          onClick={() => onOpenManualBill?.()}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition border border-emerald-500/20"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Create / Edit Bill</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenThemes}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold transition border border-purple-500/20"
        >
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Theme Studio & Avatars</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenMultiAgent}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition border border-indigo-500/20"
        >
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>5-Agent AI Command</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenAutoRules}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition border border-amber-500/20"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Auto Split Rules</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenCalculator}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition border border-cyan-500/20"
        >
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Built-in Calculator</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
