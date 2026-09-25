import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete, Shield, Check, AlertCircle } from 'lucide-react';

export default function SecurityLockModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isBiometricSuccess, setIsBiometricSuccess] = useState(false);

  // Default PIN is 1234 or saved pin
  const savedPin = localStorage.getItem('splitverse_app_pin') || '1234';

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === savedPin) {
        setErrorMsg('');
        setIsBiometricSuccess(true);
        setTimeout(() => {
          setPin('');
          setIsBiometricSuccess(false);
          onClose();
        }, 400);
      } else {
        setErrorMsg('Incorrect PIN. (Default is 1234)');
        setTimeout(() => setPin(''), 600);
      }
    }
  }, [pin, savedPin, onClose]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      setErrorMsg('');
      setPin((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometric = () => {
    setIsBiometricSuccess(true);
    setTimeout(() => {
      setIsBiometricSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
            {isBiometricSuccess ? <Check className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h3 className="text-lg font-black text-white">
            {isBiometricSuccess ? 'Access Granted' : 'SplitVerse Locked'}
          </h3>
          <p className="text-xs text-slate-400">
            Enter your 4-digit security PIN to unlock
          </p>
        </div>

        {/* 4 dots indicator */}
        <div className="flex items-center justify-center space-x-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  filled
                    ? 'bg-cyan-400 scale-125 shadow-sm shadow-cyan-400'
                    : 'bg-slate-700/80 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium animate-pulse">{errorMsg}</p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="w-16 h-16 mx-auto rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold text-xl border border-white/10 transition flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          {/* Biometric trigger */}
          <button
            onClick={handleBiometric}
            className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 active:scale-95 border border-cyan-500/30 transition flex items-center justify-center"
            title="Biometric Fingerprint Unlock"
          >
            <Fingerprint className="w-7 h-7" />
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 mx-auto rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold text-xl border border-white/10 transition flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 mx-auto rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white transition flex items-center justify-center"
            title="Delete"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Default Master PIN: <span className="font-mono text-cyan-400">1234</span>
        </p>
      </div>
    </div>
  );
}
