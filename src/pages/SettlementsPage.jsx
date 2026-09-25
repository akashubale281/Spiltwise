import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  QrCode,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettlementsPage({ onOpenSettle }) {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getUserSettlements();
      if (res.success) {
        setSettlements(res.settlements || []);
      }
    } catch (err) {
      console.error('Fetch settlements error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const handleCancelSettlement = async (id) => {
    if (!window.confirm('Are you sure you want to reverse / cancel this settlement?')) return;
    try {
      const res = await api.cancelSettlement(id);
      if (res.success) {
        fetchSettlements();
      }
    } catch (err) {
      console.error('Cancel settlement error:', err);
    }
  };

  const filtered = settlements.filter((s) => {
    if (statusFilter === 'completed') return s.status === 'completed';
    if (statusFilter === 'cancelled') return s.status === 'cancelled';
    return true;
  });

  const totalSettledAmount = settlements
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + Number(s.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Settlements & UPI Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your payment settlements, UPI transfers, and debt clearances.
          </p>
        </div>

        <button
          onClick={() => onOpenSettle()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Settlement</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Settled
          </span>
          <h3 className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{totalSettledAmount.toFixed(2)}
          </h3>
          <span className="text-xs text-slate-400">Total volume cleared</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Completed Transactions
          </span>
          <h3 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">
            {settlements.filter((s) => s.status === 'completed').length}
          </h3>
          <span className="text-xs text-slate-400">Successfully reconciled</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Filter Status
          </span>
          <div className="flex items-center space-x-2 mt-2">
            {['all', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settlements List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading settlements...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No settlement records found.
          </div>
        ) : (
          filtered.map((s) => {
            const isCompleted = s.status === 'completed';
            const isPayer = s.payer_id === user?.id;
            return (
              <div key={s.id} className="p-4 flex items-center justify-between transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {s.payer_name} {s.payer_id === user?.id ? '(You)' : ''}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {s.payee_name} {s.payee_id === user?.id ? '(You)' : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{s.group_name}</span>
                      <span>•</span>
                      <span>Method: {s.payment_method}</span>
                      <span>•</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-extrabold font-mono text-base text-slate-900 dark:text-white block">
                      ₹{s.amount}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {isCompleted && (
                    <button
                      onClick={() => handleCancelSettlement(s.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition"
                      title="Reverse / Cancel Settlement"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
