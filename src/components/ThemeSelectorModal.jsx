import React from 'react';
import { X, Sparkles, Check, Crown, Palette, Flame, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    desc: 'Neon cyan, electric violet & hot pink high-contrast UI',
    colorPreview: 'from-cyan-400 via-purple-500 to-pink-500',
    badge: 'Popular',
    badgeColor: 'bg-cyan-500/20 text-cyan-300'
  },
  {
    id: 'amoled',
    name: 'AMOLED Black',
    desc: 'Pitch-black #000000 battery saver with crisp neon accents',
    colorPreview: 'from-slate-950 via-zinc-900 to-black',
    badge: 'OLED',
    badgeColor: 'bg-slate-800 text-slate-300'
  },
  {
    id: 'glass',
    name: 'Frosted Glass',
    desc: 'Deep blur glassmorphic panels with frosted overlays',
    colorPreview: 'from-blue-500/40 via-indigo-500/40 to-slate-800/60',
    badge: 'Sleek',
    badgeColor: 'bg-blue-500/20 text-blue-300'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    desc: 'Obsidian black with warm metallic gold & champagne hues',
    colorPreview: 'from-amber-400 via-yellow-500 to-amber-700',
    badge: 'Prestige',
    badgeColor: 'bg-amber-500/20 text-amber-300'
  },
  {
    id: 'bmw-blue',
    name: 'BMW M-Blue',
    desc: 'Deep M-Sport Navy with electric M-Power blue & cyan',
    colorPreview: 'from-sky-400 via-blue-600 to-indigo-900',
    badge: 'Motorsport',
    badgeColor: 'bg-sky-500/20 text-sky-300'
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    desc: 'Crisp Apple-inspired light mode with soft slate borders',
    colorPreview: 'from-slate-100 via-white to-slate-200',
    badge: 'Light Mode',
    badgeColor: 'bg-slate-200 text-slate-700'
  },
  {
    id: 'supercar',
    name: 'Supercar Rosso Carbon',
    desc: 'Ferrari Rosso Corsa racing red, carbon weave & tachometer glow',
    colorPreview: 'from-red-600 via-rose-950 to-neutral-900',
    badge: 'Automobile & F1',
    badgeColor: 'bg-red-500/20 text-red-300'
  }
];

const AVATARS = [
  { id: 'cyber-glow', label: 'Cyber Ninja', icon: '🥷', haloClass: 'avatar-halo-cyber' },
  { id: 'gold-crown', label: 'Wealth Sovereign', icon: '👑', haloClass: 'avatar-halo-gold' },
  { id: 'emerald-phoenix', label: 'Emerald Sage', icon: '🛡️', haloClass: 'avatar-halo-emerald' },
  { id: 'fire-warrior', label: 'Flame Stalker', icon: '⚡', haloClass: 'avatar-halo-cyber' },
  { id: 'supercar-pilot', label: 'F1 / GT3 Racer', icon: '🏎️', haloClass: 'avatar-halo-gold' }
];

export default function ThemeSelectorModal({ isOpen, onClose }) {
  const { activeTheme, setAppTheme, activeAvatar, setAvatar } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col glass-panel rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Theme Studio & Avatars
              </h3>
              <p className="text-xs text-slate-400">
                Switch visual identities and unlock profile avatar animations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Theme Grid */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Futuristic Color Palettes (6 Presets)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map((theme) => {
                const isSelected = activeTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setAppTheme(theme.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white/40 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-tr ${theme.colorPreview} shadow-xs border border-white/20`}
                        />
                        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                          {theme.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${theme.badgeColor}`}
                        >
                          {theme.badge}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {theme.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Avatars */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unlockable Animated Avatars
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold">Reputation Level 4 Perks</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATARS.map((av) => {
                const isSelected = activeAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => setAvatar(av.id)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl transition ${
                        isSelected ? av.haloClass : ''
                      }`}
                    >
                      {av.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Active: <span className="font-bold text-cyan-400 uppercase">{activeTheme}</span></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-xs transition"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
}
