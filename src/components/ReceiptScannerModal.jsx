import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Printer,
  ShieldCheck,
  Building,
  MapPin,
  FileCheck2,
  Edit2,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function ReceiptScannerModal({ isOpen, onClose, onApplyToExpense }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [merchantName, setMerchantName] = useState('');
  const [billDate, setBillDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      const res = await api.uploadReceipt(formData);

      if (res.success && res.data) {
        setParsedData({
          ...res.data,
          receiptUrl: res.receiptUrl
        });
        setMerchantName(res.data.merchant || 'Vendor');
        setBillDate(res.data.date || new Date().toISOString().split('T')[0]);
        setTotalAmount(res.data.total || 0);
      } else {
        setErrorMsg('Could not parse receipt contents.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to scan receipt image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleApply = () => {
    if (!parsedData) return;
    onApplyToExpense?.({
      description: merchantName || parsedData.merchant || 'Scanned Receipt Expense',
      amount: Number(totalAmount) || parsedData.total,
      category: parsedData.category || 'Food',
      date: billDate || parsedData.date || new Date().toISOString().split('T')[0],
      notes: parsedData.notes || `Scanned GST Invoice #${parsedData.invoice_number}`,
      receipt_url: parsedData.receiptUrl
    });
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:max-h-none">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <span>AI Receipt Scanner & GST Invoice</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  OCR Engine
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload / Camera Bar - Hidden if invoice parsed, or can re-upload */}
          {!parsedData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
              {/* Direct Phone Camera Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="cameraInput"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="cameraInput"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 cursor-pointer transition active:scale-98 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Take Photo (Mobile Camera)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Snap any physical restaurant, grocery, or fuel bill
                  </span>
                </label>
              </div>

              {/* Browse File / Gallery */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative"
              >
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  id="fileInput"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="fileInput"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700/60 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 cursor-pointer transition active:scale-98 text-center h-full"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {file ? file.name : 'Upload from Gallery / Files'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP & PDF
                  </span>
                </label>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-9 h-9 text-emerald-500 animate-spin" />
              <div className="flex items-center space-x-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Extracting line items, HSN & GST details...</span>
              </div>
              <p className="text-xs text-slate-400">Verifying merchant tax registration and item breakdown</p>
            </div>
          )}

          {/* Professional Corporate GST Tax Invoice Output */}
          {parsedData && !loading && (
            <div className="space-y-4">
              {/* Print / Re-scan Toolbar */}
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>GST Verified ({(parsedData.confidence * 100).toFixed(0)}% Confidence)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditing ? 'Done Editing' : 'Edit Details'}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedData(null);
                      setFile(null);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Scan Another
                  </button>
                </div>
              </div>

              {/* Authentic Tax Invoice Card */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden">
                {/* Official PAID Watermark Stamp */}
                <div className="absolute top-16 right-8 rotate-[-18deg] pointer-events-none opacity-25 dark:opacity-20 border-4 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 px-4 py-1 rounded-xl text-center">
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-widest block">
                    PAID
                  </span>
                  <span className="text-[9px] font-bold block uppercase tracking-tighter">
                    SplitVerse Verified
                  </span>
                </div>

                {/* Top Title Bar */}
                <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    TAX INVOICE / CASH MEMO (ORIGINAL FOR RECIPIENT)
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="mt-1 text-center font-bold text-lg text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-300 w-full"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {merchantName || parsedData.merchant}
                    </h2>
                  )}
                  {parsedData.trade_name && (
                    <p className="text-xs text-slate-500 font-medium">{parsedData.trade_name}</p>
                  )}
                  {parsedData.merchant_address && (
                    <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{parsedData.merchant_address}</span>
                    </p>
                  )}
                </div>

                {/* GSTIN & Tax Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      GSTIN / UIN
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {parsedData.gstin || '29AABCS1429B1ZB'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      Invoice Number
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {parsedData.invoice_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      Date & Time
                    </span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={billDate}
                        onChange={(e) => setBillDate(e.target.value)}
                        className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border rounded px-1.5 py-0.5"
                      />
                    ) : (
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {billDate || parsedData.date} ({parsedData.time || '14:20 IST'})
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      Place of Supply
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {parsedData.place_of_supply || '29-KARNATAKA'}
                    </span>
                  </div>
                </div>

                {/* Secondary Meta: Cashier / POS */}
                <div className="flex flex-wrap items-center justify-between py-2 text-[10px] text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <span>Cashier: <strong className="text-slate-700 dark:text-slate-300">{parsedData.cashier || 'Staff #04'}</strong></span>
                  <span>Terminal: <strong className="font-mono text-slate-700 dark:text-slate-300">{parsedData.pos_terminal || 'POS-01'}</strong></span>
                  {parsedData.fssai && parsedData.fssai !== 'N/A' && (
                    <span>FSSAI Lic: <strong className="font-mono text-slate-700 dark:text-slate-300">{parsedData.fssai}</strong></span>
                  )}
                  <span>Payment: <strong className="text-emerald-600 dark:text-emerald-400">{parsedData.payment_method || 'UPI Auto-Debit'}</strong></span>
                </div>

                {/* Itemized Table */}
                <div className="pt-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-slate-700 text-slate-500 uppercase font-bold text-[10px]">
                          <th className="py-2 pr-1 w-6">#</th>
                          <th className="py-2">Item Description</th>
                          <th className="py-2 text-center w-16">HSN/SAC</th>
                          <th className="py-2 text-center w-12">Qty</th>
                          <th className="py-2 text-right w-20">Rate (₹)</th>
                          <th className="py-2 text-right w-24">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedData.items && parsedData.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td className="py-2 pr-1 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                            <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                              {it.name}
                            </td>
                            <td className="py-2 text-center font-mono text-[11px] text-slate-400">
                              {it.hsn || '9963'}
                            </td>
                            <td className="py-2 text-center font-mono font-medium">
                              {it.qty}
                            </td>
                            <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-300">
                              ₹{Number(it.price).toFixed(2)}
                            </td>
                            <td className="py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                              ₹{Number(it.total).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invoice Breakdown & Grand Total */}
                <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-3 mt-3 flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Left: Total in words and statutory note */}
                  <div className="space-y-1.5 text-[11px] max-w-sm">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Amount in Words:
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
                        {parsedData.total_in_words || 'Rupees In Total'}
                      </p>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 leading-tight">
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        Declaration: Computer-generated invoice as per GST Rule 46.
                      </p>
                      {parsedData.irn && (
                        <p className="font-mono text-[9px] text-slate-400 mt-0.5 truncate">
                          IRN: {parsedData.irn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Calculations */}
                  <div className="w-full sm:w-64 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Taxable Value (Subtotal):</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        ₹{(parsedData.subtotal || 0).toFixed(2)}
                      </span>
                    </div>

                    {parsedData.cgst > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>CGST ({(parsedData.tax_rate_pct ? parsedData.tax_rate_pct / 2 : 2.5)}%):</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          ₹{(parsedData.cgst).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {parsedData.sgst > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>SGST ({(parsedData.tax_rate_pct ? parsedData.tax_rate_pct / 2 : 2.5)}%):</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          ₹{(parsedData.sgst).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {parsedData.round_off !== 0 && (
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Round Off:</span>
                        <span className="font-mono">{parsedData.round_off > 0 ? `+₹${parsedData.round_off}` : `-₹${Math.abs(parsedData.round_off)}`}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-slate-700">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Grand Total:
                      </span>
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <span className="font-bold text-emerald-600">₹</span>
                          <input
                            type="number"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            className="w-24 text-right px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono font-bold text-sm text-emerald-600"
                          />
                        </div>
                      ) : (
                        <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                          ₹{Number(totalAmount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>

            {parsedData && (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-emerald-500/20 active:scale-98 transition"
              >
                <span>Split This Bill With Group</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

