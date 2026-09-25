import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Share2,
  Copy,
  Check,
  Smartphone,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettleModal({ isOpen, onClose, initialPayerId, initialPayeeId, initialAmount, groupId, onSettled }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
  const [members, setMembers] = useState([]);

  const [payerId, setPayerId] = useState(initialPayerId || user?.id || '');
  const [payeeId, setPayeeId] = useState(initialPayeeId || '');
  const [amount, setAmount] = useState(initialAmount || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  const [upiData, setUpiData] = useState(null);
  const [selectedPayeeUpi, setSelectedPayeeUpi] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load groups
  useEffect(() => {
    if (!isOpen) return;
    const fetchGroups = async () => {
      try {
        const res = await api.getMyGroups();
        if (res.success && res.groups) {
          setGroups(res.groups);
          if (!selectedGroupId && res.groups.length > 0) {
            setSelectedGroupId(groupId || res.groups[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
      }
    };
    fetchGroups();
  }, [isOpen, groupId, selectedGroupId]);

  // Load members when group changes
  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchMembers = async () => {
      try {
        const res = await api.getGroupById(selectedGroupId);
        if (res.success && res.group) {
          setMembers(res.group.members || []);
          if (!payeeId && res.group.members.length > 0) {
            const firstOther = res.group.members.find((m) => m.id !== user?.id) || res.group.members[0];
            setPayeeId(firstOther.id);
          }
        }
      } catch (err) {
        console.error('Failed to load members:', err);
      }
    };
    fetchMembers();
  }, [selectedGroupId, user?.id, payeeId]);

  // Reset selected UPI when payee changes
  useEffect(() => {
    setSelectedPayeeUpi('');
  }, [payeeId]);

  // Fetch dynamic UPI details and QR code when payee or amount changes
  useEffect(() => {
    if (!payeeId || !amount || Number(amount) <= 0) {
      setUpiData(null);
      return;
    }

    const fetchUpi = async () => {
      try {
        const res = await api.getUpiDetails(payeeId, amount, 'Splitwise Settlement', selectedPayeeUpi);
        if (res.success) {
          setUpiData(res);
        }
      } catch (err) {
        console.error('UPI details error:', err);
      }
    };

    fetchUpi();
  }, [payeeId, amount, selectedPayeeUpi]);

  const copyUpiId = () => {
    if (upiData?.payee?.upiId) {
      navigator.clipboard.writeText(upiData.payee.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please specify a positive settlement amount.');
      return;
    }
    if (Number(payerId) === Number(payeeId)) {
      setErrorMsg('Payer and payee cannot be the same person.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createSettlement({
        group_id: Number(selectedGroupId),
        payee_id: Number(payeeId),
        amount: Number(amount),
        payment_method: paymentMethod,
        notes: notes.trim()
      });

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        onSettled?.();
        onClose();
      } else {
        setErrorMsg(res.message || 'Settlement failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Settle Payment & UPI
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
        <form onSubmit={handleSettle} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Select Group
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payer and Payee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Who Paid? (Payer)
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Who Received? (Payee)
              </label>
              <select
                value={payeeId}
                onChange={(e) => setPayeeId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Bank Transfer">Bank NEFT / IMPS</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Dynamic UPI Payment Section */}
          {upiData?.payee?.upiId && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pay with UPI (Instant Settlement)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                </button>
              </div>

              {/* Mobile-Friendly UPI App Launcher and Optional QR */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{upiData.payee.name}</p>
                    <p className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{upiData.payee.upiId}</p>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{amount || '0.00'}
                  </span>
                </div>

                {/* Payee Account Selector if payee has multiple UPI IDs */}
                {upiData?.payee?.upiAccounts && upiData.payee.upiAccounts.length > 1 && (
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Choose {upiData.payee.name}&apos;s Receiving Account:
                    </label>
                    <select
                      value={selectedPayeeUpi || upiData.payee.upiId}
                      onChange={(e) => setSelectedPayeeUpi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                    >
                      {upiData.payee.upiAccounts.map((acc) => (
                        <option key={acc.id} value={acc.upi_id}>
                          {acc.upi_id} ({acc.label}{acc.is_primary ? ' - Primary' : ''})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Primary Mobile Action: Open in UPI App */}
                {upiData.upiUri && (
                  <a
                    href={upiData.upiUri}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/25 active:scale-98 transition"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in UPI App (GPay / PhonePe / Paytm)</span>
                  </a>
                )}

                {/* Secondary Actions: WhatsApp & Show QR Toggle */}
                <div className="flex items-center space-x-2">
                  {upiData.whatsappLink && (
                    <a
                      href={upiData.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-emerald-200 dark:border-emerald-800"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp Link</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
                  </button>
                </div>

                {/* Collapsible QR Code for scanning with a friend's phone */}
                {showQr && upiData.qrCodeData && (
                  <div className="pt-2 flex flex-col items-center justify-center border-t border-slate-100 dark:border-slate-700 animate-fade-in">
                    <img
                      src={upiData.qrCodeData}
                      alt="UPI QR Code"
                      className="w-36 h-36 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-1">
                      Scan with Google Pay, PhonePe, Paytm or BHIM
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Settlement Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared dinner bill balance"
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Recording...' : 'Mark as Settled'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
