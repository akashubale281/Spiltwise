import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Check,
  X,
  ArrowRight,
  Receipt,
  Percent,
  Users,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveRestaurantSplitModal({
  isOpen,
  onClose,
  group,
  onSplitSuccess
}) {
  const members = group?.members || [
    { id: 1, name: 'You' },
    { id: 2, name: 'Alex' },
    { id: 3, name: 'Sam' }
  ];

  const [items, setItems] = useState([
    { id: 1, name: 'Paneer Butter Masala', price: 340, assignedTo: [members[0]?.id, members[1]?.id] },
    { id: 2, name: 'Garlic Naan (3 pcs)', price: 180, assignedTo: members.map((m) => m.id) },
    { id: 3, name: 'Chicken Dum Biryani', price: 420, assignedTo: [members[1]?.id, members[2]?.id] },
    { id: 4, name: 'Cold Drinks', price: 120, assignedTo: [members[0]?.id] }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [taxPercent, setTaxPercent] = useState(5); // 5% GST
  const [tipAmount, setTipAmount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    const priceNum = parseFloat(newItemPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newItemName.trim(),
        price: priceNum,
        assignedTo: members.map((m) => m.id) // Default to shared by all
      }
    ]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleMemberForItem = (itemId, memberId) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.assignedTo.includes(memberId);
        const nextAssigned = exists
          ? item.assignedTo.filter((id) => id !== memberId)
          : [...item.assignedTo, memberId];
        return { ...item, assignedTo: nextAssigned };
      })
    );
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = subtotal + taxAmount + (parseFloat(tipAmount) || 0);

  // Compute breakdown per member
  const memberTotals = {};
  members.forEach((m) => {
    memberTotals[m.id] = { name: m.name, itemSum: 0, finalShare: 0 };
  });

  items.forEach((item) => {
    if (item.assignedTo.length > 0) {
      const share = item.price / item.assignedTo.length;
      item.assignedTo.forEach((mid) => {
        if (memberTotals[mid]) {
          memberTotals[mid].itemSum += share;
        }
      });
    }
  });

  // Distribute tax and tip proportionally
  const extraCharges = taxAmount + (parseFloat(tipAmount) || 0);
  Object.keys(memberTotals).forEach((mid) => {
    const ratio = subtotal > 0 ? memberTotals[mid].itemSum / subtotal : 1 / members.length;
    memberTotals[mid].finalShare = Math.round(memberTotals[mid].itemSum + extraCharges * ratio);
  });

  const handleSaveToGroup = async () => {
    if (!group?.id) {
      setErrorMsg('No group selected to save expense to.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const splitDetails = Object.keys(memberTotals).map((mid) => ({
        userId: parseInt(mid, 10),
        amount: memberTotals[mid].finalShare
      }));

      await api.createExpense({
        groupId: group.id,
        description: `Restaurant Bill: ${items.map((i) => i.name).slice(0, 2).join(', ')}...`,
        amount: Math.round(grandTotal),
        category: 'Food',
        splitType: 'custom',
        splitDetails,
        date: new Date().toISOString()
      });

      onSplitSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save restaurant split.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Live Restaurant Itemized Split
              </h3>
              <p className="text-xs text-slate-400">
                Tap friends to assign who ate what; taxes and tips split proportionally
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
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Add Dish Bar */}
          <form
            onSubmit={handleAddItem}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Dish / item name (e.g. Masala Dosa)"
              className="sm:col-span-6 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
            <input
              type="number"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder="Price (₹)"
              className="sm:col-span-3 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
            <button
              type="submit"
              className="sm:col-span-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dish</span>
            </button>
          </form>

          {/* Dishes List */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Items on Bill ({items.length})
            </span>
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                      {item.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold font-mono text-xs sm:text-sm text-amber-500">
                        ₹{item.price}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Assign to members tags */}
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Ate by:</span>
                    {members.map((m) => {
                      const isAssigned = item.assignedTo.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMemberForItem(item.id, m.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition flex items-center space-x-1 ${
                            isAssigned
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{m.name}</span>
                          {isAssigned && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Tip Options */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">GST / Tax (%):</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tip (₹):</label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Individual Share Summary Cards */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Calculated Share Per Person (Includes GST & Tip)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.keys(memberTotals).map((mid) => {
                const info = memberTotals[mid];
                return (
                  <div
                    key={mid}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">
                      {info.name}
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-500 block">
                      ₹{info.finalShare}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Grand Total</span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              ₹{Math.round(grandTotal)}
            </span>
          </div>
          <button
            onClick={handleSaveToGroup}
            disabled={loading || items.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-40 flex items-center space-x-1.5"
          >
            <span>{loading ? 'Saving...' : 'Save As Group Expense'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
