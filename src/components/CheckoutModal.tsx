/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle, 
  ArrowRight, Loader2, Smartphone, Copy, Check, MapPin, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BD_DISTRICTS } from '../data/bdLocations.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  initialCustomerName?: string;
  initialShippingAddress?: string;
  onSuccess: (paymentData: {
    customerName: string;
    shippingAddress: string;
    customerEmail: string;
    paymentDetails: {
      cardBrand: string;
      last4: string;
      transactionId: string;
    };
  }) => void;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  initialCustomerName = '', 
  initialShippingAddress = '', 
  onSuccess 
}: CheckoutModalProps) {
  if (!isOpen) return null;

  // Global Checkout State
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('ramimhasan920@gmail.com');
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka');
  const [selectedUpazila, setSelectedUpazila] = useState('Dhanmondi');
  const [detailedAddress, setDetailedAddress] = useState(initialShippingAddress || '');

  // MFS Operator Selection (bKash or Nagad only)
  const [mfsOperator, setMfsOperator] = useState<'bKash' | 'Nagad'>('bKash');
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsTrxId, setMfsTrxId] = useState('');

  // Copy indicator state
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Common loader and success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Upazilas derived from selected District
  const activeDistrictObj = BD_DISTRICTS.find(d => d.name === selectedDistrict || d.bnName === selectedDistrict) || BD_DISTRICTS[0];
  const upazilaList = activeDistrictObj ? activeDistrictObj.upazilas : [];

  const handleDistrictChange = (dName: string) => {
    setSelectedDistrict(dName);
    const found = BD_DISTRICTS.find(d => d.name === dName || d.bnName === dName);
    if (found && found.upazilas.length > 0) {
      setSelectedUpazila(found.upazilas[0]);
    }
  };
  
  // Sync pre-fills on open
  React.useEffect(() => {
    if (isOpen) {
      setCustomerName(initialCustomerName);
      if (initialShippingAddress) setDetailedAddress(initialShippingAddress);
    }
  }, [isOpen, initialCustomerName, initialShippingAddress]);

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Operator Official Accounts
  const mfsAccounts = {
    bKash: {
      name: 'bKash (বিকাশ পার্সোনাল)',
      number: '01712-345678',
      color: 'bg-[#e2125d]',
      textColor: 'text-[#e2125d]',
      borderColor: 'border-[#e2125d]',
      bgLight: 'bg-rose-50 border-rose-200'
    },
    Nagad: {
      name: 'Nagad (নগদ পার্সোনাল)',
      number: '01812-345678',
      color: 'bg-[#f35f22]',
      textColor: 'text-[#f35f22]',
      borderColor: 'border-[#f35f22]',
      bgLight: 'bg-orange-50 border-orange-200'
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Helper to validate common customer fields
  const validateCustomerFields = () => {
    if (!customerName.trim()) {
      setError('অনুগ্রহ করে আপনার নাম প্রদান করুন (Please enter your name).');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 11) {
      setError('অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন (Please enter a valid 11-digit phone number).');
      return false;
    }
    if (!selectedDistrict || !selectedUpazila || !detailedAddress.trim()) {
      setError('অনুগ্রহ করে জেলা, উপজেলা এবং বাসার বিস্তারিত ঠিকানা প্রদান করুন।');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('অনুগ্রহ করে আপনার সঠিক ইমেইল আইডি প্রদান করুন (Please enter a valid email).');
      return false;
    }
    if (!mfsNumber || mfsNumber.replace(/[^0-9]/g, '').length < 11) {
      setError(`অনুগ্রহ করে যে ${mfsOperator} নাম্বার থেকে টাকা পাঠিয়েছেন তা লিখুন (১১ ডিজিট)।`);
      return false;
    }
    if (!mfsTrxId.trim() || mfsTrxId.trim().length < 6) {
      setError(`অনুগ্রহ করে সেন্ড মানির সঠিক Transaction ID (TrxID) লিখুন।`);
      return false;
    }
    return true;
  };

  const getFullAddress = () => {
    return `${detailedAddress.trim()}, ${selectedUpazila}, ${selectedDistrict}, Bangladesh | Mobile: ${customerPhone.trim()}`;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCustomerFields()) return;

    setIsProcessing(true);
    setProcessingStep(`${mfsOperator} TrxID: ${mfsTrxId.trim().toUpperCase()} ভেরিফাই করা হচ্ছে...`);

    setTimeout(() => {
      setProcessingStep('পেমেন্ট ও অর্ডার লেজার চেক সম্পন্ন হচ্ছে...');
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          onSuccess({
            customerName,
            shippingAddress: getFullAddress(),
            customerEmail,
            paymentDetails: {
              cardBrand: `${mfsOperator} (bKash/Nagad)`,
              last4: mfsNumber.slice(-4),
              transactionId: mfsTrxId.trim().toUpperCase()
            }
          });
          setIsSuccess(false);
          onClose();
        }, 1500);
      }, 1200);
    }, 1200);
  };

  const activeAcc = mfsAccounts[mfsOperator];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative my-auto max-h-[90vh] flex flex-col font-sans"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-900 text-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display font-extrabold text-stone-100 text-base">
                পেমেন্ট ও চেকআউট (Checkout)
              </h2>
              <p className="text-[11px] text-stone-400">বিকাশ ও নগদের মাধ্যমে ডেলিভারি চার্জ অগ্রিম পরিশোধ করুন</p>
            </div>
          </div>
          <button
            id="close-checkout-btn"
            disabled={isProcessing}
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:bg-stone-800 hover:text-white transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-3"
              >
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <h3 className="font-display font-bold text-lg text-stone-900">অর্ডার ও পেমেন্ট প্রসেসিং চলছে...</h3>
                <p className="text-stone-500 text-xs font-sans max-w-sm">{processingStep}</p>
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-display font-bold text-xl text-stone-950">অর্ডার সফলভাবে জমা হয়েছে!</h3>
                <p className="text-stone-500 text-xs">আপনার অর্ডারটি সিস্টেমে যুক্ত হয়েছে। এডমিন প্যানেল থেকে দ্রুত ভেরিফাইড করা হবে।</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Order Summary Box */}
                <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">অর্ডার আইটেমস</span>
                      <span className="text-stone-800 text-xs font-semibold">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} টি হ্যান্ডক্রাফটেড পণ্য</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 text-[10px] block">পণ্য মূল্য</span>
                      <span className="text-stone-900 font-display font-extrabold text-sm">৳{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Delivery Charge Only Callout */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-stone-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>শুধুমাত্র ডেলিভারি চার্জ ৳১২০ টাকা অগ্রিম পরিশোধযোগ্য</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed pl-5">
                      বাকি পণ্য মূল্য <span className="font-bold text-stone-900">৳{total.toLocaleString()}</span> ডেলিভারি ম্যানের কাছ থেকে ক্যাশ অন ডেলিভারি (COD) তে পণ্য বুঝে নিয়ে পরিশোধ করবেন।
                    </p>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200 flex justify-between items-center text-xs font-bold">
                    <span className="text-stone-600">এখন পরিশোধ করতে হবে:</span>
                    <span className="text-emerald-600 font-black text-sm">৳১২০ (ডেলিভারি চার্জ)</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-600 border border-rose-200 text-xs p-3 rounded-xl font-medium flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Customer Information Form */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>গ্রাহক ও ডেলিভারির তথ্য (Customer Details)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        আপনার পুরো নাম <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-name-input"
                        type="text"
                        required
                        placeholder="আপনার নাম লিখুন..."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        মোবাইল নাম্বার <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-phone-input"
                        type="tel"
                        required
                        placeholder="01712345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* District & Upazila Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        জেলা <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="checkout-district-select"
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      >
                        {BD_DISTRICTS.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.bnName} ({d.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        উপজেলা/থানা <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="checkout-upazila-select"
                        value={selectedUpazila}
                        onChange={(e) => setSelectedUpazila(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      >
                        {upazilaList.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        বাসা/রোড/গ্রামের বিস্তারিত ঠিকানা <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-detailed-address-input"
                        type="text"
                        required
                        placeholder="বাসা নং ১২, রোড নং ৪..."
                        value={detailedAddress}
                        onChange={(e) => setDetailedAddress(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        ইমেইল (ইমেল কপি ও ইমেলে রসিদ প্রেরণের জন্য)
                      </label>
                      <input
                        id="checkout-email-input"
                        type="email"
                        required
                        placeholder="ramimhasan920@gmail.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Financial Service Selection (bKash or Nagad) */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>পেমেন্ট মাধ্যম নির্বাচন (bKash / Nagad)</span>
                  </span>

                  {/* Provider Pills */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="mfs-select-bkash"
                      type="button"
                      onClick={() => { setMfsOperator('bKash'); setError(''); }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        mfsOperator === 'bKash'
                          ? 'border-[#e2125d] bg-[#e2125d]/5 ring-2 ring-[#e2125d]/30 font-bold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#e2125d] text-white flex items-center justify-center text-xs font-black">
                          b
                        </div>
                        <span className="text-xs font-display">bKash (বিকাশ)</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">Send Money</span>
                    </button>

                    <button
                      id="mfs-select-nagad"
                      type="button"
                      onClick={() => { setMfsOperator('Nagad'); setError(''); }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        mfsOperator === 'Nagad'
                          ? 'border-[#f35f22] bg-[#f35f22]/5 ring-2 ring-[#f35f22]/30 font-bold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#f35f22] text-white flex items-center justify-center text-xs font-black">
                          N
                        </div>
                        <span className="text-xs font-display">Nagad (নগদ)</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">Send Money</span>
                    </button>
                  </div>

                  {/* Account Instructions Card */}
                  <div className={`p-3 rounded-xl border ${activeAcc.bgLight} space-y-2`}>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>১. {activeAcc.name} নম্বর:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-sm text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                          {activeAcc.number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(activeAcc.number)}
                          className="bg-white hover:bg-stone-100 text-stone-700 p-1 rounded border border-stone-200 text-xs flex items-center space-x-1"
                          title="Copy Number"
                        >
                          {copiedNumber === activeAcc.number ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-snug">
                      আপনার {mfsOperator} অ্যাপ অথবা USSD কোড ডায়াল করে উপরের নাম্বারে <strong className="text-stone-900">৳১২০ (ডেলিভারি চার্জ) Send Money</strong> করুন।
                    </p>
                  </div>

                  {/* Sender Number and TrxID input fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        ২. যে নাম্বার থেকে টাকা পাঠিয়েছেন <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-mfs-number-input"
                        type="tel"
                        required
                        placeholder="017XXXXXXXX"
                        value={mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        ৩. TrxID (Transaction ID) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-mfs-trx-input"
                        type="text"
                        required
                        placeholder="যেমন: BKH98123X12"
                        value={mfsTrxId}
                        onChange={(e) => setMfsTrxId(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  id="checkout-submit-btn"
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
