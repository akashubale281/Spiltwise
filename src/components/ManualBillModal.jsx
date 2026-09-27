import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Printer,
  ArrowRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  CreditCard,
  QrCode,
  Sparkles,
  Building2,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Quick Bill Templates
const BILL_TEMPLATES = [
  {
    name: '🍽️ Restaurant / Cafe',
    vendor: 'Main Street Cafe & Bistro',
    gstin: '29AABCS1429B1ZB',
    items: [
      { name: 'Wood-fired Pizza', hsn: '9963', qty: 2, price: 380 },
      { name: 'Cold Brew Coffee', hsn: '2202', qty: 3, price: 150 },
      { name: 'Garlic Bread Sticks', hsn: '1905', qty: 1, price: 180 }
    ],
    taxRate: 5,
    tip: 50
  },
  {
    name: '🛒 Grocery Supermarket',
    vendor: 'Spencers Fresh Supermarket',
    gstin: '29AABCS9988C1Z2',
    items: [
      { name: 'Basmati Rice 5kg', hsn: '1006', qty: 1, price: 490 },
      { name: 'Cooking Oil 2L', hsn: '1512', qty: 1, price: 320 },
      { name: 'Spices & Masala Pack', hsn: '0910', qty: 2, price: 110 },
      { name: 'Fresh Fruits & Veggies', hsn: '0709', qty: 1, price: 280 }
    ],
    taxRate: 0,
    tip: 0
  },
  {
    name: '💡 Electricity & Utility',
    vendor: 'State Electricity Supply (BESCOM)',
    gstin: '29AAACB0563G1ZG',
    items: [
      { name: 'Monthly Consumption Charges', hsn: '9987', qty: 1, price: 2150 },
      { name: 'Fuel Adjustment (FAC)', hsn: '9987', qty: 1, price: 180 },
      { name: 'Meter Rent & Fixed Tariff', hsn: '9987', qty: 1, price: 120 }
    ],
    taxRate: 0,
    tip: 0
  },
  {
    name: '🧹 Maid & Cook Pay Slip',
    vendor: 'Domestic Staff Monthly Retainer',
    gstin: 'NOT APPLICABLE',
    items: [
      { name: 'Domestic Cleaning & Sweeping (25 Days)', hsn: '9997', qty: 1, price: 3500 },
      { name: 'Cooking & Vessel Cleaning (Morning & Evening)', hsn: '9997', qty: 1, price: 3000 }
    ],
    taxRate: 0,
    tip: 200
  }
];

export default function ManualBillModal({
  isOpen,
  onClose,
  onConvertToExpense,
  initialBill
}) {
  const { user } = useAuth();
  const [vendorName, setVendorName] = useState('Cafe & Grill');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-5)}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [gstin, setGstin] = useState('29AABCS1429B1ZB');
  const [placeOfSupply, setPlaceOfSupply] = useState('29-KARNATAKA');
  const [notes, setNotes] = useState('');

  // Item rows with HSN codes
  const [items, setItems] = useState([
    { id: 1, name: 'Margherita Pizza', hsn: '9963', qty: 2, price: 380 },
    { id: 2, name: 'Cold Brew Coffee', hsn: '2202', qty: 3, price: 150 },
    { id: 3, name: 'Garlic Bread Sticks', hsn: '1905', qty: 1, price: 180 }
  ]);

  const [taxRate, setTaxRate] = useState(5); // 5%
  const [tipAmount, setTipAmount] = useState(50);

  // UPI and QR states
  const [myUpis, setMyUpis] = useState([]);
  const [selectedUpi, setSelectedUpi] = useState(user?.upi_id || '');
  const [isCustomUpi, setIsCustomUpi] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState('');
  const [qrData, setQrData] = useState(null);
  const [showQr, setShowQr] = useState(true);

  // If initialBill is provided (e.g. from receipt scanner or edit action), populate form!
  useEffect(() => {
    if (!isOpen) return;

    if (initialBill) {
      if (initialBill.vendorName || initialBill.vendor_name || initialBill.merchant) {
        setVendorName(initialBill.vendorName || initialBill.vendor_name || initialBill.merchant);
      }
      if (initialBill.invoiceNumber || initialBill.invoice_number) {
        setInvoiceNumber(initialBill.invoiceNumber || initialBill.invoice_number);
      }
      if (initialBill.billDate || initialBill.date) {
        setBillDate(initialBill.billDate || initialBill.date);
      }
      if (initialBill.gstin) {
        setGstin(initialBill.gstin);
      }
      if (initialBill.placeOfSupply || initialBill.place_of_supply) {
        setPlaceOfSupply(initialBill.placeOfSupply || initialBill.place_of_supply);
      }
      if (initialBill.notes) {
        setNotes(initialBill.notes);
      }
      if (initialBill.taxRate !== undefined) {
        setTaxRate(Number(initialBill.taxRate));
      } else if (initialBill.tax_rate_pct !== undefined) {
        setTaxRate(Number(initialBill.tax_rate_pct));
      }
      if (initialBill.tipAmount !== undefined) {
        setTipAmount(Number(initialBill.tipAmount));
      }
      if (Array.isArray(initialBill.items) && initialBill.items.length > 0) {
        setItems(
          initialBill.items.map((it, idx) => ({
            id: it.id || idx + 1,
            name: it.name || 'Item',
            hsn: it.hsn || '9963',
            qty: Number(it.qty) || 1,
            price: Number(it.price) || 0
          }))
        );
      }
    }
  }, [isOpen, initialBill]);

  // Load user's UPI IDs
  useEffect(() => {
    if (!isOpen) return;
    const fetchUpis = async () => {
      try {
        const res = await api.getMyUpiIds();
        if (res.success && res.upiIds && res.upiIds.length > 0) {
          setMyUpis(res.upiIds);
          const primary = res.upiIds.find((a) => a.is_primary === 1) || res.upiIds[0];
          setSelectedUpi(primary.upi_id);
        }
      } catch (err) {
        console.error('Failed to load UPI accounts:', err);
      }
    };
    fetchUpis();
  }, [isOpen]);

  const activeUpi = isCustomUpi ? customUpiInput.trim() : selectedUpi;

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: '', hsn: '9963', qty: 1, price: 0 }
    ]);
  };

  const removeItemRow = (id) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id, field, val) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const applyTemplate = (tpl) => {
    setVendorName(tpl.vendor);
    setGstin(tpl.gstin);
    setInvoiceNumber(`INV-${Date.now().toString().slice(-5)}`);
    setTaxRate(tpl.taxRate);
    setTipAmount(tpl.tip);
    setItems(
      tpl.items.map((it, idx) => ({
        id: idx + 1,
        name: it.name,
        hsn: it.hsn,
        qty: it.qty,
        price: it.price
      }))
    );
  };

  // Calculations
  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0
  );
  const taxAmount = Math.round(((subtotal * (Number(taxRate) || 0)) / 100) * 100) / 100;
  const cgstAmount = Math.round((taxAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((taxAmount / 2) * 100) / 100;
  const grandTotal = Math.round((subtotal + taxAmount + (Number(tipAmount) || 0)) * 100) / 100;

  // Refresh QR code whenever total or active UPI changes
  useEffect(() => {
    if (!isOpen || !activeUpi || grandTotal <= 0) {
      setQrData(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getQuickQrCode(activeUpi, grandTotal, `Bill #${invoiceNumber}`, vendorName);
        if (res.success) {
          setQrData(res);
        }
      } catch (err) {
        console.error('QR error in bill:', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [isOpen, activeUpi, grandTotal, invoiceNumber, vendorName]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndConvert = async () => {
    try {
      const formattedItems = items.map((it) => ({
        name: it.name || 'Item',
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
        total: Math.round((Number(it.qty) || 1) * (Number(it.price) || 0) * 100) / 100
      }));

      // Try creating in backend; if offline/error, proceed smoothly anyway
      try {
        await api.createManualBill({
          title: `${vendorName} Bill`,
          invoice_number: invoiceNumber,
          vendor_name: vendorName,
          date: billDate,
          subtotal,
          tax_amount: taxAmount,
          tip_amount: Number(tipAmount) || 0,
          total_amount: grandTotal,
          items: formattedItems,
          notes,
          upi_id: activeUpi
        });
      } catch (e) {
        console.warn('Backend bill storage note:', e);
      }

      onConvertToExpense?.({
        description: `${vendorName} (Bill #${invoiceNumber})`,
        amount: grandTotal,
        date: billDate,
        upi_id: activeUpi,
        notes: `Generated Bill #${invoiceNumber}: ${items.map((i) => `${i.qty}x ${i.name}`).join(', ')}`
      });
      onClose();
    } catch (err) {
      console.error('Error saving bill:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:max-h-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Manual Bill & Invoice Generator
              </h3>
              <p className="text-[11px] text-slate-400">
                Generate, customize & itemize any bill with automatic GST calculation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-200">
          {/* Quick Preset Templates */}
          <div className="space-y-1.5 print:hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Quick Bill Presets (Auto-fill line items)
            </span>
            <div className="flex flex-wrap gap-2">
              {BILL_TEMPLATES.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bill Top Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Vendor / Restaurant
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Cafe Bistro"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                GSTIN / UIN
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 29AABCS1429B1ZB"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Date & POS State
              </label>
              <div className="flex space-x-1.5">
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* UPI Receiving Account Selector */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 print:hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Receive Payment At (UPI ID / QR Code)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center space-x-1"
              >
                <QrCode className="w-3 h-3" />
                <span>{showQr ? 'Hide QR' : 'Show QR on Bill'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {!isCustomUpi ? (
                <select
                  value={selectedUpi}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomUpi(true);
                      setSelectedUpi('');
                    } else {
                      setSelectedUpi(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white"
                >
                  {myUpis.map((acc) => (
                    <option key={acc.id} value={acc.upi_id}>
                      {acc.upi_id} ({acc.label}{acc.is_primary ? ' - PRIMARY' : ''})
                    </option>
                  ))}
                  <option value="__custom__">➕ Enter different UPI ID...</option>
                  <option value="">🚫 No UPI ID</option>
                </select>
              ) : (
                <div className="flex items-center space-x-1.5 w-full">
                  <input
                    type="text"
                    value={customUpiInput}
                    onChange={(e) => setCustomUpiInput(e.target.value)}
                    placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomUpi(false);
                      const primary = myUpis.find((a) => a.is_primary === 1) || myUpis[0];
                      setSelectedUpi(primary ? primary.upi_id : '');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Itemized Expenses (Editable)
              </span>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 w-20 text-center">HSN</th>
                    <th className="p-3 w-16 text-center">Qty</th>
                    <th className="p-3 w-24 text-right">Price (₹)</th>
                    <th className="p-3 w-24 text-right">Total</th>
                    <th className="p-3 w-10 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => updateItem(it.id, 'name', e.target.value)}
                          placeholder="Item name"
                          className="w-full px-2 py-1 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-medium"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={it.hsn || '9963'}
                          onChange={(e) => updateItem(it.id, 'hsn', e.target.value)}
                          placeholder="HSN"
                          className="w-full text-center px-1 py-1 bg-transparent font-mono text-slate-400 text-[11px]"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={it.qty}
                          onChange={(e) => updateItem(it.id, 'qty', e.target.value)}
                          className="w-full text-center px-1 py-1 bg-transparent font-mono"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={it.price}
                          onChange={(e) => updateItem(it.id, 'price', e.target.value)}
                          className="w-full text-right px-1 py-1 bg-transparent font-mono"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold">
                        ₹{(Number(it.qty || 1) * Number(it.price || 0)).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center print:hidden">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(it.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotal, Tax, Tip, & QR Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Notes & Terms
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Thanks for splitting!"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* QR Code on Invoice */}
              {showQr && qrData?.qrCodeData && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                  <img
                    src={qrData.qrCodeData}
                    alt="Scan to Pay"
                    className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white shrink-0"
                  />
                  <div className="text-[11px] space-y-0.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Scan & Pay via UPI</span>
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 block">
                      {activeUpi}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Amount: ₹{grandTotal.toFixed(2)} (GPay, PhonePe, Paytm)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal (Taxable):</span>
                <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <span>GST Rate:</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-12 px-1 py-0.5 text-center font-mono border rounded text-xs bg-white dark:bg-slate-900"
                  />
                  <span>%</span>
                </span>
                <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
              </div>
              {taxAmount > 0 && (
                <>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST ({(taxRate / 2).toFixed(1)}%):</span>
                    <span className="font-mono">₹{cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>SGST ({(taxRate / 2).toFixed(1)}%):</span>
                    <span className="font-mono">₹{sgstAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span>Tip / Service:</span>
                <div className="flex items-center space-x-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="w-16 px-1 py-0.5 text-right font-mono border rounded text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndConvert}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white shadow-md shadow-blue-500/25"
            >
              <span>Split as Group Expense (₹{grandTotal.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
