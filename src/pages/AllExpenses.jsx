import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Receipt,
  Trash2,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Tag,
  Edit,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import ExpenseComments from '../components/ExpenseComments';

const CATEGORIES = [
  'All',
  'Food',
  'Travel',
  'Utilities',
  'Groceries',
  'Entertainment',
  'Shopping',
  'Health',
  'Rent',
  'General'
];

export default function AllExpenses({ onOpenExpenseModal }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [expandedId, setExpandedId] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.getAllExpenses(params);
      if (res.success) {
        setExpenses(res.expenses || []);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, startDate, endDate, minAmount, maxAmount, sortBy]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExportCsv = () => {
    const token = localStorage.getItem('splitwise_token');
    window.open(`/api/reports/export/csv`, '_blank');
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await api.deleteExpense(id);
      if (res.success) {
        fetchExpenses();
      }
    } catch (err) {
      console.error('Delete expense error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            All Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, categorize, and export your entire expense history.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenExpenseModal()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
          >
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Amount Range Min & Max */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No expenses found matching the selected filters.
          </div>
        ) : (
          expenses.map((exp) => {
            const isExpanded = expandedId === exp.id;
            return (
              <div key={exp.id} className="p-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5 truncate">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {exp.category?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {exp.description}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {exp.group_name}
                        </span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span>Paid by {exp.creator_name}</span>
                        {exp.upi_id && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                            <CreditCard className="w-3 h-3 shrink-0" />
                            <span>{exp.upi_id}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white block">
                        ₹{exp.amount}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Share: ₹{exp.myShare || 0}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenExpenseModal(exp.group_id, exp);
                        }}
                        className="text-slate-300 hover:text-blue-500 p-1 transition"
                        title="Edit expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExpense(exp.id);
                        }}
                        className="text-slate-300 hover:text-red-500 p-1 transition"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in space-y-2">
                    {exp.notes && (
                      <p className="text-xs text-slate-500 italic">Notes: {exp.notes}</p>
                    )}
                    <ExpenseComments expenseId={exp.id} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
