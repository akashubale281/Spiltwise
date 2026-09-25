import React, { useState } from 'react';
import { Calculator, Check, RotateCcw } from 'lucide-react';

export default function MiniCalculatorInput({ value, onChange, placeholder = '0.00', currency = '₹', required = false }) {
  const [expression, setExpression] = useState(value !== undefined && value !== null ? String(value) : '');
  const [showKeypad, setShowKeypad] = useState(false);

  // Sync if prop changes externally
  React.useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setExpression(String(value));
    }
  }, [value]);

  const evaluateExpression = (expr) => {
    try {
      if (!expr || !expr.trim()) return;
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (!isNaN(result) && isFinite(result)) {
        const rounded = Math.round(result * 100) / 100;
        setExpression(String(rounded));
        onChange(rounded);
      }
    } catch {
      // Keep expression as is while typing
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setExpression(val);
    if (!isNaN(Number(val)) && val.trim() !== '') {
      onChange(Number(val));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      evaluateExpression(expression);
    }
  };

  const handleBlur = () => {
    evaluateExpression(expression);
  };

  const handleKeypadPress = (k) => {
    if (k === 'C') {
      setExpression('');
      onChange(0);
    } else if (k === '=') {
      evaluateExpression(expression);
      setShowKeypad(false);
    } else {
      const next = expression + k;
      setExpression(next);
      evaluateExpression(next);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 font-semibold select-none text-base">
          {currency}
        </span>
        <input
          type="text"
          value={expression}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className="w-full pl-9 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-xs"
        />
        <button
          type="button"
          onClick={() => setShowKeypad(!showKeypad)}
          title="Open Calculator Keypad"
          className="absolute right-2 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
        >
          <Calculator className="w-5 h-5" />
        </button>
      </div>

      {showKeypad && (
        <div className="absolute right-0 mt-2 z-30 w-64 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500">
            <span>Quick Keypad</span>
            <button
              type="button"
              onClick={() => handleKeypadPress('C')}
              className="text-red-500 hover:underline flex items-center space-x-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {['7', '8', '9', '/'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypadPress(k)}
                className="py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
              >
                {k}
              </button>
            ))}
            {['4', '5', '6', '*'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypadPress(k)}
                className="py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
              >
                {k}
              </button>
            ))}
            {['1', '2', '3', '-'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypadPress(k)}
                className="py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
              >
                {k}
              </button>
            ))}
            {['0', '.', '+', '='].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypadPress(k)}
                className={`py-2 text-sm font-bold rounded-lg transition active:scale-95 ${
                  k === '='
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
