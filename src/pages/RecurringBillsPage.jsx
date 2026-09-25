import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Share2,
  RefreshCw,
  Zap,
  ArrowRight,
  Wifi,
  Home,
  Tv,
  Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_BILLS = [
  {
    id: 1,
    title: 'Apartment Rent',
    category: 'Rent',
    amount: 24000,
    dueDay: 1,
    frequency: 'Monthly',
    splitBetween: ['You', 'Alex', 'Sam'],
    icon: Home,
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 2,
    title: 'House Maid & Cook Salary',
    category: 'Utilities',
    amount: 6000,
    dueDay: 5,
    frequency: 'Monthly',
    splitBetween: ['You', 'Alex', 'Sam'],
    icon: Users,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 3,
    title: 'High-Speed Fiber WiFi (Airtel)',
    category: 'Utilities',
    amount: 1199,
    dueDay: 12,
    frequency: 'Monthly',
    splitBetween: ['You', 'Alex', 'Sam'],
    icon: Wifi,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 4,
    title: 'Netflix & Spotify Premium',
    category: 'Entertainment',
    amount: 799,
    dueDay: 22,
    frequency: 'Monthly',
    splitBetween: ['You', 'Alex'],
    icon: Tv,
    color: 'from-rose-500 to-red-600'
  }
];

export default function RecurringBillsPage() {
  const { formatAmount } = useTheme();
  const [bills, setBills] = useState(DEFAULT_BILLS);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDay, setNewDueDay] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const todayDate = new Date().getDate();

  const handleAddBill = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setBills((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTitle.trim(),
        category: 'Utilities',
        amount: amountNum,
        dueDay: Number(newDueDay),
        frequency: 'Monthly',
        splitBetween: ['You', 'Alex'],
        icon: Calendar,
        color: 'from-purple-500 to-indigo-600'
      }
    ]);
    setNewTitle('');
    setNewAmount('');
    setShowAddForm(false);
    setSuccessToast('New recurring bill scheduled successfully!');
    setTimeout(() => setSuccessToast(''), 2500);
  };

  const handleDeleteBill = (id) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSendReminder = (bill) => {
    const shareAmount = Math.round(bill.amount / bill.splitBetween.length);
    const msg = `👋 Hey flatmates, SplitVerse reminder: ${bill.title} (Total: ₹${bill.amount}) is due on day ${bill.dueDay} of the month. Your share: ₹${shareAmount}. Pay via UPI!`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const totalMonthlyCommitment = bills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white border border-cyan-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Automation & Subscriptions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Recurring Bills & Schedules
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Automate rent, WiFi, maid salaries, and subscriptions with smart due-date alerts.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">
                Total Monthly
              </span>
              <span className="text-xl font-black font-mono text-cyan-400">
                {formatAmount(totalMonthlyCommitment)}
              </span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recurring Bill</span>
            </button>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Add Recurring Bill Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBill}
          className="glass-card rounded-3xl p-5 sm:p-6 border border-cyan-500/30 space-y-4 animate-fade-in"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Schedule New Recurring Bill
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Bill Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Electricity Bill"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Amount (₹)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="2500"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Due Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newDueDay}
                onChange={(e) => setNewDueDay(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bills.map((bill) => {
          const daysLeft = bill.dueDay >= todayDate ? bill.dueDay - todayDate : 30 - (todayDate - bill.dueDay);
          const IconComp = bill.icon;
          const share = Math.round(bill.amount / bill.splitBetween.length);

          return (
            <div
              key={bill.id}
              className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${bill.color} text-white flex items-center justify-center shadow-xs`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {bill.title}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {bill.frequency} • Day {bill.dueDay} of month
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      daysLeft <= 3
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {daysLeft === 0 ? 'Due Today' : `Due in ${daysLeft} days`}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bill</span>
                    <span className="font-extrabold font-mono text-base text-slate-900 dark:text-white">
                      {formatAmount(bill.amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Share</span>
                    <span className="font-extrabold font-mono text-base text-cyan-400">
                      {formatAmount(share)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <span>Split between:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {bill.splitBetween.join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => handleSendReminder(bill)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Reminder</span>
                </button>
                <button
                  onClick={() => handleDeleteBill(bill.id)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Remove Schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
