import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Laptop,
  Plus,
  Star,
  Check,
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { isDark, themeMode, setThemeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthly_budget || 25000);
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');

  // Multi-UPI Accounts State
  const [upiAccounts, setUpiAccounts] = useState([]);
  const [upiLoading, setUpiLoading] = useState(false);
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiLabel, setNewUpiLabel] = useState('HDFC Bank');
  const [newUpiIsPrimary, setNewUpiIsPrimary] = useState(false);
  const [upiActionMsg, setUpiActionMsg] = useState('');
  const [upiErrorMsg, setUpiErrorMsg] = useState('');

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load UPI Accounts
  const fetchUpiAccounts = async () => {
    setUpiLoading(true);
    try {
      const res = await api.getMyUpiIds();
      if (res.success && res.upiIds) {
        setUpiAccounts(res.upiIds);
      }
    } catch (err) {
      console.error('Failed to load UPI accounts:', err);
    } finally {
      setUpiLoading(false);
    }
  };

  useEffect(() => {
    fetchUpiAccounts();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setErrorMsg('');
    try {
      const res = await api.updateProfile({
        name,
        currency,
        monthly_budget: Number(monthlyBudget),
        photo_url: photoUrl
      });
      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  const handleAddUpi = async (e) => {
    e.preventDefault();
    setUpiErrorMsg('');
    setUpiActionMsg('');

    if (!newUpiId || !newUpiId.includes('@')) {
      setUpiErrorMsg('Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@upi)');
      return;
    }

    try {
      const res = await api.addUpiId({
        upi_id: newUpiId.trim(),
        label: newUpiLabel.trim() || 'Personal UPI',
        is_primary: newUpiIsPrimary ? 1 : 0
      });

      if (res.success) {
        setUpiActionMsg('UPI Account linked successfully!');
        setNewUpiId('');
        setShowAddUpi(false);
        fetchUpiAccounts();
        if (newUpiIsPrimary) {
          updateUser({ upi_id: newUpiId.trim() });
        }
        setTimeout(() => setUpiActionMsg(''), 3000);
      }
    } catch (err) {
      setUpiErrorMsg(err.message || 'Failed to add UPI ID.');
    }
  };

  const handleSetPrimary = async (id, upiIdValue) => {
    setUpiErrorMsg('');
    try {
      const res = await api.setPrimaryUpiId(id);
      if (res.success) {
        setUpiActionMsg(`Primary account switched to ${upiIdValue}`);
        fetchUpiAccounts();
        updateUser({ upi_id: upiIdValue });
        setTimeout(() => setUpiActionMsg(''), 3000);
      }
    } catch (err) {
      setUpiErrorMsg(err.message || 'Failed to set primary UPI ID.');
    }
  };

  const handleDeleteUpi = async (id, upiIdValue) => {
    if (!window.confirm(`Are you sure you want to unlink ${upiIdValue}?`)) return;
    setUpiErrorMsg('');
    try {
      const res = await api.deleteUpiId(id);
      if (res.success) {
        setUpiActionMsg('UPI account unlinked.');
        fetchUpiAccounts();
        setTimeout(() => setUpiActionMsg(''), 3000);
      }
    } catch (err) {
      setUpiErrorMsg(err.message || 'Failed to delete UPI ID.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account and all data? This action cannot be undone.')) return;
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        logout();
        navigate('/login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete account.');
    }
  };

  const getBankBadge = (upi) => {
    const lower = (upi || '').toLowerCase();
    if (lower.includes('hdfc')) return { name: 'HDFC Bank', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    if (lower.includes('sbi')) return { name: 'State Bank of India', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' };
    if (lower.includes('icici')) return { name: 'ICICI Bank', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    if (lower.includes('axis')) return { name: 'Axis Bank', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
    if (lower.includes('paytm')) return { name: 'Paytm Payments', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' };
    if (lower.includes('ybl') || lower.includes('ibl')) return { name: 'PhonePe (Yes Bank)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
    return { name: 'UPI Account', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage appearance themes, multiple UPI payment IDs, and security.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. THEME SWITCHER CARD (Light vs Dark vs System) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center font-bold">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance & Theme Mode
              </h3>
              <p className="text-xs text-slate-400">
                Easily switch between Normal (Light) mode and Dark mode
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
            {themeMode === 'system' ? `System (${isDark ? 'Dark' : 'Light'})` : `${themeMode} Mode`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition ${
              themeMode === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs font-bold">Light (Normal)</span>
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition ${
              themeMode === 'dark'
                ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => setThemeMode('system')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition ${
              themeMode === 'system'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-6 h-6 text-indigo-500" />
            <span className="text-xs font-bold">Auto (System)</span>
          </button>
        </div>
      </div>

      {/* 2. MULTI-UPI MANAGEMENT CENTER (GPay / PhonePe style) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>UPI Accounts & QR Settlements</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                  GPay / PhonePe Style
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Add multiple bank accounts. Select your primary account to receive default settlements.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddUpi(!showAddUpi)}
            className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add UPI ID</span>
          </button>
        </div>

        {upiActionMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{upiActionMsg}</span>
          </div>
        )}

        {upiErrorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{upiErrorMsg}</span>
          </div>
        )}

        {/* Add UPI Form Dropdown */}
        {showAddUpi && (
          <form onSubmit={handleAddUpi} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Link a New UPI Account</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddUpi(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  placeholder="e.g. name@okhdfcbank or 9876543210@upi"
                  required
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Account Label / Bank
                </label>
                <input
                  type="text"
                  value={newUpiLabel}
                  onChange={(e) => setNewUpiLabel(e.target.value)}
                  placeholder="e.g. HDFC Salary, SBI, PhonePe"
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Suggestions:</span>
              {['HDFC Bank', 'State Bank of India', 'Google Pay', 'PhonePe', 'Paytm', 'ICICI Bank'].map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setNewUpiLabel(sugg)}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-50"
                >
                  {sugg}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUpiIsPrimary}
                  onChange={(e) => setNewUpiIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Set as Primary Account (Default for receiving money)</span>
              </label>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
              >
                Link Account
              </button>
            </div>
          </form>
        )}

        {/* UPI Accounts List */}
        <div className="space-y-3">
          {upiLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading UPI accounts...</div>
          ) : upiAccounts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No UPI accounts linked yet. Click "+ Add UPI ID" above to link your first account.
            </div>
          ) : (
            upiAccounts.map((acc) => {
              const badge = getBankBadge(acc.upi_id);
              const isPrimary = acc.is_primary === 1;

              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                    isPrimary
                      ? 'bg-gradient-to-r from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isPrimary
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isPrimary ? <Star className="w-5 h-5 fill-white" /> : <CreditCard className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                          {acc.upi_id}
                        </span>
                        {isPrimary && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-600 text-white flex items-center space-x-1 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>PRIMARY</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {acc.label}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                          {badge.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(acc.id, acc.upi_id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition"
                      >
                        Set as Primary
                      </button>
                    )}
                    {upiAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUpi(acc.id, acc.upi_id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Unlink account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. PERSONAL DETAILS FORM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information
            </h3>
            <p className="text-xs text-slate-400">Update your name, currency and spending budget</p>
          </div>
        </div>

        {profileMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 select-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Monthly Spending Budget Limit (₹)
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition"
            >
              Save Profile Details
            </button>
          </div>
        </form>
      </div>

      {/* 4. CHANGE PASSWORD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Security & Password
            </h3>
            <p className="text-xs text-slate-400">Change your account password securely</p>
          </div>
        </div>

        {passwordMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/25 transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 5. DANGER ZONE */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/40 space-y-3">
        <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone: Delete Account</span>
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Permanently delete your account, expense history, and data. This action cannot be reversed.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
