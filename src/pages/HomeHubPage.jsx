import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Home,
  RotateCw,
  Sparkles,
  Zap,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  Wrench,
  Flame,
  Wifi,
  ChevronRight,
  Plus,
  RefreshCw,
  ArrowRight,
  Award,
  ShieldCheck,
  FileText,
  X,
  QrCode,
  Copy,
  Check,
  Printer,
  Phone,
  CreditCard,
  Trash2,
  Edit3,
  Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HomeHubPage({ defaultTab = 'chores', onOpenExpenseModal }) {
  const { formatAmount } = useTheme();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Active Tab: 'chores' | 'rent-utilities' | 'staff' | 'appliances'
  const urlTab = searchParams.get('tab');
  const initialActiveTab = (urlTab === 'staff' || urlTab === 'maid') ? 'staff' : (urlTab || defaultTab || 'chores');
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'staff' || t === 'maid') {
      setActiveTab('staff');
    } else if (t) {
      setActiveTab(t);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab]);

  // Modal & Notification States for Staff Payroll
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Housekeeping & Mopping',
    baseSalary: 4500,
    totalWorkingDays: 26,
    upiId: '',
    phone: '+91 ',
    advance: 0
  });
  const [payModalStaff, setPayModalStaff] = useState(null);
  const [salarySlipStaff, setSalarySlipStaff] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(null);

  // Flat details
  const [flatName, setFlatName] = useState('Flat 402, Silicon Heights');
  const [roommates, setRoommates] = useState([
    { id: 1, name: user?.name || 'You', avatar: '😎', role: 'Tenant' },
    { id: 2, name: 'Rahul Sharma', avatar: '🚀', role: 'Tenant' },
    { id: 3, name: 'Priya Iyer', avatar: '🌸', role: 'Tenant' },
    { id: 4, name: 'Amit Verma', avatar: '⚡', role: 'Tenant' }
  ]);

  // Chore Roster
  const [chores, setChores] = useState([
    { id: 1, task: 'Dishes & Sink Cleanup', assignee: 'Rahul Sharma', due: 'Tonight, 10 PM', status: 'pending', icon: '🍽️', priority: 'High' },
    { id: 2, task: 'Trash & Wet Waste Disposal', assignee: user?.name || 'You', due: 'Tomorrow, 8 AM', status: 'pending', icon: '🗑️', priority: 'Medium' },
    { id: 3, task: 'Living Room & Balcony Sweep', assignee: 'Priya Iyer', due: 'Saturday, 11 AM', status: 'completed', icon: '🧹', priority: 'Low' },
    { id: 4, task: 'Bathroom Deep Clean', assignee: 'Amit Verma', due: 'Sunday, 4 PM', status: 'pending', icon: '🚿', priority: 'High' },
    { id: 5, task: 'Groceries & 20L Water Can', assignee: 'Rahul Sharma', due: 'Today, 7 PM', status: 'completed', icon: '💧', priority: 'Medium' }
  ]);

  // Chore Penalty Pot
  const [penaltyPot, setPenaltyPot] = useState(350);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Rent & Utilities state
  const [monthlyRent, setMonthlyRent] = useState(36000);
  const [landlordUpi, setLandlordUpi] = useState('sharma.properties@hdfcbank');
  const [rentPaidList, setRentPaidList] = useState({
    1: true,
    2: true,
    3: false,
    4: false
  });

  // Electricity Calculator
  const [unitsConsumed, setUnitsConsumed] = useState(342);
  const [powerDiscom, setPowerDiscom] = useState('BESCOM (Bangalore)');
  const [showSpikeAlert, setShowSpikeAlert] = useState(true);

  // Domestic Staff Payroll with Configurable Monthly Attendance Matrix
  const makeInitialAttendance = (absents = [7, 14, 21], halfs = [18], totalDays = 26) => {
    const map = {};
    for (let i = 1; i <= totalDays; i++) {
      if (absents.includes(i)) map[i] = 'A';
      else if (halfs.includes(i)) map[i] = 'HD';
      else map[i] = 'P';
    }
    return map;
  };

  const [staffList, setStaffList] = useState([
    {
      id: 1,
      name: 'Shanti Bai',
      role: 'Housekeeping & Mopping',
      baseSalary: 4500,
      attendanceDays: 22,
      totalWorkingDays: 26,
      deduction: 519,
      upiId: 'shanti.bai@ybl',
      phone: '+91 98452 11092',
      status: 'Ready for Payment',
      attendanceMap: makeInitialAttendance([7, 14, 21], [18], 26)
    },
    {
      id: 2,
      name: 'Ramesh Cook',
      role: 'North & South Indian Meals',
      baseSalary: 6500,
      attendanceDays: 23.5,
      totalWorkingDays: 25,
      deduction: 390,
      upiId: 'rameshcook99@paytm',
      phone: '+91 97410 88231',
      status: 'Advance ₹1,000 adjusted',
      attendanceMap: makeInitialAttendance([10], [20], 25)
    }
  ]);

  const [selectedStaffAttendance, setSelectedStaffAttendance] = useState(1);

  // Edit total working days for a staff member (e.g. 20, 25, 26, 30 days)
  const handleUpdateTotalDays = (staffId, daysInput) => {
    const numDays = Math.max(1, Math.min(31, parseInt(daysInput) || 26));
    setStaffList(prev =>
      prev.map(staff => {
        if (staff.id !== staffId) return staff;
        const newMap = { ...staff.attendanceMap };
        for (let d = 1; d <= numDays; d++) {
          if (!newMap[d]) newMap[d] = 'P';
        }
        let present = 0;
        let absent = 0;
        let half = 0;
        for (let d = 1; d <= numDays; d++) {
          const val = newMap[d] || 'P';
          if (val === 'P') present++;
          else if (val === 'A') absent++;
          else if (val === 'HD') half++;
        }
        const dayRate = staff.baseSalary / numDays;
        const deduction = Math.round(absent * dayRate + half * (dayRate / 2));
        return {
          ...staff,
          totalWorkingDays: numDays,
          attendanceMap: newMap,
          attendanceDays: present + (half * 0.5),
          deduction
        };
      })
    );
  };

  // Roommate 30-Day Out-of-Town / Away Tracker (Grocery & Mess Rebate)
  const [roommateAwayMap, setRoommateAwayMap] = useState({
    1: [12, 13], // You
    2: [5, 6, 7, 8, 9], // Rahul (5 days in hometown)
    3: [22], // Priya
    4: [] // Amit
  });

  const toggleStaffDay = (staffId, dayNum) => {
    setStaffList(prev =>
      prev.map(staff => {
        if (staff.id !== staffId) return staff;
        const current = staff.attendanceMap[dayNum] || 'P';
        const next = current === 'P' ? 'A' : current === 'A' ? 'HD' : 'P';
        const newMap = { ...staff.attendanceMap, [dayNum]: next };

        const totalDays = staff.totalWorkingDays || 26;
        let present = 0;
        let absent = 0;
        let half = 0;
        for (let d = 1; d <= totalDays; d++) {
          const val = newMap[d] || 'P';
          if (val === 'P') present++;
          else if (val === 'A') absent++;
          else if (val === 'HD') half++;
        }

        const dayRate = staff.baseSalary / totalDays;
        const deduction = Math.round(absent * dayRate + half * (dayRate / 2));

        return {
          ...staff,
          attendanceMap: newMap,
          attendanceDays: present + (half * 0.5),
          deduction
        };
      })
    );
  };

  const toggleRoommateAwayDay = (roommateId, dayNum) => {
    setRoommateAwayMap(prev => {
      const current = prev[roommateId] || [];
      const updated = current.includes(dayNum)
        ? current.filter(d => d !== dayNum)
        : [...current, dayNum];
      return { ...prev, [roommateId]: updated };
    });
  };

  const handleAddStaff = (e) => {
    e?.preventDefault();
    if (!newStaffForm.name.trim() || !newStaffForm.baseSalary) return;
    const newId = Date.now();
    const workDays = Number(newStaffForm.totalWorkingDays) || 26;
    const newStaff = {
      id: newId,
      name: newStaffForm.name.trim(),
      role: newStaffForm.role,
      baseSalary: Number(newStaffForm.baseSalary),
      attendanceDays: workDays,
      totalWorkingDays: workDays,
      deduction: 0,
      upiId: newStaffForm.upiId.trim() || `${newStaffForm.name.toLowerCase().replace(/\s+/g, '')}@upi`,
      phone: newStaffForm.phone.trim() || '+91 98000 00000',
      status: 'Ready for Payment',
      attendanceMap: makeInitialAttendance([], [], workDays)
    };
    setStaffList(prev => [...prev, newStaff]);
    setSelectedStaffAttendance(newId);
    setIsAddStaffOpen(false);
    setNewStaffForm({
      name: '',
      role: 'Housekeeping & Mopping',
      baseSalary: 4500,
      totalWorkingDays: 26,
      upiId: '',
      phone: '+91 ',
      advance: 0
    });
    setPaymentSuccessToast(`Added ${newStaff.name} (${newStaff.role}) with ${workDays}-day schedule!`);
    setTimeout(() => setPaymentSuccessToast(null), 4000);
  };

  const handleDeleteStaff = (staffId) => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;
    if (window.confirm(`Are you sure you want to delete ${staff.name} from payroll?`)) {
      const remaining = staffList.filter(s => s.id !== staffId);
      setStaffList(remaining);
      if (remaining.length > 0) {
        setSelectedStaffAttendance(remaining[0].id);
      } else {
        setSelectedStaffAttendance(null);
      }
      setPaymentSuccessToast(`Removed ${staff.name} from domestic payroll.`);
      setTimeout(() => setPaymentSuccessToast(null), 4000);
    }
  };

  const handleConfirmPayment = (staff) => {
    const netPay = staff.baseSalary - staff.deduction;
    const perPerson = Math.round(netPay / roommates.length);

    if (onOpenExpenseModal) {
      onOpenExpenseModal({
        description: `Salary: ${staff.name} (${staff.role.split(' ')[0]}) - Sep 2026`,
        amount: netPay,
        category: 'Services',
        splitType: 'equal'
      });
    }

    setStaffList(prev =>
      prev.map(s => s.id === staff.id ? { ...s, status: `Paid ${formatAmount(netPay)} via UPI ✓` } : s)
    );
    setPayModalStaff(null);
    setPaymentSuccessToast(`Disbursed ${formatAmount(netPay)} to ${staff.name}! Split of ${formatAmount(perPerson)} each created.`);
    setTimeout(() => setPaymentSuccessToast(null), 5000);
  };

  // Appliance Maintenance
  const [appliances, setAppliances] = useState([
    {
      id: 1,
      name: 'Living Room Daikin 1.5T AC',
      type: 'Cooling',
      lastService: '2026-05-10',
      nextService: 'In 14 Days',
      status: 'Service Recommended',
      health: 82,
      amc: 'Active (Daikin Care)'
    },
    {
      id: 2,
      name: 'Aquaguard Geneus RO Water Purifier',
      type: 'Water',
      lastService: '2026-03-12',
      nextService: 'In 6 Days',
      status: 'Filter Replacement Due',
      health: 64,
      amc: 'Eureka Forbes Plan'
    },
    {
      id: 3,
      name: 'IFB 7kg Front-Load Washing Machine',
      type: 'Laundry',
      lastService: '2026-07-20',
      nextService: 'In 82 Days',
      status: 'Optimal Condition',
      health: 96,
      amc: 'Extended Warranty'
    }
  ]);

  // Calculate Electricity Cost based on slabs
  const calculateElectricityBill = (units) => {
    let total = 0;
    if (units <= 100) {
      total = units * 4.75;
    } else if (units <= 200) {
      total = 100 * 4.75 + (units - 100) * 6.5;
    } else {
      total = 100 * 4.75 + 100 * 6.5 + (units - 200) * 8.2;
    }
    return Math.round(total + 180);
  };

  const electricityTotal = calculateElectricityBill(unitsConsumed);
  const electricityPerPerson = Math.round(electricityTotal / roommates.length);

  // Spin chore wheel function
  const spinChoreWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedWinner(null);
    const spins = 5 + Math.floor(Math.random() * 5);
    const extraAngle = Math.floor(Math.random() * 360);
    const newRot = wheelRotation + (spins * 360) + extraAngle;
    setWheelRotation(newRot);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = roommates[Math.floor(Math.random() * roommates.length)];
      setSelectedWinner(chosen);
    }, 2800);
  };

  // Toggle chore status
  const toggleChore = (choreId) => {
    setChores(prev =>
      prev.map(c =>
        c.id === choreId
          ? { ...c, status: c.status === 'completed' ? 'pending' : 'completed' }
          : c
      )
    );
  };

  // Add missed chore fine to penalty pot
  const addMissedFine = (roommateName) => {
    setPenaltyPot(p => p + 50);
    alert(`₹50 Penalty levied against ${roommateName} for missed chore! Added to Group Pizza/Party Pot (Total: ₹${penaltyPot + 50})`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 border border-blue-500/30 text-blue-300 mb-2">
              <Home className="w-3.5 h-3.5" />
              Roommate Operating System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              🏠 {flatName}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Chore wheel, rent & utility anomaly detector, domestic staff payroll, and appliance care.
            </p>
          </div>

          {/* Quick Roommate Avatars & Penalty Pot Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="text-2xl">🍕</div>
              <div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Missed Chore Pot</div>
                <div className="text-lg font-black text-white">{formatAmount(penaltyPot)}</div>
              </div>
            </div>

            <div className="flex -space-x-2 overflow-hidden py-1">
              {roommates.map(r => (
                <span
                  key={r.id}
                  title={`${r.name} (${r.role})`}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border-2 border-indigo-500/50 text-base shadow"
                >
                  {r.avatar}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-700/40 mt-6 no-scrollbar">
          {[
            { id: 'chores', label: 'Chore Wheel & Roster', icon: RotateCw },
            { id: 'rent-utilities', label: 'Rent & Smart Utilities', icon: Zap },
            { id: 'staff', label: 'Maid & Cook Payroll', icon: UserCheck },
            { id: 'appliances', label: 'Appliance Care & AMC', icon: Wrench }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'animate-spin-slow' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CHORE WHEEL & ROSTER */}
      {activeTab === 'chores' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Chore Wheel */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5" /> Duty Roulette
              </span>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Fair & Unbiased
              </span>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              {/* Wheel Center Pointer */}
              <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-md" />

              {/* Animated Rotating Wheel Graphic */}
              <div
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 2.8s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
                }}
                className="w-56 h-56 rounded-full border-4 border-indigo-500/40 relative shadow-2xl flex items-center justify-center bg-gradient-to-tr from-slate-950 via-indigo-950 to-purple-950"
              >
                {roommates.map((r, idx) => {
                  const angle = (360 / roommates.length) * idx;
                  return (
                    <div
                      key={r.id}
                      style={{
                        transform: `rotate(${angle}deg) translateY(-85px)`
                      }}
                      className="absolute flex flex-col items-center"
                    >
                      <span className="text-2xl drop-shadow">{r.avatar}</span>
                      <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 rounded mt-0.5 whitespace-nowrap">
                        {r.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
                <div className="w-16 h-16 rounded-full bg-indigo-600 border-4 border-slate-900 flex items-center justify-center text-white font-black text-xs shadow-inner">
                  SPIN
                </div>
              </div>
            </div>

            {selectedWinner && (
              <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl w-full mb-4 animate-bounce">
                <p className="text-xs text-indigo-300 font-semibold">🎉 Wheel of Duty Decision:</p>
                <p className="text-base font-extrabold text-white mt-0.5">
                  {selectedWinner.name} gets the next chore!
                </p>
              </div>
            )}

            <div className="w-full space-y-2">
              <button
                onClick={spinChoreWheel}
                disabled={isSpinning}
                className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? 'Spinning the Wheel...' : '🎲 Spin For Next Unassigned Chore'}
              </button>
              <p className="text-[11px] text-slate-400">
                Rotates duties automatically every Sunday midnight if enabled.
              </p>
            </div>
          </div>

          {/* Chore Roster & Penalty Pot Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📋</span> This Week's Roommate Duties
              </h2>
              <span className="text-xs text-slate-400">
                {chores.filter(c => c.status === 'completed').length} of {chores.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {chores.map(chore => {
                const isDone = chore.status === 'completed';
                return (
                  <div
                    key={chore.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : 'bg-slate-900/70 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => toggleChore(chore.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{chore.icon}</span>
                          <span className={`text-sm font-semibold text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {chore.task}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="text-indigo-400 font-medium">{chore.assignee}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" /> {chore.due}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isDone && (
                        <button
                          onClick={() => addMissedFine(chore.assignee)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          title="Levy ₹50 fine for missing deadline"
                        >
                          +₹50 Fine
                        </button>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isDone ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Penalty Pot Info Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍕</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">Missed Chore Reward Fund: {formatAmount(penaltyPot)}</h4>
                  <p className="text-xs text-amber-400/80">Every missed chore adds ₹50. When it hits ₹1,000, flatmates get free pizza!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  alert('Added ₹350 Pizza party credit into flatmate split expense!');
                  setPenaltyPot(0);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
              >
                Claim Pot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RENT & SMART UTILITIES */}
      {activeTab === 'rent-utilities' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Rent Manager */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Monthly Rent Split</h3>
                  <p className="text-xs text-slate-400">Due on 5th of every month</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {formatAmount(monthlyRent)} / mo
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Landlord UPI VPA</span>
                <span className="font-mono text-indigo-400">{landlordUpi}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Individual Share (1/{roommates.length})</span>
                <span className="font-bold text-white text-sm">{formatAmount(Math.round(monthlyRent / roommates.length))}</span>
              </div>
            </div>

            {/* Payment status per roommate */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tenant Payment Status</h4>
              {roommates.map(r => {
                const paid = rentPaidList[r.id];
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{r.avatar}</span>
                      <div>
                        <div className="text-xs font-semibold text-white">{r.name}</div>
                        <div className="text-[11px] text-slate-400">{formatAmount(Math.round(monthlyRent / roommates.length))}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setRentPaidList(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        paid
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                      }`}
                    >
                      {paid ? '✓ Paid' : 'Pending'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => alert(`Initiating direct UPI Payment of ${formatAmount(monthlyRent / roommates.length)} to ${landlordUpi}...`)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Pay Rent Via Selected Primary UPI
            </button>
          </div>

          {/* Electricity Meter Slab Calculator with Anomaly Detector */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Electricity Slab & Spike AI</h3>
                  <p className="text-xs text-slate-400">{powerDiscom}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                {unitsConsumed} kWh
              </span>
            </div>

            {/* Spike Anomaly Alert */}
            {showSpikeAlert && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 relative">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-amber-300">Utility Spike Anomaly Detected!</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Power consumption is <strong className="text-amber-300">+38% higher</strong> than last month. SplitVerse AI detected that AC units operated for ~182 hours vs 114 hours last month.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Units slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Meter Reading (Units Consumed)</span>
                <span className="font-bold text-amber-400">{unitsConsumed} Units</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                value={unitsConsumed}
                onChange={e => setUnitsConsumed(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>100 units (Low)</span>
                <span>400 units (Avg)</span>
                <span>800 units (Heavy AC)</span>
              </div>
            </div>

            {/* Calculated Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Calculated Discom Bill</span>
                <span className="font-bold text-white">{formatAmount(electricityTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Split Across {roommates.length} Flatmates</span>
                <span className="font-extrabold text-amber-400">{formatAmount(electricityPerPerson)} / person</span>
              </div>
              <div className="pt-2 border-t border-slate-700/50 flex justify-between text-[11px] text-slate-400">
                <span>WiFi (Airtel Xstream 200Mbps)</span>
                <span>₹999 (₹250/p)</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Piped Gas (Mahanagar/Adani)</span>
                <span>₹640 (₹160/p)</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Electricity bill of ${formatAmount(electricityTotal)} automatically queued as group expense with equal split!`)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 transition-all shadow-md"
            >
              Add Electricity Bill to Group Expense
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DOMESTIC STAFF PAYROLL */}
      {activeTab === 'staff' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🧹</span> Cook, Maid & Help Payroll
              </h2>
              <p className="text-xs text-slate-400">
                Track daily attendance, calculate leave deductions, and split salaries automatically.
              </p>
            </div>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" /> Add Staff Member
            </button>
          </div>

          {/* Interactive 30-Day Attendance Grid for Selected Staff */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 30-Day Monthly Attendance Sheet (Click any day to toggle)
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Daily Attendance Matrix • Month of September 2026
                </h3>
              </div>

              {/* Staff Member Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                {staffList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaffAttendance(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      selectedStaffAttendance === s.id
                        ? 'bg-indigo-600 text-white border-transparent shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    {s.name} ({s.role.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Current Selected Staff Matrix */}
            {staffList.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-2xl">
                  🧹
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No Domestic Staff on Payroll</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add your maid, cook, or cleaning helper to track custom attendance (20/25/30 days) and disburse salaries via UPI.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Domestic Staff
                </button>
              </div>
            ) : (() => {
              const staff = staffList.find(s => s.id === selectedStaffAttendance) || staffList[0];
              const totalDays = staff.totalWorkingDays || 26;
              const netPay = staff.baseSalary - staff.deduction;
              const perPerson = Math.round(netPay / roommates.length);

              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-sm text-white">{staff.name}</h4>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          title="Delete Maid / Staff Member"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Maid</span>
                        </button>
                      </div>
                      <span className="text-xs text-indigo-400">{staff.role} • Base: {formatAmount(staff.baseSalary)}</span>
                    </div>

                    {/* Edit Total Working Days (e.g. 20 or 25 days only in a month) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                      <span className="text-[11px] font-semibold text-slate-300">Total Month Days:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {[20, 25, 26, 30].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleUpdateTotalDays(staff.id, d)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                              totalDays === d
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                        <div className="flex items-center gap-1 pl-1">
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={totalDays}
                            onChange={(e) => handleUpdateTotalDays(staff.id, e.target.value)}
                            className="w-12 px-1.5 py-0.5 text-[11px] font-bold text-center bg-slate-950 border border-slate-700 rounded text-emerald-400 focus:outline-none focus:border-indigo-500"
                            title="Edit custom working days (e.g. 20 or 25)"
                          />
                          <span className="text-[10px] text-slate-400">days</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Days Worked</span>
                        <span className="font-extrabold text-emerald-400">{staff.attendanceDays} / {totalDays} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Leave Cuts</span>
                        <span className="font-extrabold text-rose-400">-{formatAmount(staff.deduction)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Net Salary</span>
                        <span className="font-black text-white text-sm">{formatAmount(netPay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Configurable Attendance Grid (e.g. 1 to 20 or 25 or 30 days) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>Click to cycle: <strong className="text-emerald-400">P (Present)</strong> ➔ <strong className="text-rose-400">A (Absent)</strong> ➔ <strong className="text-amber-400">HD (Half-Day)</strong></span>
                      <span className="font-mono">Daily Rate: ₹{Math.round(staff.baseSalary / totalDays)}/day ({totalDays} days schedule)</span>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
                      {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                        const status = staff.attendanceMap?.[day] || 'P';
                        return (
                          <button
                            key={day}
                            onClick={() => toggleStaffDay(staff.id, day)}
                            className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                              status === 'P'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                : status === 'A'
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                            }`}
                          >
                            <span className="text-[10px] text-slate-400">Day {day}</span>
                            <span className="font-black text-xs mt-0.5">
                              {status === 'P' ? '✓ P' : status === 'A' ? '✕ A' : '½ HD'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setSalarySlipStaff(staff)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Download Monthly Salary Slip</span>
                    </button>
                    <button
                      onClick={() => setPayModalStaff(staff)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay {formatAmount(netPay)} Via UPI & Split</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Roommate 30-Day Hometown / Away Attendance Matrix */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Roommate Hometown / Out-of-Town Roster
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  30-Day Flatmate Presence & Grocery Rebate Adjuster
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Rebate: ₹80/day credited for days away from flat
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roommates.map(roommate => {
                const awayDays = roommateAwayMap[roommate.id] || [];
                const rebate = awayDays.length * 80;

                return (
                  <div key={roommate.id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{roommate.avatar}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{roommate.name}</h4>
                          <span className="text-xs text-slate-400">
                            {awayDays.length > 0 ? `${awayDays.length} days away from flat` : 'Stayed whole month'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block">Grocery Rebate</span>
                        <span className="text-sm font-extrabold text-amber-400">
                          {rebate > 0 ? `-${formatAmount(rebate)}` : '₹0'}
                        </span>
                      </div>
                    </div>

                    {/* Quick days away chips */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-slate-400 mr-1">Away on:</span>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                        const isAway = awayDays.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleRoommateAwayDay(roommate.id, day)}
                            className={`w-6 h-6 rounded-md text-[10px] font-bold transition ${
                              isAway
                                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                            }`}
                            title={`Day ${day}: ${isAway ? 'Away from flat' : 'At flat'}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APPLIANCE CARE & AMC */}
      {activeTab === 'appliances' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔧</span> Appliance Maintenance & AMC Tracker
              </h2>
              <p className="text-xs text-slate-400">
                Prevent emergency breakdowns with scheduled service countdowns and shared repair funds.
              </p>
            </div>
            <button
              onClick={() => alert('Log appliance service')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Log Appliance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {appliances.map(item => (
              <div
                key={item.id}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {item.type}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Health Score</span>
                      <span className={`font-bold ${item.health > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.health}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.health > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.health}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Due:</span>
                      <span className="font-semibold text-amber-400">{item.nextService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AMC Status:</span>
                      <span className="text-slate-300">{item.amc}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Booking verified technician for ${item.name}...`)}
                  className="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Book AMC Service
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUCCESS TOAST BANNER */}
      {paymentSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-2xl flex items-center gap-3 animate-bounce border-2 border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <span>{paymentSuccessToast}</span>
        </div>
      )}

      {/* 1. ADD DOMESTIC STAFF MODAL */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">Add Domestic Staff Member</h3>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geeta Devi / Sunita Bai"
                  value={newStaffForm.name}
                  onChange={e => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Services</label>
                <select
                  value={newStaffForm.role}
                  onChange={e => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Housekeeping & Mopping">Housekeeping & Mopping</option>
                  <option value="North & South Indian Meals (Cook)">North & South Indian Meals (Cook)</option>
                  <option value="Utensils & Kitchen Cleaning">Utensils & Kitchen Cleaning</option>
                  <option value="Clothes Washing & Ironing">Clothes Washing & Ironing</option>
                  <option value="Full Day All-Rounder Caretaker">Full Day All-Rounder Caretaker</option>
                  <option value="Driver & Car Cleaning">Driver & Car Cleaning</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    min="500"
                    step="100"
                    placeholder="4500"
                    value={newStaffForm.baseSalary}
                    onChange={e => setNewStaffForm({ ...newStaffForm, baseSalary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. geeta@okaxis"
                    value={newStaffForm.upiId}
                    onChange={e => setNewStaffForm({ ...newStaffForm, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expected Monthly Working Days (e.g. 20 or 25 Days)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    {[20, 25, 26, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setNewStaffForm({ ...newStaffForm, totalWorkingDays: d })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          Number(newStaffForm.totalWorkingDays) === d
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Custom"
                    value={newStaffForm.totalWorkingDays || ''}
                    onChange={e => setNewStaffForm({ ...newStaffForm, totalWorkingDays: e.target.value })}
                    className="w-20 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-bold text-center focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98450 12345"
                  value={newStaffForm.phone}
                  onChange={e => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                <span>Split across {roommates.length} flatmates:</span>
                <strong className="text-white font-mono text-sm">
                  {formatAmount(Math.round((newStaffForm.baseSalary || 0) / roommates.length))}/mo each
                </strong>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PAY SALARY VIA UPI & SPLIT MODAL */}
      {payModalStaff && (() => {
        const netPay = payModalStaff.baseSalary - payModalStaff.deduction;
        const perPerson = Math.round(netPay / roommates.length);
        const upiPayUrl = `upi://pay?pa=${encodeURIComponent(payModalStaff.upiId)}&pn=${encodeURIComponent(payModalStaff.name)}&am=${netPay}&cu=INR&tn=Salary%20Disbursal%20Sep%202026`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Domestic Staff Disbursal</span>
                  <h3 className="font-black text-lg text-white">Pay Salary & Split with Flatmates</h3>
                </div>
                <button
                  onClick={() => setPayModalStaff(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Staff Card & Net Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{payModalStaff.name}</h4>
                    <p className="text-xs text-indigo-400">{payModalStaff.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Net Disbursal</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{formatAmount(netPay)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/50 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Base Salary</span>
                    <span className="font-bold text-slate-200">{formatAmount(payModalStaff.baseSalary)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Leave Cuts</span>
                    <span className="font-bold text-rose-400">-{formatAmount(payModalStaff.deduction)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-300 block font-bold">Split Per Flatmate</span>
                    <span className="font-black text-white">{formatAmount(perPerson)}</span>
                  </div>
                </div>
              </div>

              {/* UPI Details & Dynamic QR Code */}
              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/60 flex flex-col items-center text-center space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" /> Scan QR with any UPI App
                </span>

                <div className="p-3 bg-white rounded-2xl shadow-lg inline-block">
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-36 h-36 mx-auto rounded-lg"
                  />
                </div>

                <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                  <div className="text-left font-mono truncate mr-2">
                    <span className="text-[10px] text-slate-400 block">Staff UPI VPA</span>
                    <span className="text-white font-bold">{payModalStaff.upiId}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(payModalStaff.upiId);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-[11px] flex items-center gap-1 shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <a
                  href={upiPayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <span>📱 Open UPI App Directly (GPay / PhonePe / Paytm)</span>
                </a>

                <button
                  onClick={() => handleConfirmPayment(payModalStaff)}
                  className="w-full py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Confirm Payment & Record Group Expense Split (₹{perPerson}/person)</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. OFFICIAL SALARY SLIP MODAL */}
      {salarySlipStaff && (() => {
        const netPay = salarySlipStaff.baseSalary - salarySlipStaff.deduction;
        const perPerson = Math.round(netPay / roommates.length);

        let presentCount = 0;
        let absentCount = 0;
        let halfCount = 0;
        for (let d = 1; d <= 30; d++) {
          const s = salarySlipStaff.attendanceMap?.[d] || 'P';
          if (s === 'P') presentCount++;
          else if (s === 'A') absentCount++;
          else if (s === 'HD') halfCount++;
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-extrabold text-base">Domestic Worker Salary Slip</h3>
                </div>
                <button
                  onClick={() => setSalarySlipStaff(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Payslip Card */}
              <div id="printable-salary-slip" className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 space-y-4 font-mono text-xs">
                <div className="text-center border-b border-slate-800 pb-3">
                  <h2 className="text-base font-black tracking-wider text-white">DOMESTIC STAFF SALARY DISBURSAL VOUCHER</h2>
                  <p className="text-[11px] text-slate-400">{flatName} • Month: September 2026</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Worker Name:</span>
                    <strong className="text-white text-sm">{salarySlipStaff.name}</strong>
                    <div className="text-indigo-400">{salarySlipStaff.role}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">UPI VPA:</span>
                    <strong className="text-white">{salarySlipStaff.upiId}</strong>
                    <div className="text-slate-400">Phone: {salarySlipStaff.phone}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-300 mb-1 uppercase text-[10px] tracking-wider">Attendance Breakdown (30-Day Matrix)</div>
                  <div className="flex justify-between">
                    <span>Days Present:</span>
                    <strong className="text-emerald-400">{presentCount} Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Absent:</span>
                    <strong className="text-rose-400">{absentCount} Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Half-Days:</span>
                    <strong className="text-amber-400">{halfCount} Days</strong>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-b border-slate-800 py-3">
                  <div className="flex justify-between">
                    <span>Agreed Monthly Base Salary:</span>
                    <strong className="text-white">{formatAmount(salarySlipStaff.baseSalary)}</strong>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Attendance Leave Deductions:</span>
                    <strong>-{formatAmount(salarySlipStaff.deduction)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Advance / Adjustments:</span>
                    <strong>₹0</strong>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-slate-800/80">
                    <span>NET SALARY DISBURSED:</span>
                    <span className="text-base">{formatAmount(netPay)}</span>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1.5">Employer Flatmates Shared Disbursal</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {roommates.map(r => (
                      <div key={r.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 truncate">{r.name}</div>
                        <div className="font-bold text-amber-400 mt-0.5">{formatAmount(perPerson)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 text-center">
                  SplitVerse AI Verified Payroll Certificate • Ref #{salarySlipStaff.id}-202609
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
                </button>
                <button
                  onClick={() => setSalarySlipStaff(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
