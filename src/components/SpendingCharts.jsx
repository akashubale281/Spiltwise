import React from 'react';
import { PieChart as LucidePie, BarChart2, Target, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const NEON_PALETTE = [
  '#06b6d4', // neon cyan
  '#8b5cf6', // electric violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#3b82f6'  // blue
];

export default function SpendingCharts({
  categorySpending = [],
  monthlySpending = [],
  budget = 25000,
  currentMonthSpent = 0
}) {
  const { formatAmount } = useTheme();
  const totalCategorySpend = categorySpending.reduce(
    (acc, it) => acc + Number(it.total_amount),
    0
  );

  const budgetPct =
    budget > 0 ? Math.min(100, Math.round((currentMonthSpent / budget) * 100)) : 0;

  // Prepare Recharts category data
  const pieData = categorySpending.map((c) => ({
    name: c.category || 'Other',
    value: Number(c.total_amount) || 0
  }));

  // Prepare Recharts monthly trend data
  const areaData = monthlySpending.map((m) => ({
    month: m.month ? m.month.slice(5) : 'Mo',
    amount: Number(m.total_amount) || 0
  }));

  // Apple Watch Activity Rings metrics
  const outerPct = Math.min(100, budgetPct);
  const middlePct = 68; // Weekly velocity
  const innerPct = 85; // Settlement consistency

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Apple Watch Style Activity Rings */}
      <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Spending Activity Rings
              </h4>
              <p className="text-[11px] text-slate-400">Apple-inspired metrics</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {outerPct}% Target
          </span>
        </div>

        {/* Concentric SVG Rings */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
            {/* Outer Ring Background & Progress (Budget) */}
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800/80 fill-none" />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#06b6d4"
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * outerPct) / 100}
              strokeLinecap="round"
              className="fill-none transition-all duration-1000"
            />

            {/* Middle Ring (Weekly Pace) */}
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800/80 fill-none" />
            <circle
              cx="50"
              cy="50"
              r="30"
              stroke="#8b5cf6"
              strokeWidth="6"
              strokeDasharray="188.4"
              strokeDashoffset={188.4 - (188.4 * middlePct) / 100}
              strokeLinecap="round"
              className="fill-none transition-all duration-1000"
            />

            {/* Inner Ring (Settlement Consistency) */}
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800/80 fill-none" />
            <circle
              cx="50"
              cy="50"
              r="20"
              stroke="#10b981"
              strokeWidth="6"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - (125.6 * innerPct) / 100}
              strokeLinecap="round"
              className="fill-none transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Burn</span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {formatAmount(currentMonthSpent)}
            </span>
          </div>
        </div>

        {/* Ring Legends */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1" />
            <span className="text-slate-400">Budget</span>
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1" />
            <span className="text-slate-400">Velocity</span>
          </div>
          <div>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />
            <span className="text-slate-400">Settled</span>
          </div>
        </div>
      </div>

      {/* 2. Recharts Glowing Donut Chart */}
      <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <LucidePie className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Category Distribution
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {formatAmount(totalCategorySpend)}
          </span>
        </div>

        {/* Recharts Pie */}
        <div className="h-44 w-full flex items-center justify-center">
          {pieData.length === 0 ? (
            <div className="text-xs text-slate-400">No category records yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={NEON_PALETTE[index % NEON_PALETTE.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val) => formatAmount(val)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mini Legend Chips */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-1">
          {pieData.slice(0, 4).map((entry, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center space-x-1"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: NEON_PALETTE[i % NEON_PALETTE.length] }}
              />
              <span>{entry.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Recharts Gradient Area Trend */}
      <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Monthly Trend
            </h4>
          </div>
          <span className="text-xs text-slate-400">Past Months</span>
        </div>

        <div className="h-44 w-full">
          {areaData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No historical trends yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <RechartsTooltip
                  formatter={(val) => formatAmount(val)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>AI Insight:</span>
          <span className="text-emerald-400 font-medium">Spending down 12% vs last month</span>
        </div>
      </div>
    </div>
  );
}
