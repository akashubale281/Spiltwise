import React, { useMemo, useState } from 'react';
import { Calendar, Flame, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SpendingHeatmap({ expenses = [] }) {
  const { formatAmount } = useTheme();
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate past 16 weeks (112 days)
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group expenses by YYYY-MM-DD
    const expenseByDate = {};
    expenses.forEach((exp) => {
      const d = new Date(exp.date || exp.created_at);
      if (!isNaN(d)) {
        const key = d.toISOString().split('T')[0];
        expenseByDate[key] = (expenseByDate[key] || 0) + Number(exp.amount || 0);
      }
    });

    const totalDays = 112; // 16 weeks * 7 days
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const spent = expenseByDate[key] || 0;

      // Determine intensity level (0 to 4)
      let level = 0;
      if (spent > 5000) level = 4;
      else if (spent > 2000) level = 3;
      else if (spent > 500) level = 2;
      else if (spent > 0) level = 1;

      days.push({
        date: key,
        displayDate: date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric'
        }),
        dayOfWeek: date.getDay(),
        spent,
        level
      });
    }

    return days;
  }, [expenses]);

  const getColorClass = (level) => {
    switch (level) {
      case 4:
        return 'bg-emerald-500 dark:bg-emerald-400 shadow-xs shadow-emerald-400/50';
      case 3:
        return 'bg-emerald-400 dark:bg-emerald-600';
      case 2:
        return 'bg-emerald-300 dark:bg-emerald-800';
      case 1:
        return 'bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800/50';
    }
  };

  const totalSpentInPeriod = heatmapData.reduce((acc, d) => acc + d.spent, 0);
  const activeDays = heatmapData.filter((d) => d.spent > 0).length;

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Spending Intensity Heatmap
            </h3>
            <p className="text-[11px] text-slate-400">
              GitHub-style activity pattern across past 16 weeks
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Active Days
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-500">
            {activeDays} / 112 days
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          {heatmapData.map((d, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer hover:scale-125 ${getColorClass(
                d.level
              )}`}
            />
          ))}
        </div>
      </div>

      {/* Legend & Tooltip display */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
        <div className="min-h-[18px]">
          {hoveredDay ? (
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {hoveredDay.displayDate}:{' '}
              <span className="text-emerald-500 font-mono font-bold">
                {hoveredDay.spent > 0 ? formatAmount(hoveredDay.spent) : 'No expenses'}
              </span>
            </span>
          ) : (
            <span>Hover over any day to see spending activity</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800/60" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 dark:bg-emerald-950/70" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-600" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
