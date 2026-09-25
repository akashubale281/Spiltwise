import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  MapPin,
  Sparkles,
  Zap,
  TrendingDown,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Tag,
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertCircle,
  Share2,
  RefreshCw,
  Percent,
  TrendingUp,
  SlidersHorizontal,
  Layers,
  ChefHat,
  Box
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const QUICK_COMMERCE_PLATFORMS = [
  { id: 'zepto', name: 'Zepto', eta: '8-10 min', fee: 0, platformFee: 2, color: 'from-purple-600 to-indigo-700', badge: 'Fastest' },
  { id: 'instamart', name: 'Swiggy Instamart', eta: '10-12 min', fee: 15, platformFee: 3, color: 'from-orange-500 to-amber-600', badge: 'Cheapest Deals' },
  { id: 'blinkit', name: 'Blinkit', eta: '11-13 min', fee: 16, platformFee: 3, color: 'from-yellow-400 to-amber-500', badge: 'High Stock' },
  { id: 'bigbasket', name: 'BB Now', eta: '15-20 min', fee: 0, platformFee: 0, color: 'from-emerald-600 to-teal-700', badge: 'Best Value' },
  { id: 'jiomart', name: 'JioMart Quick', eta: '25-30 min', fee: 0, platformFee: 0, color: 'from-blue-600 to-cyan-700', badge: 'Lowest Bulk Price' },
  { id: 'flipkart', name: 'Flipkart Minutes', eta: '12-15 min', fee: 10, platformFee: 2, color: 'from-sky-500 to-blue-600', badge: 'New Offers' },
  { id: 'dmart', name: 'DMart Ready', eta: 'Today 4 PM', fee: 0, platformFee: 0, color: 'from-green-600 to-emerald-800', badge: 'Maximum Discount' },
  { id: 'amazon', name: 'Amazon Fresh', eta: '2 Hours', fee: 25, platformFee: 0, color: 'from-amber-600 to-orange-700', badge: 'Prime Free' }
];

const CATALOG = [
  {
    id: 1,
    name: 'Amul Butter 500g',
    category: 'Dairy',
    image: '🧈',
    prices: {
      zepto: 256,
      instamart: 247,
      blinkit: 269,
      bigbasket: 258,
      jiomart: 242,
      flipkart: 250,
      dmart: 238,
      amazon: 260
    },
    history: [265, 260, 255, 252, 247]
  },
  {
    id: 2,
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    category: 'Staples',
    image: '🌾',
    prices: {
      zepto: 289,
      instamart: 295,
      blinkit: 285,
      bigbasket: 279,
      jiomart: 265,
      flipkart: 280,
      dmart: 259,
      amazon: 284
    },
    history: [310, 305, 295, 289, 279]
  },
  {
    id: 3,
    name: 'Fresh Farm Eggs (Pack of 6)',
    category: 'Dairy & Eggs',
    image: '🥚',
    prices: {
      zepto: 49,
      instamart: 48,
      blinkit: 54,
      bigbasket: 52,
      jiomart: 50,
      flipkart: 51,
      dmart: 46,
      amazon: 55
    },
    history: [58, 55, 52, 50, 48]
  },
  {
    id: 4,
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    category: 'Staples',
    image: '🌻',
    prices: {
      zepto: 142,
      instamart: 139,
      blinkit: 145,
      bigbasket: 138,
      jiomart: 132,
      flipkart: 140,
      dmart: 128,
      amazon: 144
    },
    history: [155, 150, 145, 140, 138]
  },
  {
    id: 5,
    name: 'Nandini GoodLife Milk 500ml',
    category: 'Dairy',
    image: '🥛',
    prices: {
      zepto: 28,
      instamart: 29,
      blinkit: 28,
      bigbasket: 27,
      jiomart: 27,
      flipkart: 28,
      dmart: 26,
      amazon: 30
    },
    history: [30, 30, 29, 28, 27]
  },
  {
    id: 6,
    name: 'Maggi 2-Minute Noodles 280g (4 Pack)',
    category: 'Snacks',
    image: '🍜',
    prices: {
      zepto: 56,
      instamart: 54,
      blinkit: 58,
      bigbasket: 55,
      jiomart: 52,
      flipkart: 55,
      dmart: 49,
      amazon: 58
    },
    history: [60, 58, 56, 55, 54]
  }
];

export default function ShoppingHubPage() {
  const { formatAmount } = useTheme();

  // Full Address Management State
  const DEFAULT_SAVED_ADDRESSES = [
    {
      id: 1,
      label: 'Home',
      flat: 'Flat 402, 4th Floor',
      society: 'Silicon Heights Residency',
      landmark: 'Near Indiranagar 100ft Rd Metro',
      city: 'Indiranagar, Bengaluru',
      pincode: '560038',
      tag: 'Default',
      fastestApp: 'Zepto (8 mins)'
    },
    {
      id: 2,
      label: 'Work / Office',
      flat: 'Desk 42, 3rd Floor',
      society: 'WeWork Galaxy',
      landmark: 'Opposite Ritz Carlton',
      city: 'Residency Road, Bengaluru',
      pincode: '560025',
      tag: 'Office',
      fastestApp: 'Blinkit (9 mins)'
    },
    {
      id: 3,
      label: 'Roommate PG',
      flat: 'Room 214, Block B',
      society: 'St. Joseph Hostel',
      landmark: 'Near Jyoti Nivas College',
      city: 'Koramangala 5th Block',
      pincode: '560095',
      tag: 'Hostel',
      fastestApp: 'Instamart (10 mins)'
    }
  ];

  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('splitverse_shopping_addresses');
    return saved ? JSON.parse(saved) : DEFAULT_SAVED_ADDRESSES;
  });
  const [activeAddressId, setActiveAddressId] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Address Form Fields
  const [newLabel, setNewLabel] = useState('Home');
  const [newFlat, setNewFlat] = useState('');
  const [newSociety, setNewSociety] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPincode, setNewPincode] = useState('560038');

  const currentAddress = savedAddresses.find(a => a.id === activeAddressId) || savedAddresses[0];

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newFlat.trim() || !newSociety.trim() || !newPincode.trim()) return;

    const newAddr = {
      id: Date.now(),
      label: newLabel,
      flat: newFlat.trim(),
      society: newSociety.trim(),
      landmark: newLandmark.trim(),
      city: newCity.trim(),
      pincode: newPincode.trim(),
      tag: 'Custom',
      fastestApp: 'Blinkit (10 mins)'
    };

    const updated = [newAddr, ...savedAddresses];
    setSavedAddresses(updated);
    setActiveAddressId(newAddr.id);
    localStorage.setItem('splitverse_shopping_addresses', JSON.stringify(updated));
    setShowAddForm(false);
    setShowAddressModal(false);
    setNewFlat('');
    setNewSociety('');
    setNewLandmark('');
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    if (savedAddresses.length <= 1) return;
    const remaining = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(remaining);
    if (activeAddressId === id) {
      setActiveAddressId(remaining[0].id);
    }
    localStorage.setItem('splitverse_shopping_addresses', JSON.stringify(remaining));
  };

  // Search & Products
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(CATALOG[0]);

  // Cart & Optimizer
  const [cart, setCart] = useState([
    { product: CATALOG[0], qty: 1, roommate: 'You' },
    { product: CATALOG[2], qty: 2, roommate: 'Alex' },
    { product: CATALOG[4], qty: 2, roommate: 'Sam' }
  ]);

  // AI Recipe to Cart state
  const [recipeInput, setRecipeInput] = useState('');
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeSuccess, setRecipeSuccess] = useState('');

  // Cart Optimization Calculations
  const calculateSingleAppTotal = (appId) => {
    return cart.reduce((acc, item) => {
      const price = item.product.prices[appId] || 0;
      return acc + price * item.qty;
    }, 0);
  };

  const calculateOptimizedCart = () => {
    let optimizedTotal = 0;
    const itemAssignments = cart.map((item) => {
      let cheapestApp = 'zepto';
      let minPrice = Infinity;
      Object.keys(item.product.prices).forEach((appId) => {
        if (item.product.prices[appId] < minPrice) {
          minPrice = item.product.prices[appId];
          cheapestApp = appId;
        }
      });
      optimizedTotal += minPrice * item.qty;
      return {
        item: item.product.name,
        qty: item.qty,
        app: cheapestApp,
        price: minPrice * item.qty,
        roommate: item.roommate
      };
    });

    const blinkitTotal = calculateSingleAppTotal('blinkit');
    const savings = Math.max(0, blinkitTotal - optimizedTotal);

    return {
      optimizedTotal,
      blinkitTotal,
      savings,
      itemAssignments
    };
  };

  const optimizedData = calculateOptimizedCart();

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, roommate: 'You' }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleRecipeToCart = () => {
    if (!recipeInput.trim()) return;
    setRecipeLoading(true);
    setRecipeSuccess('');

    setTimeout(() => {
      // Add recipe items to cart
      setCart((prev) => [
        ...prev,
        { product: CATALOG[1], qty: 1, roommate: 'All' },
        { product: CATALOG[3], qty: 1, roommate: 'All' }
      ]);
      setRecipeLoading(false);
      setRecipeSuccess(`Ingredients for "${recipeInput}" matched across Blinkit & Zepto and added to cart!`);
      setRecipeInput('');
      setTimeout(() => setRecipeSuccess(''), 4000);
    }, 900);
  };

  const handleSplitToGroup = () => {
    alert(`Converted grocery cart (Total: ₹${optimizedData.optimizedTotal}) into a SplitVerse group expense! Roommates notified.`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Futuristic Super-Hub Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Quick-Commerce Intelligence Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Smart Shopping Hub & Cart Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Compare prices, live dark store stock & delivery ETAs across Blinkit, Zepto, Instamart, BigBasket, JioMart, Flipkart & DMart.
            </p>
          </div>

          {/* Savings Badge */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center shrink-0 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Smart Split Savings
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1 block">
              ₹{optimizedData.savings}
            </span>
            <span className="text-[10px] text-slate-300">vs single-store checkout</span>
          </div>
        </div>
      </div>

      {/* Feature 1: Advanced Address Management & Dark Store Grid */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {currentAddress.label}
              </span>
              <span className="text-xs text-slate-400">
                ⚡ Fastest: <strong className="text-emerald-400">{currentAddress.fastestApp}</strong>
              </span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block mt-0.5">
              {currentAddress.flat}, {currentAddress.society}, {currentAddress.city} - {currentAddress.pincode}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Select / Add Address</span>
          </button>
        </div>
      </div>

      {/* Address Selection & Management Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Delivery Addresses & Dark Store Hubs</h3>
              </div>
              <button
                onClick={() => { setShowAddressModal(false); setShowAddForm(false); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Saved Locations ({savedAddresses.length})
                </span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  {showAddForm ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddForm && (
                <form onSubmit={handleSaveNewAddress} className="p-4 rounded-2xl bg-slate-800/70 border border-cyan-500/30 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Tag</label>
                      <select
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office / Work</option>
                        <option value="Hostel">Hostel / PG</option>
                        <option value="Friends">Friends Flat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Pincode</label>
                      <input
                        type="text"
                        placeholder="e.g. 560038"
                        value={newPincode}
                        onChange={e => setNewPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Flat / House No</label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 302, 3rd Floor"
                        value={newFlat}
                        onChange={e => setNewFlat(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Building / Society</label>
                      <input
                        type="text"
                        placeholder="e.g. Prestige Heights"
                        value={newSociety}
                        onChange={e => setNewSociety(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Area / Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. 12th Main, Indiranagar, Opp. Metro"
                      value={newLandmark}
                      onChange={e => setNewLandmark(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                  >
                    Save & Deliver Here
                  </button>
                </form>
              )}

              {/* Saved Address Cards */}
              <div className="space-y-2.5">
                {savedAddresses.map(addr => {
                  const isSelected = activeAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setActiveAddressId(addr.id);
                        setShowAddressModal(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{addr.label}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                            {addr.pincode}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">⚡ {addr.fastestApp}</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {addr.flat}, {addr.society}
                        </p>
                        {addr.landmark && (
                          <p className="text-[11px] text-slate-400">Near {addr.landmark}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-xs font-bold text-cyan-400">✓ Active</span>
                        )}
                        {savedAddresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature 2: Universal Product Search & Live Comparison Matrix */}
      <div className="glass-card rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Universal Product Price Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Single query returns live prices & delivery times across all 8 apps
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Amul butter, Atta, Eggs..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Product Selector Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {CATALOG.map((prod) => (
            <button
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-2 ${
                selectedProduct.id === prod.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{prod.image}</span>
              <span>{prod.name}</span>
            </button>
          ))}
        </div>

        {/* Live Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-3.5">Quick-Commerce App</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Delivery ETA</th>
                <th className="p-3.5">Delivery Fee</th>
                <th className="p-3.5">Platform Fee</th>
                <th className="p-3.5">Status & Badge</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {QUICK_COMMERCE_PLATFORMS.map((platform) => {
                const price = selectedProduct.prices[platform.id] || 250;
                const isCheapest = price === Math.min(...Object.values(selectedProduct.prices));

                return (
                  <tr
                    key={platform.id}
                    className={`transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                      isCheapest ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${platform.color} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                        >
                          {platform.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {platform.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-black font-mono text-sm text-slate-900 dark:text-white">
                      ₹{price}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{platform.eta}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {platform.fee === 0 ? <span className="text-emerald-500 font-bold">Free</span> : `₹${platform.fee}`}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      ₹{platform.platformFee}
                    </td>
                    <td className="p-3.5">
                      {isCheapest ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Lowest Price
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {platform.badge}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs transition"
                      >
                        + Add to Cart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature 3 & 4: Smart Cart Optimizer & AI Recipe-to-Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Smart Cart Optimizer Bento */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Smart Cart Optimizer (Unique USP)
                </h3>
                <p className="text-xs text-slate-400">
                  AI splits cart items to cheapest dark stores automatically
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
              {cart.length} Items
            </span>
          </div>

          {/* Cart items list */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.product.image}</span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Qty: {item.qty} • Added for: <span className="text-cyan-400 font-semibold">{item.roommate}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-black font-mono text-sm text-slate-900 dark:text-white">
                    ₹{item.product.prices.zepto * item.qty}
                  </span>
                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Option A vs Option B Comparison Bento */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Option A: Single App (Blinkit)
              </span>
              <span className="text-xl font-black font-mono text-slate-700 dark:text-slate-300 block">
                ₹{optimizedData.blinkitTotal}
              </span>
              <span className="text-[10px] text-slate-400">All from 1 delivery</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Option B: Smart Split Optimizer
              </span>
              <span className="text-xl font-black font-mono text-emerald-400 block">
                ₹{optimizedData.optimizedTotal}
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold">
                You save ₹{optimizedData.savings}!
              </span>
            </div>
          </div>

          {/* Split & Create Group Expense Button */}
          <button
            onClick={handleSplitToGroup}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Order & Split Cart into Roommate Group Expense</span>
          </button>
        </div>

        {/* AI Recipe-to-Cart & Smart Pantry */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Recipe to Cart */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  AI Recipe to Cart
                </h3>
                <p className="text-xs text-slate-400">Type a dish to auto-order ingredients</p>
              </div>
            </div>

            {recipeSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{recipeSuccess}</span>
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={recipeInput}
                onChange={(e) => setRecipeInput(e.target.value)}
                placeholder="e.g. 'Butter Chicken for 6' or 'High-protein breakfast'"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
              <button
                onClick={handleRecipeToCart}
                disabled={recipeLoading || !recipeInput.trim()}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{recipeLoading ? 'Finding cheapest ingredients...' : 'Auto-Build Recipe Cart'}</span>
              </button>
            </div>
          </div>

          {/* Smart Pantry & Expiry Tracker */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Smart Pantry AI
                  </h3>
                  <p className="text-xs text-slate-400">Depletion countdowns & expiry alerts</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span>🌾 Basmati Rice (2 kg)</span>
                <span className="text-amber-400 font-bold">Finishes in 5 days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span>🥛 Nandini Milk (500 ml)</span>
                <span className="text-rose-400 font-bold">Expires tomorrow</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span>🍳 Eggs (4 remaining)</span>
                <span className="text-emerald-400 font-bold">Good for 8 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
