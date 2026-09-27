import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bell,
  Sun,
  Moon,
  Receipt,
  FileText,
  CreditCard,
  LogOut,
  User,
  CheckCheck,
  Menu,
  X,
  Eye,
  EyeOff,
  Mic,
  Bot,
  MapPin,
  Trophy,
  Calendar,
  Palette,
  Home,
  Layers,
  Zap,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({
  onOpenCalculator,
  onOpenManualBill,
  onOpenReceiptScan,
  onOpenSettle,
  onOpenCommandPalette,
  onOpenVoice,
  onOpenAI,
  onOpenAIKey,
  onOpenThemes,
  onOpenMultiAgent,
  onOpenAutoRules
}) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, privacyMode, togglePrivacyMode } = useTheme();
  const { notifications, unreadCount, isDrawerOpen, toggleDrawer, markAsRead, markAllAsRead } = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                SplitVerse<span className="text-slate-800 dark:text-slate-100 font-extrabold"> AI</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/20">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search / Command Launcher Bar */}
        {user && (
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-400 transition shadow-inner"
            >
              <span className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Search features, groups, AI commands...</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-500 dark:text-slate-300">
                Ctrl K
              </kbd>
            </button>
          </div>
        )}

        {/* Action Buttons (Middle / Right) */}
        {user && (
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition active:scale-95"
              title="Voice Expense Entry"
            >
              <Mic className="w-4 h-4" />
              <span>Voice</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition active:scale-95"
              title="AI Accountant"
            >
              <Bot className="w-4 h-4" />
              <span>AI Chat</span>
            </button>

            <button
              onClick={onOpenMultiAgent}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition active:scale-95"
              title="5-Agent AI Command"
            >
              <Bot className="w-4 h-4" />
              <span>5 Agents</span>
            </button>

            <button
              onClick={() => onOpenManualBill?.()}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition active:scale-95"
              title="Create / Generate Bill Manually"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Create Bill</span>
            </button>

            <button
              onClick={onOpenReceiptScan}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Scan Bill</span>
            </button>

            <button
              onClick={onOpenAIKey}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/20 transition active:scale-95"
              title="Link Gemini or OpenAI API Key"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>API Key</span>
            </button>

            <button
              onClick={onOpenSettle}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-sm transition active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle Up</span>
            </button>
          </div>
        )}

        {/* Right Tools (Privacy Mask, Theme, Notification, Profile) */}
        <div className="flex items-center space-x-2">
          {/* Privacy Hidden Balances Toggle */}
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-xl transition ${
              privacyMode
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={privacyMode ? 'Privacy Mode Active (Balances Hidden)' : 'Hide Balances (Privacy Mask)'}
          >
            {privacyMode ? <EyeOff className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Theme Studio (Cyberpunk, AMOLED, Glass, Gold, BMW Blue, Minimal) */}
          <button
            onClick={onOpenThemes}
            className="p-2 rounded-xl text-slate-500 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Theme Studio: 6 Themes & Animated Avatars"
          >
            <Palette className="w-5 h-5 text-purple-400" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {user && (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={toggleDrawer}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Drawer Dropdown */}
                {isDrawerOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fade-in">
                    <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-cyan-500 hover:underline flex items-center space-x-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No notifications yet!
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              toggleDrawer();
                            }}
                            className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
                              !n.is_read ? 'bg-cyan-500/10' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {user.name ? user.name.slice(0, 2) : 'ME'}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.upi_id && (
                        <p className="text-[10px] text-cyan-400 font-mono mt-0.5 truncate">
                          UPI: {user.upi_id}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Account Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileNavOpen && user && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-4 glass-panel space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { onOpenCommandPalette(); setMobileNavOpen(false); }}
              className="flex items-center space-x-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search / K</span>
            </button>
            <button
              onClick={() => { onOpenVoice(); setMobileNavOpen(false); }}
              className="flex items-center space-x-2 p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl text-xs font-semibold"
            >
              <Mic className="w-4 h-4" />
              <span>Voice Entry</span>
            </button>
            <button
              onClick={() => { onOpenAI(); setMobileNavOpen(false); }}
              className="flex items-center space-x-2 p-2.5 bg-purple-500/10 text-purple-400 rounded-xl text-xs font-semibold"
            >
              <Bot className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
            <button
              onClick={() => { onOpenSettle(); setMobileNavOpen(false); }}
              className="flex items-center space-x-2 p-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle Up</span>
            </button>
          </div>

          {/* Super App Ecosystem Links */}
          <div className="pt-2 space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block px-1 mb-1">
              Super App Features
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/life"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center space-x-2 p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs text-white"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Life Dashboard</span>
              </Link>
              <Link
                to="/home-hub"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center space-x-2 p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs text-white"
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span>Roommate OS</span>
              </Link>
              <Link
                to="/maid"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center space-x-2 p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs text-white"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Maid Payroll</span>
              </Link>
              <Link
                to="/hubs"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center space-x-2 p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs text-white"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Specialized Hubs</span>
              </Link>
              <button
                onClick={() => { onOpenThemes?.(); setMobileNavOpen(false); }}
                className="flex items-center space-x-2 p-2 bg-purple-500/15 text-purple-300 rounded-xl text-xs font-semibold"
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Theme Studio</span>
              </button>
              <button
                onClick={() => { onOpenAIKey?.(); setMobileNavOpen(false); }}
                className="flex items-center space-x-2 p-2 bg-amber-500/15 text-amber-300 rounded-xl text-xs font-semibold"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Link AI API Key</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
