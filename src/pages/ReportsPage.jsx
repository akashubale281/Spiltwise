import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreStatus, setRestoreStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDashboardAnalytics();
        if (res.success) setAnalytics(res.analytics);
      } catch (err) {
        console.error('Reports error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await api.backupUserData();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `splitwise_backup_${Date.now()}.json`;
      a.click();
    } catch (err) {
      console.error('Backup download error:', err);
    }
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        const res = await api.restoreUserData(json);
        if (res.success) {
          setRestoreStatus('Backup data restored successfully!');
          setTimeout(() => setRestoreStatus(''), 4000);
        }
      } catch (err) {
        setRestoreStatus('Failed to parse or restore backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:p-0">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Reports & Data Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Download CSV spreadsheets, print monthly reports, and manage database backups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {restoreStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{restoreStatus}</span>
        </div>
      )}

      {/* Printable Report Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:border-none print:shadow-none">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Financial Summary Report
            </h2>
            <p className="text-xs text-slate-400">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Net Balance</span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{analytics?.netBalance || 0}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Paid
            </span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ₹{analytics?.totalPaid || 0}
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Share
            </span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
              ₹{analytics?.totalShare || 0}
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              You are Owed
            </span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              ₹{analytics?.youAreOwed || 0}
            </span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              You Owe
            </span>
            <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
              ₹{analytics?.youOwe || 0}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Category Breakdown
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.categorySpending?.map((cat) => (
                  <tr key={cat.category}>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {cat.category}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      ₹{cat.total_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        {/* Backup */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Backup Account Data
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Export a full JSON archive containing all your expenses, groups, bills, and settlements.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Restore */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Restore Data from Backup
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Import a previously exported JSON backup file to restore settings and preferences.
          </p>
          <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>Upload Backup JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
