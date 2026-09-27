import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  FileText,
  CreditCard,
  Calculator,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  ChevronRight,
  Calendar,
  AlertCircle,
  Sparkles,
  Mic,
  MessageSquare,
  Utensils,
  MapPin,
  Flame,
  CheckCircle2,
  Zap,
  Bot
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SpendingCharts from '../components/SpendingCharts';
import SpendingHeatmap from '../components/SpendingHeatmap';
import ExpenseComments from '../components/ExpenseComments';

export default function Dashboard({
  onOpenExpenseModal,
  onOpenCalculator,
  onOpenManualBill,
  onOpenReceiptScan,
  onOpenSettle,
  onOpenVoice,
  onOpenAI,
  onOpenWhatsApp,
  onOpenRestaurantSplit
}) {
  const { user } = useAuth();
  const { formatAmount } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [dismissDetective, setDismissDetective] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [anaRes, grpRes] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getMyGroups()
      ]);

      if (anaRes.success) setAnalytics(anaRes.analytics);
      if (grpRes.success) setGroups(grpRes.groups || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading SplitVerse AI...</span>
        </div>
      </div>
    );
  }

  const netBalance = analytics?.netBalance || 0;
  const youAreOwed = analytics?.youAreOwed || 0;
  const youOwe = analytics?.youOwe || 0;
  const totalSpent = analytics?.totalSpent || 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white border border-cyan-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SplitVerse AI Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Friend'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Next-generation expense automation, AI receipt splitting, voice entry, and 1-tap UPI settlements.
            </p>
          </div>

          {/* Quick Action Matrix */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenExpenseModal()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>

            <button
              onClick={onOpenManualBill}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition active:scale-95 shadow-sm"
              title="Generate or Edit Bill"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Create Bill</span>
            </button>

            <button
              onClick={onOpenReceiptScan}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition active:scale-95 shadow-sm"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Scan Bill</span>
            </button>

            <button
              onClick={onOpenRestaurantSplit}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition active:scale-95 shadow-sm"
            >
              <Utensils className="w-4 h-4 text-indigo-400" />
              <span>Dish Split</span>
            </button>

            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition active:scale-95 shadow-sm"
              title="Speak Expense"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>Voice</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-xs transition active:scale-95 shadow-sm"
              title="Ask AI Accountant"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Expense Detective Signature Card */}
      {!dismissDetective && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-xs sm:text-sm text-white">
                  AI Expense Detective
                </h4>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Signature
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                "You have 2 unrecorded UPI expenses worth ₹1,420 today (Uber Cab & Chai). Tap to log into flatmates group."
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                alert('Logging 2 detected transactions into Flatmates group with 1 tap!');
                setDismissDetective(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs transition"
            >
              Log All (1-Tap)
            </button>
            <button
              onClick={() => setDismissDetective(true)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Financial Metric Cards with Privacy Masking Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Net Balance
            </span>
            <div
              className={`p-2 rounded-xl ${
                netBalance >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}
            >
              {netBalance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl font-extrabold font-mono ${
                netBalance > 0
                  ? 'text-emerald-500'
                  : netBalance < 0
                  ? 'text-rose-500'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {netBalance > 0
                ? `+${formatAmount(netBalance)}`
                : netBalance < 0
                ? `-${formatAmount(Math.abs(netBalance))}`
                : formatAmount(0)}
            </h3>
            <span className="text-xs text-slate-400">
              {netBalance > 0 ? 'Overall, you are owed' : netBalance < 0 ? 'Overall, you owe' : 'All debts settled'}
            </span>
          </div>
        </div>

        {/* You Are Owed */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              You are Owed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono text-emerald-500">
              {formatAmount(youAreOwed)}
            </h3>
            <span className="text-xs text-slate-400">To collect from friends</span>
          </div>
        </div>

        {/* You Owe */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              You Owe
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-rose-500">
                {formatAmount(youOwe)}
              </h3>
              <span className="text-xs text-slate-400">To pay friends</span>
            </div>
            {youOwe > 0 && (
              <button
                onClick={() => onOpenSettle?.()}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition"
              >
                Settle Now
              </button>
            )}
          </div>
        </div>

        {/* Total Spent */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Spent
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-cyan-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-100">
              {formatAmount(totalSpent)}
            </h3>
            <span className="text-xs text-slate-400">Tracked personal share</span>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Action Bar - Zero Headache Quick Create */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/60 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">1-Click Quick Actions</span>
            <span className="text-[10px] text-slate-400 block">Instant bill generation, receipt scanning & expense creation</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenExpenseModal()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Expense</span>
          </button>

          <button
            onClick={onOpenManualBill}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Generate Bill</span>
          </button>

          <button
            onClick={onOpenReceiptScan}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition active:scale-95"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Scan Receipt</span>
          </button>

          <Link
            to="/maid"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition active:scale-95"
          >
            <span>🧹 Maid Attendance</span>
          </Link>
        </div>
      </div>

      {/* Spending Visual Analytics: Concentric Apple Watch Rings + Recharts */}
      <SpendingCharts
        categorySpending={analytics?.categorySpending || []}
        monthlySpending={analytics?.monthlySpending || []}
        budget={user?.monthly_budget || 25000}
        currentMonthSpent={analytics?.currentMonthSpent || 0}
      />

      {/* Spending Heatmap (GitHub Calendar Style) */}
      <SpendingHeatmap expenses={analytics?.recentExpenses || []} />

      {/* Groups Grid with AI Friend Personalities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Your Squads & Groups ({groups.length})
            </h3>
          </div>
          <Link
            to="/maid"
            className="text-xs font-bold text-cyan-500 hover:underline flex items-center space-x-1"
          >
            <span>Maid & Cook Payroll</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((grp) => (
            <Link
              key={grp.id}
              to={`/groups/${grp.id}`}
              className="glass-card p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {grp.name?.charAt(0)}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {grp.name}
                    </h4>
                    <span className="text-xs text-slate-400 capitalize">
                      {grp.category} • {grp.memberCount || 3} members
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  {grp.myRole}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-400">Your Balance</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    grp.myBalance > 0
                      ? 'text-emerald-500'
                      : grp.myBalance < 0
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {grp.myBalance > 0
                    ? `+${formatAmount(grp.myBalance)}`
                    : grp.myBalance < 0
                    ? `-${formatAmount(Math.abs(grp.myBalance))}`
                    : 'Settled'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Expenses List with Story Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Recent Expense Story Cards
            </h3>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-cyan-500 hover:underline flex items-center space-x-1"
          >
            <span>View All Expenses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {analytics?.recentExpenses?.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No recent expenses found. Tap "Add Expense" or "Speak" to start!
            </div>
          ) : (
            analytics?.recentExpenses?.map((exp) => {
              const isExpanded = expandedExpenseId === exp.id;
              return (
                <div key={exp.id} className="p-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <div
                    onClick={() => setExpandedExpenseId(isExpanded ? null : exp.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs uppercase">
                        {exp.category?.slice(0, 2) || 'EX'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                          {exp.description}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span>{exp.payer_name} paid</span>
                          <span>•</span>
                          <span>{new Date(exp.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold font-mono text-sm sm:text-base text-slate-900 dark:text-white block">
                        {formatAmount(exp.amount)}
                      </span>
                      <span className="text-[10px] text-cyan-500 font-medium">
                        {exp.split_type || 'equal'} split
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in space-y-3">
                      <ExpenseComments expenseId={exp.id} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
