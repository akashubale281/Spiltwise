import React, { useState, useEffect } from 'react';
import { Calculator, X, History, Trash2, Copy, Check, Minimize2, Maximize2 } from 'lucide-react';

export default function FloatingCalculator({ isOpen, onClose, onApplyAmount }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Safe evaluation
  const calculateResult = () => {
    try {
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      const formatted = Math.round(result * 100) / 100;
      setHistory((prev) => [{ eq: display, res: formatted.toString() }, ...prev.slice(0, 9)]);
      setEquation(`${display} =`);
      setDisplay(formatted.toString());
    } catch {
      setDisplay('Error');
    }
  };

  const handleButtonClick = (val) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === 'CE') {
      setDisplay('0');
    } else if (val === '⌫') {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '=') {
      calculateResult();
    } else if (val === '+/-') {
      setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : `-${prev}`));
    } else if (val === '%') {
      try {
        const valNum = parseFloat(display) / 100;
        setDisplay(valNum.toString());
      } catch {
        setDisplay('Error');
      }
    } else {
      if (display === '0' || display === 'Error') {
        setDisplay(val);
      } else {
        setDisplay((prev) => prev + val);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApply = () => {
    if (onApplyAmount && !isNaN(Number(display))) {
      onApplyAmount(Number(display));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-80 sm:w-96 text-slate-800 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide">SplitWise Calculator</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            title="Calculation History"
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 flex flex-col space-y-3">
          {/* Display screen */}
          <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3.5 flex flex-col items-end justify-center min-h-[76px] border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-tight h-4">
              {equation}
            </span>
            <div className="w-full flex items-center justify-between mt-1">
              <div className="flex items-center space-x-1">
                <button
                  onClick={copyToClipboard}
                  className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center space-x-1"
                  title="Copy result"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                {onApplyAmount && (
                  <button
                    onClick={handleApply}
                    className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 text-[10px]"
                    title="Insert amount into expense"
                  >
                    Paste to Form
                  </button>
                )}
              </div>
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white truncate max-w-[200px]">
                {display}
              </span>
            </div>
          </div>

          {/* History Tape drawer */}
          {showHistory && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/40 max-h-36 overflow-y-auto text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 mb-1 pb-1 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-[11px]">Recent History</span>
                <button
                  onClick={() => setHistory([])}
                  className="hover:text-red-500 transition flex items-center space-x-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-[10px]">Clear</span>
                </button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-2 text-slate-400 text-[11px]">No recent calculations</div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setDisplay(item.res)}
                    className="flex justify-between items-center py-1 px-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded cursor-pointer transition font-mono"
                  >
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{item.eq}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{item.res}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2">
            {['C', 'CE', '⌫', '÷'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                className="py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                {btn}
              </button>
            ))}
            {['7', '8', '9', '×'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 ${
                  btn === '×'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {btn}
              </button>
            ))}
            {['4', '5', '6', '-'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 ${
                  btn === '-'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {btn}
              </button>
            ))}
            {['1', '2', '3', '+'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 ${
                  btn === '+'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {btn}
              </button>
            ))}
            {['+/-', '0', '.', '='].map((btn) => (
              <button
                key={btn}
                onClick={() => handleButtonClick(btn)}
                className={`py-2.5 rounded-xl text-sm font-bold transition active:scale-95 ${
                  btn === '='
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
