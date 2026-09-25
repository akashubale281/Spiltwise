import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Globe,
  Share2,
  TrendingUp,
  Flame,
  Users,
  Compass,
  DollarSign,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PLANETS = [
  { id: 'food', name: 'Planet Dining', amount: 8450, color: '#f59e0b', orbitRadius: 65, size: 28, speed: '25s', icon: '🍕' },
  { id: 'staff', name: 'Planet Staff & Help', amount: 6200, color: '#06b6d4', orbitRadius: 100, size: 24, speed: '35s', icon: '🧹' },
  { id: 'rent', name: 'Planet Habitat', amount: 18000, color: '#8b5cf6', orbitRadius: 140, size: 36, speed: '50s', icon: '🏠' },
  { id: 'groceries', name: 'Planet QuickCommerce', amount: 4800, color: '#10b981', orbitRadius: 180, size: 22, speed: '65s', icon: '🛒' },
  { id: 'entertainment', name: 'Planet Leisure', amount: 2600, color: '#ec4899', orbitRadius: 215, size: 20, speed: '80s', icon: '🎬' }
];

const MONEY_FLOWS = [
  { from: 'Rahul', to: 'You', amount: 820, category: 'Friday Dinner' },
  { from: 'You', to: 'Sam', amount: 350, category: 'Uber Ride' },
  { from: 'Priya', to: 'Alex', amount: 1200, category: 'Cook & Maid Salary' }
];

const AFFINITY_SQUAD = [
  { name: 'Alex M.', affinity: 86, tag: 'Meal Sharing Twin', dinnersShared: 14, spentTogether: 9400, avatar: 'A' },
  { name: 'Sam K.', affinity: 74, tag: 'Flatmate Co-Host', dinnersShared: 8, spentTogether: 6800, avatar: 'S' },
  { name: 'Priya R.', affinity: 68, tag: 'Quick Settler', dinnersShared: 6, spentTogether: 4200, avatar: 'P' }
];

export default function SpendingUniverseView() {
  const { formatAmount } = useTheme();
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[0]);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('universe'); // 'universe' | 'flow' | 'affinity'

  const totalCosmicSpend = PLANETS.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Cosmic Financial Simulation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              3D Spending Universe & Money Flow
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Watch expenses orbit as celestial bodies and simulate live peer-to-peer money particle streams.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10">
            {['universe', 'flow', 'affinity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'universe' ? '3D Universe' : tab === 'flow' ? 'Money Flow' : 'Friendship Graph'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: 3D SPENDING UNIVERSE */}
      {activeTab === 'universe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cosmic Planetary Canvas */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
            <div className="absolute top-4 left-4 z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Mass
              </span>
              <span className="text-xl font-black font-mono text-cyan-400">
                {formatAmount(totalCosmicSpend)}
              </span>
            </div>

            {/* Simulated Celestial Canvas */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              {/* Central Core Star (You / Net Worth) */}
              <div className="relative z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.8)] animate-pulse">
                <span className="text-white font-black text-xs">CORE</span>
              </div>

              {/* Orbit Rings & Orbiting Planets */}
              {PLANETS.map((planet) => {
                const isSelected = selectedPlanet.id === planet.id;
                return (
                  <div
                    key={planet.id}
                    className="absolute rounded-full border border-dashed border-slate-700/60 pointer-events-none celestial-orbit"
                    style={{
                      width: `${planet.orbitRadius * 2}px`,
                      height: `${planet.orbitRadius * 2}px`,
                      animationDuration: planet.speed
                    }}
                  >
                    {/* Planet Body positioned at top of orbit */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanet(planet);
                      }}
                      style={{
                        width: `${planet.size}px`,
                        height: `${planet.size}px`,
                        backgroundColor: planet.color,
                        boxShadow: `0 0 20px ${planet.color}`
                      }}
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full cursor-pointer pointer-events-auto flex items-center justify-center text-xs transition-transform hover:scale-125 ${
                        isSelected ? 'ring-4 ring-white scale-125' : ''
                      }`}
                      title={`${planet.name} - ₹${planet.amount}`}
                    >
                      <span className="text-[10px]">{planet.icon}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400 mt-4">
              Tip: Click any orbiting planet to view category gravitational mass
            </span>
          </div>

          {/* Selected Planet Intelligence */}
          <div className="lg:col-span-4 glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                  style={{ backgroundColor: `${selectedPlanet.color}25`, border: `1px solid ${selectedPlanet.color}50` }}
                >
                  {selectedPlanet.icon}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedPlanet.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Orbit Velocity: {selectedPlanet.speed}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Category Mass (Spending)
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {formatAmount(selectedPlanet.amount)}
                </span>
                <span className="text-xs text-cyan-400 block">
                  {Math.round((selectedPlanet.amount / totalCosmicSpend) * 100)}% of your celestial expenditure
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Transactions in this category form natural planetary gravitational clusters. Money velocity slows as settlements are confirmed.
              </p>
            </div>

            <button
              onClick={() => alert(`Navigating to ${selectedPlanet.name} expenses feed`)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              Explore Planet Moons (Transactions)
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: MONEY FLOW SIMULATION */}
      {activeTab === 'flow' && (
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Money Flow Particle Simulation
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing optimal currency transfer streams between group members
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              3 Streams Active
            </span>
          </div>

          {/* Flow visual cards */}
          <div className="space-y-3">
            {MONEY_FLOWS.map((flow, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between relative overflow-hidden"
              >
                {/* Debtor */}
                <div className="flex items-center space-x-3 z-10">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">
                    {flow.from.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                      {flow.from}
                    </span>
                    <span className="text-[10px] text-slate-400">Debtor</span>
                  </div>
                </div>

                {/* Animated Flow Arrow & Amount */}
                <div className="flex-1 max-w-xs mx-4 text-center z-10">
                  <span className="font-black font-mono text-sm sm:text-base text-emerald-400 block">
                    ₹{flow.amount}
                  </span>
                  <div className="relative h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-400">{flow.category}</span>
                </div>

                {/* Creditor */}
                <div className="flex items-center space-x-3 z-10">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block text-right">
                      {flow.to}
                    </span>
                    <span className="text-[10px] text-slate-400 block text-right">Recipient</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {flow.to.charAt(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: FRIENDSHIP SPENDING & AFFINITY GRAPH */}
      {activeTab === 'affinity' && (
        <div className="glass-card rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Friendship Spending Affinity Graph
              </h3>
              <p className="text-xs text-slate-400">
                Reveals who you share the most meals, cabs, and roadtrips with
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              Squad Metrics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AFFINITY_SQUAD.map((member, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black flex items-center justify-center">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {member.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                        {member.tag}
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-black font-mono text-cyan-400">
                    {member.affinity}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Dinners & Meals Shared:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{member.dinnersShared} meals</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Total Shared Outlay:</span>
                    <span className="font-bold font-mono text-emerald-400">{formatAmount(member.spentTogether)}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    style={{ width: `${member.affinity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
