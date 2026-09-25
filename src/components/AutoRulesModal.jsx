import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const DEFAULT_RULES = [
  {
    id: 1,
    title: 'Every Friday Team / Flatmate Lunch',
    trigger: 'Weekly: Every Friday at 1:30 PM',
    cadence: 'weekly',
    day: 'Friday',
    amount: 1400,
    category: 'Food',
    splitType: 'Equal Split',
    active: true,
    lastRun: 'Last Friday',
    nextRun: 'This Friday, 1:30 PM'
  },
  {
    id: 2,
    title: 'Monthly Flat Rent Split',
    trigger: 'Monthly: 1st of every month at 9:00 AM',
    cadence: 'monthly',
    day: '1st',
    amount: 36000,
    category: 'Rent',
    splitType: 'Equal Split',
    active: true,
    lastRun: '1st of this month',
    nextRun: '1st of next month'
  },
  {
    id: 3,
    title: 'Electricity & Utility Bill',
    trigger: 'Monthly: 10th of every month',
    cadence: 'monthly',
    day: '10th',
    amount: 2850,
    category: 'Utilities',
    splitType: 'Equal Split',
    active: true,
    lastRun: '10th of this month',
    nextRun: '10th of next month'
  },
  {
    id: 4,
    title: 'Sunday Morning Groceries Run',
    trigger: 'Weekly: Every Sunday at 10:00 AM',
    cadence: 'weekly',
    day: 'Sunday',
    amount: 1850,
    category: 'Groceries',
    splitType: 'Equal Split',
    active: false,
    lastRun: 'Never',
    nextRun: 'Paused'
  }
];

export default function AutoRulesModal({ isOpen, onClose, onRuleExecuted }) {
  const { formatAmount } = useTheme();
  const [rules, setRules] = useState(() => {
    const saved = localStorage.getItem('splitverse_auto_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newCadence, setNewCadence] = useState('weekly');
  const [newDay, setNewDay] = useState('Friday');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('splitverse_auto_rules', JSON.stringify(rules));
  }, [rules]);

  if (!isOpen) return null;

  const toggleRuleActive = (id) => {
    setRules(prev =>
      prev.map(r =>
        r.id === id ? { ...r, active: !r.active, nextRun: !r.active ? 'Scheduled' : 'Paused' } : r
      )
    );
  };

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;

    const newRule = {
      id: Date.now(),
      title: newTitle.trim(),
      trigger: `${newCadence === 'weekly' ? 'Weekly: Every ' + newDay : 'Monthly: Day ' + newDay}`,
      cadence: newCadence,
      day: newDay,
      amount: Number(newAmount),
      category: newCategory,
      splitType: 'Equal Split',
      active: true,
      lastRun: 'Just added',
      nextRun: `Next ${newDay}`
    };

    setRules(prev => [newRule, ...prev]);
    setShowAddForm(false);
    setNewTitle('');
    setNewAmount('');
    setSuccessMsg(`Auto-rule "${newRule.title}" created successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const executeRuleNow = (rule) => {
    setSuccessMsg(`⚡ Executing rule: "${rule.title}" for ${formatAmount(rule.amount)}. Expense recorded into group!`);
    onRuleExecuted?.(rule);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Smart Auto Rules & Recurring Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically schedule Friday lunches, monthly rent, and utility splits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Automated Split Rules ({rules.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" /> {showAddForm ? 'Cancel' : 'New Smart Rule'}
            </button>
          </div>

          {/* Add Rule Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddRule}
              className="p-5 rounded-2xl bg-slate-800/60 border border-indigo-500/30 space-y-4 animate-fadeIn"
            >
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Create Automated Expense Rule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Rule Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Friday Shawarma Night"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Estimated Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="Food">Food</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cadence</label>
                  <select
                    value={newCadence}
                    onChange={e => setNewCadence(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Trigger Day</label>
                  {newCadence === 'weekly' ? (
                    <select
                      value={newDay}
                      onChange={e => setNewDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="Monday">Every Monday</option>
                      <option value="Tuesday">Every Tuesday</option>
                      <option value="Wednesday">Every Wednesday</option>
                      <option value="Thursday">Every Thursday</option>
                      <option value="Friday">Every Friday</option>
                      <option value="Saturday">Every Saturday</option>
                      <option value="Sunday">Every Sunday</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. 1st or 15th"
                      value={newDay}
                      onChange={e => setNewDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow"
              >
                Save & Activate Smart Rule
              </button>
            </form>
          )}

          {/* Rules List */}
          <div className="space-y-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rule.active
                    ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{rule.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-400 border border-slate-700">
                      {rule.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-amber-400 font-bold">{formatAmount(rule.amount)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {rule.trigger}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Next Run: <strong className="text-slate-300">{rule.nextRun}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => executeRuleNow(rule)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
                    title="Trigger rule right now"
                  >
                    <Play className="w-3 h-3 fill-current" /> Run Now
                  </button>

                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      rule.active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {rule.active ? 'Active' : 'Paused'}
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
