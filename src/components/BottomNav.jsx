import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  ShoppingCart,
  Plus,
  CreditCard
} from 'lucide-react';

export default function BottomNav({ onOpenCalculator, onOpenExpenseModal }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200/80 dark:border-slate-800/80 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Holographic Radar / Life Dashboard */}
        <NavLink
          to="/life"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Radar</span>
        </NavLink>

        {/* Expense Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Expenses</span>
        </NavLink>

        {/* Center Quick Action: Add Expense */}
        <div className="flex flex-col items-center justify-center flex-1 h-full -mt-5">
          <button
            onClick={() => onOpenExpenseModal?.()}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
            title="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Add</span>
        </div>

        {/* Quick-Commerce Shopping Hub */}
        <NavLink
          to="/shopping"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </NavLink>

        {/* Settlements & UPI */}
        <NavLink
          to="/settlements"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Settle</span>
        </NavLink>
      </div>
    </nav>
  );
}
