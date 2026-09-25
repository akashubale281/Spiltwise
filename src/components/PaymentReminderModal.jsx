import React, { useState } from 'react';
import {
  X,
  Bell,
  Share2,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function PaymentReminderModal({ isOpen, onClose, debtor, amount, groupName }) {
  const [template, setTemplate] = useState('polite');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  const templates = {
    polite: `Hi ${debtor?.name || 'there'}! Hope you're doing well. Just a gentle reminder regarding the ₹${amount || 0} balance in ${groupName || 'our group'}. Settle up whenever convenient!`,
    friendly: `Hey ${debtor?.name || 'mate'}! Quick heads up about ₹${amount || 0} for ${groupName || 'our trip'}. Let me know once paid! 🚀`,
    urgent: `Hello ${debtor?.name || ''}, please clear your pending dues of ₹${amount || 0} in ${groupName || 'our group'} at your earliest convenience. Thank you!`
  };

  const [customText, setCustomText] = useState(templates[template]);

  const handleTemplateChange = (t) => {
    setTemplate(t);
    setCustomText(templates[t]);
  };

  const handleSendReminder = async () => {
    if (!debtor?.id) return;
    setLoading(true);
    try {
      const res = await api.sendPaymentReminder({
        debtorId: debtor.id,
        amount: Number(amount || 0),
        groupName: groupName,
        customMessage: customText
      });

      if (res.success) {
        setSuccessMsg(`Notification sent to ${debtor.name}!`);
        if (res.whatsappLink) {
          setWhatsappLink(res.whatsappLink);
        }
      }
    } catch (err) {
      console.error('Reminder error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Send Payment Reminder
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Recipient</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {debtor?.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Pending Amount</span>
              <span className="font-bold font-mono text-rose-500 text-sm">
                ₹{amount}
              </span>
            </div>
          </div>

          {/* Template buttons */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tone Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['polite', 'friendly', 'urgent'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTemplateChange(t)}
                  className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition ${
                    template === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Custom Message
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleSendReminder}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send In-App Notification'}</span>
            </button>

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp Now</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleSendReminder}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition border border-emerald-300 dark:border-emerald-800"
              >
                <Share2 className="w-4 h-4" />
                <span>Generate WhatsApp Reminder Link</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
