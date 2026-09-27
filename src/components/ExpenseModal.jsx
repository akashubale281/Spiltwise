import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Calendar,
  Layers,
  Tag,
  DollarSign,
  Users,
  Repeat,
  FileText,
  Percent,
  Divide,
  Sliders,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import MiniCalculatorInput from './MiniCalculatorInput';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
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

export default function ExpenseModal({ isOpen, onClose, defaultGroupId, onExpenseSaved, editExpenseData }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId || '');
  const [groupMembers, setGroupMembers] = useState([]);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('monthly');

  // Payers & Splits
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  const [payerAmounts, setPayerAmounts] = useState({}); // { [userId]: amount }
  const [singlePayerId, setSinglePayerId] = useState(user?.id || '');

  // Split mode: 'equal' | 'exact' | 'percentage' | 'shares'
  const [splitMode, setSplitMode] = useState('equal');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [splitInputs, setSplitInputs] = useState({}); // custom values per member
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Credit UPI & QR Code Settings
  const [myUpiAccounts, setMyUpiAccounts] = useState([]);
  const [selectedCreditUpi, setSelectedCreditUpi] = useState(user?.upi_id || '');
  const [isCustomUpi, setIsCustomUpi] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState('');
  const [qrPreviewData, setQrPreviewData] = useState(null);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  // Duplicate Detection & Approvals
  const [existingGroupExpenses, setExistingGroupExpenses] = useState([]);
  const [dismissDuplicate, setDismissDuplicate] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('approved');

  // Load groups on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchGroups = async () => {
      try {
        const res = await api.getMyGroups();
        if (res.success && res.groups) {
          setGroups(res.groups);
          if (!selectedGroupId && res.groups.length > 0) {
            setSelectedGroupId(defaultGroupId || res.groups[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };
    fetchGroups();
  }, [isOpen, defaultGroupId, selectedGroupId]);

  // Load members when group changes
  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchMembers = async () => {
      try {
        const res = await api.getGroupById(selectedGroupId);
        if (res.success && res.group) {
          const members = res.group.members || [];
          setGroupMembers(members);
          setExistingGroupExpenses(res.group.expenses || []);
          const allIds = members.map((m) => m.id);
          setSelectedMemberIds(allIds);

          // Initialize single payer
          if (!singlePayerId || !allIds.includes(singlePayerId)) {
            setSinglePayerId(user?.id && allIds.includes(user.id) ? user.id : allIds[0]);
          }

          // Initialize splits defaults
          const initialSplits = {};
          members.forEach((m) => {
            initialSplits[m.id] = splitMode === 'shares' ? 1 : 0;
          });
          setSplitInputs(initialSplits);
        }
      } catch (err) {
        console.error('Failed to load group members:', err);
      }
    };
    fetchMembers();
  }, [selectedGroupId, user?.id]);

  // Populate edit data if provided
  useEffect(() => {
    if (editExpenseData && isOpen) {
      setDescription(editExpenseData.description || '');
      setAmount(editExpenseData.amount || 0);
      setCategory(editExpenseData.category || 'Food');
      setDate(editExpenseData.date || new Date().toISOString().split('T')[0]);
      setNotes(editExpenseData.notes || '');
      setReceiptUrl(editExpenseData.receipt_url || '');
      setIsRecurring(!!editExpenseData.is_recurring);
      if (editExpenseData.group_id) {
        setSelectedGroupId(editExpenseData.group_id);
      } else if (!selectedGroupId && groups.length > 0) {
        setSelectedGroupId(defaultGroupId || groups[0].id);
      }

      // Populate payers
      if (editExpenseData.payers && editExpenseData.payers.length > 1) {
        setIsMultiPayer(true);
        const payersMap = {};
        editExpenseData.payers.forEach((p) => {
          payersMap[p.user_id] = p.amount_paid;
        });
        setPayerAmounts(payersMap);
      } else if (editExpenseData.payers && editExpenseData.payers.length === 1) {
        setIsMultiPayer(false);
        setSinglePayerId(editExpenseData.payers[0].user_id);
      }

      // Populate splits
      if (editExpenseData.splits && editExpenseData.splits.length > 0) {
        const mode = editExpenseData.splits[0].split_type || 'equal';
        setSplitMode(mode);
        setSelectedMemberIds(editExpenseData.splits.map((s) => s.user_id));
        const inputs = {};
        editExpenseData.splits.forEach((s) => {
          inputs[s.user_id] = s.split_value;
        });
        setSplitInputs(inputs);
      }
    }
  }, [editExpenseData, isOpen]);

  // Load user's UPI accounts on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchUserUpis = async () => {
      try {
        const res = await api.getMyUpiIds();
        if (res.success && res.upiIds && res.upiIds.length > 0) {
          setMyUpiAccounts(res.upiIds);
          if (!editExpenseData?.upi_id) {
            const primary = res.upiIds.find((a) => a.is_primary === 1) || res.upiIds[0];
            setSelectedCreditUpi(primary.upi_id);
          }
        }
      } catch (err) {
        console.error('Failed to load user UPI IDs:', err);
      }
    };
    fetchUserUpis();
  }, [isOpen, editExpenseData]);

  // Handle edit expense UPI id
  useEffect(() => {
    if (editExpenseData && isOpen) {
      if (editExpenseData.upi_id) {
        const match = myUpiAccounts.find((a) => a.upi_id === editExpenseData.upi_id);
        if (match) {
          setSelectedCreditUpi(match.upi_id);
          setIsCustomUpi(false);
        } else {
          setIsCustomUpi(true);
          setCustomUpiInput(editExpenseData.upi_id);
        }
      }
    }
  }, [editExpenseData, isOpen, myUpiAccounts]);

  const handleToggleQrPreview = async () => {
    if (showQrPreview) {
      setShowQrPreview(false);
      return;
    }

    const activeUpi = isCustomUpi ? customUpiInput.trim() : selectedCreditUpi;
    if (!activeUpi) {
      setErrorMsg('Please select or enter a UPI ID first.');
      return;
    }

    setQrLoading(true);
    setShowQrPreview(true);
    try {
      const res = await api.getQuickQrCode(activeUpi, amount || 0, description || 'Expense Settlement', user?.name || 'Splitwise');
      if (res.success) {
        setQrPreviewData(res);
      }
    } catch (err) {
      console.error('Failed to preview QR code:', err);
    } finally {
      setQrLoading(false);
    }
  };

  // Toggle member selection in split
  const toggleMemberSelection = (id) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((mId) => mId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Compute splits based on selected mode
  const computeSplits = () => {
    const total = Number(amount || 0);
    const count = selectedMemberIds.length;
    if (count === 0 || total <= 0) return [];

    if (splitMode === 'equal') {
      const perPerson = Math.round((total / count) * 100) / 100;
      let runningSum = 0;
      return selectedMemberIds.map((uid, idx) => {
        let personShare = perPerson;
        if (idx === count - 1) {
          // Adjust last person for rounding difference
          personShare = Math.round((total - runningSum) * 100) / 100;
        }
        runningSum += personShare;
        return {
          userId: uid,
          splitType: 'equal',
          splitValue: Math.round((100 / count) * 100) / 100,
          computedAmount: personShare
        };
      });
    }

    if (splitMode === 'exact') {
      return selectedMemberIds.map((uid) => {
        const val = Number(splitInputs[uid] || 0);
        return {
          userId: uid,
          splitType: 'exact',
          splitValue: val,
          computedAmount: val
        };
      });
    }

    if (splitMode === 'percentage') {
      return selectedMemberIds.map((uid) => {
        const pct = Number(splitInputs[uid] || 0);
        const comp = Math.round(((pct / 100) * total) * 100) / 100;
        return {
          userId: uid,
          splitType: 'percentage',
          splitValue: pct,
          computedAmount: comp
        };
      });
    }

    if (splitMode === 'shares') {
      const totalShares = selectedMemberIds.reduce((acc, uid) => acc + (Number(splitInputs[uid]) || 1), 0);
      let runningSum = 0;
      return selectedMemberIds.map((uid, idx) => {
        const share = Number(splitInputs[uid]) || 1;
        let comp = totalShares > 0 ? Math.round(((share / totalShares) * total) * 100) / 100 : 0;
        if (idx === count - 1 && totalShares > 0) {
          comp = Math.round((total - runningSum) * 100) / 100;
        }
        runningSum += comp;
        return {
          userId: uid,
          splitType: 'shares',
          splitValue: share,
          computedAmount: comp
        };
      });
    }

    return [];
  };

  // Compute payers array
  const computePayers = () => {
    const total = Number(amount || 0);
    if (!isMultiPayer) {
      return [{ userId: Number(singlePayerId), amountPaid: total }];
    } else {
      return Object.entries(payerAmounts)
        .filter(([_, val]) => Number(val) > 0)
        .map(([uid, val]) => ({
          userId: Number(uid),
          amountPaid: Number(val)
        }));
    }
  };

  // Validation
  const validateForm = () => {
    if (!description.trim()) return 'Description cannot be empty.';
    const total = Number(amount);
    if (isNaN(total) || total <= 0) return 'Please enter a valid expense amount.';
    if (!selectedGroupId) return 'Please select a group.';
    if (selectedMemberIds.length === 0) return 'Select at least one member to split with.';

    // Check Payers sum
    const payers = computePayers();
    const paidSum = payers.reduce((acc, p) => acc + p.amountPaid, 0);
    if (Math.abs(paidSum - total) > 0.05) {
      return `Total paid by members (₹${paidSum.toFixed(2)}) must equal total expense amount (₹${total.toFixed(2)}).`;
    }

    // Check Splits sum
    if (splitMode === 'exact') {
      const exactSum = selectedMemberIds.reduce((acc, id) => acc + (Number(splitInputs[id]) || 0), 0);
      if (Math.abs(exactSum - total) > 0.05) {
        return `Sum of exact splits (₹${exactSum.toFixed(2)}) must equal ₹${total.toFixed(2)}. Remaining: ₹${(total - exactSum).toFixed(2)}`;
      }
    }

    if (splitMode === 'percentage') {
      const pctSum = selectedMemberIds.reduce((acc, id) => acc + (Number(splitInputs[id]) || 0), 0);
      if (Math.abs(pctSum - 100) > 0.1) {
        return `Sum of percentages must equal 100%. Current sum: ${pctSum.toFixed(1)}%`;
      }
    }

    return null;
  };

  const detectedDuplicate =
    !dismissDuplicate && Number(amount) > 0 && description.trim()
      ? existingGroupExpenses.find(
          (exp) =>
            (!editExpenseData || exp.id !== editExpenseData.id) &&
            (Math.abs(Number(exp.amount) - Number(amount)) < 1 ||
              (exp.description && exp.description.toLowerCase().trim() === description.toLowerCase().trim()))
        )
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

    setLoading(true);
    try {
      const computedSplits = computeSplits();
      const computedPayers = computePayers();
      const activeUpi = isCustomUpi ? customUpiInput.trim() : selectedCreditUpi;

      const payload = {
        group_id: Number(selectedGroupId),
        description: description.trim(),
        amount: Number(amount),
        category,
        date,
        notes,
        receipt_url: receiptUrl,
        upi_id: activeUpi,
        is_recurring: isRecurring ? 1 : 0,
        recurrence_frequency: isRecurring ? recurrenceFrequency : 'none',
        payers: computedPayers,
        splits: computedSplits
      };

      let res;
      if (editExpenseData?.id) {
        res = await api.updateExpense(editExpenseData.id, payload);
      } else {
        res = await api.createExpense(payload);
      }

      if (res.success) {
        onExpenseSaved?.();
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to save expense');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  // Handle receipt image upload
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      setLoading(true);
      const res = await api.uploadReceipt(formData);
      if (res.success) {
        setReceiptUrl(res.receiptUrl);
        if (res.data) {
          if (!description && res.data.merchant) setDescription(res.data.merchant);
          if (amount === 0 && res.data.total) setAmount(res.data.total);
          if (res.data.category) setCategory(res.data.category);
          if (res.data.date) setDate(res.data.date);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to upload and scan receipt.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {editExpenseData ? 'Edit Expense' : 'Add New Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Group
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner, Villa Booking, Fuel"
                required
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Total Amount (Calculator Enabled)
              </label>
              <MiniCalculatorInput
                value={amount}
                onChange={(newVal) => setAmount(newVal)}
                placeholder="0.00"
                currency="₹"
                required
              />
            </div>
          </div>

          {/* AI Duplicate Detective Warning */}
          {detectedDuplicate && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <strong className="text-amber-300">AI Duplicate Warning:</strong> A matching expense of{' '}
                  <strong className="text-white">₹{detectedDuplicate.amount}</strong> ("{detectedDuplicate.description}") was already recorded in this group on {detectedDuplicate.date}.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissDuplicate(true)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 font-bold shrink-0 transition"
              >
                Ignore
              </button>
            </div>
          )}

          {/* High-Value Expense Approval Workflow */}
          {Number(amount) >= 2000 && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-indigo-200">Group Approval Workflow (Expense &ge; ₹2,000)</div>
                  <div className="text-[11px] text-indigo-300/80">Requires verification by group members</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalStatus('approved')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                    approvalStatus === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  ✓ Approved
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalStatus('pending')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                    approvalStatus === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  ⏳ Pending
                </button>
              </div>
            </div>
          )}

          {/* Date & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Expense Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-5 flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="flex items-center space-x-1">
                  <Repeat className="w-4 h-4 text-blue-500" />
                  <span>Recurring Bill</span>
                </span>
              </label>
              {isRecurring && (
                <select
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
          </div>

          {/* Section: Paid By */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Paid By</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMultiPayer(!isMultiPayer)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {isMultiPayer ? 'Switch to Single Payer' : 'Multiple people paid?'}
              </button>
            </div>

            {!isMultiPayer ? (
              <select
                value={singlePayerId}
                onChange={(e) => setSinglePayerId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
              >
                {groupMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === user?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 pt-1">
                {groupMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {m.name} {m.id === user?.id ? '(You)' : ''}
                    </span>
                    <div className="flex items-center space-x-1.5 w-36">
                      <span className="text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={payerAmounts[m.id] !== undefined ? payerAmounts[m.id] : ''}
                        onChange={(e) =>
                          setPayerAmounts({ ...payerAmounts, [m.id]: Number(e.target.value) })
                        }
                        placeholder="0.00"
                        className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Credit To UPI ID & QR Code (Where members should pay back) */}
          <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Credit Amount To (UPI / QR Code)</span>
              </span>
              <button
                type="button"
                onClick={handleToggleQrPreview}
                className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQrPreview ? 'Hide QR Code' : 'Preview QR Code'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select which UPI account group members should scan and pay back for this expense:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!isCustomUpi ? (
                <select
                  value={selectedCreditUpi}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomUpi(true);
                      setSelectedCreditUpi('');
                    } else {
                      setSelectedCreditUpi(e.target.value);
                      setShowQrPreview(false);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                >
                  {myUpiAccounts.map((acc) => (
                    <option key={acc.id} value={acc.upi_id}>
                      {acc.upi_id} ({acc.label}{acc.is_primary ? ' - PRIMARY' : ''})
                    </option>
                  ))}
                  <option value="__custom__">➕ Enter custom / different UPI ID...</option>
                  <option value="">🚫 No UPI ID (Cash settlement)</option>
                </select>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={customUpiInput}
                    onChange={(e) => {
                      setCustomUpiInput(e.target.value);
                      setShowQrPreview(false);
                    }}
                    placeholder="Enter custom UPI (e.g. name@okhdfcbank)"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomUpi(false);
                      const primary = myUpiAccounts.find((a) => a.is_primary === 1) || myUpiAccounts[0];
                      setSelectedCreditUpi(primary ? primary.upi_id : '');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Switch to saved accounts"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 px-3 py-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {isCustomUpi
                    ? customUpiInput ? `Receiving at: ${customUpiInput}` : 'Enter Custom UPI'
                    : selectedCreditUpi
                    ? `Receiving at: ${selectedCreditUpi}`
                    : 'No UPI linked'}
                </span>
              </div>
            </div>

            {/* Live QR Code Preview Box */}
            {showQrPreview && (
              <div className="mt-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center justify-center space-y-2 animate-fade-in text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Settlement QR Preview for this Bill</span>
                </span>
                {qrLoading ? (
                  <div className="py-8 text-xs text-slate-400">Generating live QR code...</div>
                ) : qrPreviewData?.qrCodeData ? (
                  <div className="space-y-2">
                    <img
                      src={qrPreviewData.qrCodeData}
                      alt="UPI QR Code"
                      className="w-40 h-40 mx-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-1 bg-white"
                    />
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      Amount: ₹{Number(amount || 0).toFixed(2)} → {isCustomUpi ? customUpiInput : selectedCreditUpi}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-rose-500">Could not generate QR code for this UPI ID.</span>
                )}
              </div>
            )}
          </div>

          {/* Section: Split Mode */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Split Option</span>
              </span>
              {/* Split Mode Selector Tabs */}
              <div className="flex items-center bg-slate-200 dark:bg-slate-700/60 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setSplitMode('equal')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    splitMode === 'equal'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  = Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('exact')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    splitMode === 'exact'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ₹ Exact
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('percentage')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    splitMode === 'percentage'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  % Pct
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('shares')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    splitMode === 'shares'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ⚖ Shares
                </button>
              </div>
            </div>

            {/* Members Split Checklist */}
            <div className="space-y-2 pt-1 divide-y divide-slate-100 dark:divide-slate-700/50">
              {groupMembers.map((m) => {
                const isChecked = selectedMemberIds.includes(m.id);
                return (
                  <div key={m.id} className="pt-2 flex items-center justify-between text-xs">
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMemberSelection(m.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {m.name} {m.id === user?.id ? '(You)' : ''}
                      </span>
                    </label>

                    {isChecked && (
                      <div className="flex items-center space-x-2">
                        {splitMode === 'equal' && (
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            ₹
                            {selectedMemberIds.length > 0
                              ? (amount / selectedMemberIds.length).toFixed(2)
                              : '0.00'}
                          </span>
                        )}

                        {splitMode === 'exact' && (
                          <div className="flex items-center space-x-1 w-28">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={splitInputs[m.id] !== undefined ? splitInputs[m.id] : ''}
                              onChange={(e) =>
                                setSplitInputs({ ...splitInputs, [m.id]: Number(e.target.value) })
                              }
                              placeholder="0.00"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono font-semibold"
                            />
                          </div>
                        )}

                        {splitMode === 'percentage' && (
                          <div className="flex items-center space-x-1 w-24">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={splitInputs[m.id] !== undefined ? splitInputs[m.id] : ''}
                              onChange={(e) =>
                                setSplitInputs({ ...splitInputs, [m.id]: Number(e.target.value) })
                              }
                              placeholder="%"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono font-semibold"
                            />
                            <span className="text-slate-400">%</span>
                          </div>
                        )}

                        {splitMode === 'shares' && (
                          <div className="flex items-center space-x-1 w-24">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={splitInputs[m.id] !== undefined ? splitInputs[m.id] : 1}
                              onChange={(e) =>
                                setSplitInputs({ ...splitInputs, [m.id]: Number(e.target.value) })
                              }
                              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono font-semibold"
                            />
                            <span className="text-slate-400">share(s)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt Attachment & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Receipt Attachment (OCR Scan)
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center justify-center space-x-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition w-full text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>{receiptUrl ? 'Replace Bill Image' : 'Attach Bill Image'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {receiptUrl && (
                <span className="text-[11px] text-emerald-500 font-semibold block mt-1">
                  ✓ Receipt attached & parsed
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or context"
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : editExpenseData ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
