import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Check,
  ArrowRight,
  AlertCircle,
  FileText,
  Copy,
  Receipt
} from 'lucide-react';
import { api } from '../services/api';

export default function WhatsAppImportModal({ isOpen, onClose, defaultGroupId, onImportSuccess }) {
  const [chatText, setChatText] = useState('');
  const [parsedExpenses, setParsedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleParseChat = () => {
    if (!chatText.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');

    const lines = chatText.split('\n');
    const detected = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Extract amount: e.g. "paid 1500", "₹500", "rs 800", "sent 400"
      const amountMatch =
        trimmed.match(/(?:paid|sent|spend|spent|rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)/i) ||
        trimmed.match(/(\d+(?:\.\d+)?)\s*(?:rs|inr|rupees|bucks)/i);

      if (amountMatch) {
        const amount = amountMatch[1];
        // Extract sender name from WhatsApp pattern: "[date, time] Name: message" or "Name: message"
        let senderName = 'Member';
        const nameMatch = trimmed.match(/(?:\]\s*|^)([^:]+):/);
        if (nameMatch) {
          senderName = nameMatch[1].trim();
        }

        // Determine category & description
        let category = 'General';
        const lower = trimmed.toLowerCase();
        if (lower.includes('food') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('pizza') || lower.includes('swiggy')) {
          category = 'Food';
        } else if (lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('petrol') || lower.includes('toll')) {
          category = 'Travel';
        } else if (lower.includes('groceries') || lower.includes('grocery') || lower.includes('milk')) {
          category = 'Groceries';
        } else if (lower.includes('wifi') || lower.includes('rent') || lower.includes('bill')) {
          category = 'Utilities';
        }

        let desc = trimmed.replace(/\[.*?\]/, '').trim();
        if (desc.length > 50) desc = desc.substring(0, 50) + '...';

        detected.push({
          id: index,
          selected: true,
          senderName,
          amount,
          category,
          description: desc || `Expense by ${senderName}`
        });
      }
    });

    if (detected.length === 0) {
      setErrorMsg('Could not detect any expenses or payments in this chat text. Try including numbers like "paid 500 for dinner".');
    } else {
      setParsedExpenses(detected);
    }
  };

  const toggleSelect = (id) => {
    setParsedExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleImportBatch = async () => {
    const selected = parsedExpenses.filter((e) => e.selected);
    if (selected.length === 0) return;

    if (!defaultGroupId) {
      setErrorMsg('Please select a group first or enter a group details page to import expenses directly.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      for (const item of selected) {
        await api.createExpense({
          groupId: defaultGroupId,
          description: item.description,
          amount: Number(item.amount),
          category: item.category,
          splitType: 'equal',
          date: new Date().toISOString()
        });
      }
      setSuccessMsg(`Successfully imported ${selected.length} expense(s) into the group!`);
      setTimeout(() => {
        onImportSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to import expenses.');
    } finally {
      setLoading(false);
    }
  };

  const sampleChat = `[19/09/26, 1:15 PM] Rahul: Hey team, I paid 1450 for our lunch at Barbeque
[19/09/26, 2:30 PM] Akash: Nice! I paid 380 for the Uber cab back to hotel
[19/09/26, 4:00 PM] Priya: I spent 620 on snacks and cold drinks`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                WhatsApp Expense Import
              </h3>
              <p className="text-xs text-slate-400">
                Paste chat exports to auto-detect payments and amounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Text Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paste Chat Export / WhatsApp Text
            </label>
            <button
              onClick={() => setChatText(sampleChat)}
              className="text-[11px] text-cyan-500 hover:underline flex items-center space-x-1 font-medium"
            >
              <Copy className="w-3 h-3" />
              <span>Paste Sample Chat</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="Paste WhatsApp messages here, e.g.&#10;[12:30 PM] Alex: I paid 1200 for pizza&#10;[1:15 PM] Sam: Paid 400 for groceries"
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleParseChat}
            disabled={!chatText.trim()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-40 flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Detect Expenses with AI Parser</span>
          </button>
        </div>

        {/* Parsed Expenses Preview */}
        {parsedExpenses.length > 0 && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Detected Transactions ({parsedExpenses.length})
            </span>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {parsedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => toggleSelect(exp.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    exp.selected
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                        exp.selected ? 'bg-emerald-500 text-white' : 'border border-slate-400'
                      }`}
                    >
                      {exp.selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {exp.senderName}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                          {exp.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {exp.description}
                      </span>
                    </div>
                  </div>
                  <span className="font-black font-mono text-sm text-emerald-500 shrink-0 ml-2">
                    ₹{exp.amount}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleImportBatch}
              disabled={loading || parsedExpenses.filter((e) => e.selected).length === 0}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 flex items-center justify-center space-x-2"
            >
              <span>
                {loading
                  ? 'Importing...'
                  : `Batch Import ${parsedExpenses.filter((e) => e.selected).length} Expense(s)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
