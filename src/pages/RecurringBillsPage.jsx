import React, { useState, useEffect } from 'react';
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
  Users,
  FileText,
  Edit2,
  Printer
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

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

export default function RecurringBillsPage({ onOpenManualBill }) {
  const { formatAmount } = useTheme();
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'recurring'

  // Persistent recurring bills
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('splitverse_recurring_bills');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_BILLS;
  });

  // Persistent manual & scanned bills
  const [customBills, setCustomBills] = useState([]);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDay, setNewDueDay] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const todayDate = new Date().getDate();

  // Load custom bills from localStorage & backend
  const loadCustomBills = async () => {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('splitverse_saved_bills') || '[]');
    } catch (e) {}

    try {
      const res = await api.getMyBills();
      if (res.success && Array.isArray(res.bills)) {
        const localInvSet = new Set(local.map((b) => b.invoice_number));
        const combined = [...local];
        res.bills.forEach((b) => {
          if (!localInvSet.has(b.invoice_number)) {
            combined.push(b);
          }
        });
        setCustomBills(combined);
        return;
      }
    } catch (e) {}

    setCustomBills(local);
  };

  useEffect(() => {
    loadCustomBills();
    const handleBillSaved = () => loadCustomBills();
    window.addEventListener('splitverse:bill-saved', handleBillSaved);
    return () => window.removeEventListener('splitverse:bill-saved', handleBillSaved);
  }, []);

  const handleAddBill = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newBill = {
      id: Date.now(),
      title: newTitle.trim(),
      category: 'Utilities',
      amount: amountNum,
      dueDay: Number(newDueDay),
      frequency: 'Monthly',
      splitBetween: ['You', 'Alex'],
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600'
    };

    const updated = [newBill, ...bills];
    setBills(updated);
    try {
      localStorage.setItem('splitverse_recurring_bills', JSON.stringify(updated));
    } catch (e) {}

    setNewTitle('');
    setNewAmount('');
    setShowAddForm(false);
    setSuccessToast('New recurring bill scheduled and saved permanently!');
    setTimeout(() => setSuccessToast(''), 2500);
  };

  const handleDeleteBill = (id) => {
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    try {
      localStorage.setItem('splitverse_recurring_bills', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteCustomBill = (invoiceNumber) => {
    const updated = customBills.filter((b) => b.invoice_number !== invoiceNumber);
    setCustomBills(updated);
    try {
      localStorage.setItem('splitverse_saved_bills', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSendReminder = (bill) => {
    const shareAmount = Math.round(bill.amount / (bill.splitBetween?.length || 2));
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
              <FileText className="w-3.5 h-3.5" />
              <span>Invoices & Automated Schedules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bills, Invoices & Schedules
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Create custom GST bills, track scanned receipts, and automate recurring rent & utility payments with permanent storage.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenManualBill?.()}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 transition active:scale-95 shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Bill</span>
            </button>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'custom'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Saved Bills & Invoices ({customBills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'recurring'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Recurring Commitments ({bills.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED BILLS & INVOICES */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <span>Saved Invoices Library</span>
              <span className="text-xs font-normal text-slate-400">
                (Kept permanently across page refreshes)
              </span>
            </h3>
            <button
              onClick={() => onOpenManualBill?.()}
              className="flex items-center space-x-1 text-xs font-bold text-amber-500 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Bill</span>
            </button>
          </div>

          {customBills.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No saved bills yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "Create New Bill" to generate itemized GST invoices with custom tax rates, tips, and UPI QR codes.
                </p>
              </div>
              <button
                onClick={() => onOpenManualBill?.()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create Bill Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customBills.map((b, idx) => (
                <div
                  key={b.id || b.invoice_number || idx}
                  className="glass-card p-5 rounded-3xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {b.invoice_number || b.invoiceNumber || 'INV-001'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {b.date || b.billDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {b.vendor_name || b.vendorName || b.merchant || b.title}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-semibold text-slate-300">{b.items?.length || 1} line items</span>
                      </div>
                      {b.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span>GST Included:</span>
                          <span className="font-mono text-slate-300">₹{Number(b.tax_amount).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                      <span className="text-lg font-black font-mono text-emerald-500">
                        ₹{Number(b.total_amount || b.amount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenManualBill?.(b)}
                        className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                        title="Edit Bill"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCustomBill(b.invoice_number)}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECURRING SCHEDULES */}
      {activeTab === 'recurring' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Recurring Monthly Subscriptions & Rent
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-1 text-xs font-bold text-cyan-500 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Add Subscription'}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddBill} className="p-4 rounded-2xl glass-card space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Bill Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Cook & Maid Salary"
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Due Day of Month (1 - 31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newDueDay}
                    onChange={(e) => setNewDueDay(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
              >
                Schedule & Save Permanently
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bills.map((bill) => {
              const isOverdue = todayDate > bill.dueDay;
              const daysLeft = bill.dueDay - todayDate;
              return (
                <div
                  key={bill.id}
                  className="glass-card p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:scale-[1.01] transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Day {bill.dueDay} of month
                      </span>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                      {bill.title}
                    </h4>
                    <span className="text-xl font-black font-mono text-cyan-400 block">
                      {formatAmount(bill.amount)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-400'
                          : daysLeft <= 3
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isOverdue ? 'Passed' : `${daysLeft} days left`}
                    </span>
                    <button
                      onClick={() => handleSendReminder(bill)}
                      className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:underline"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
