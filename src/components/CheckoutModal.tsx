/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, Landmark, CheckCircle, 
  ArrowRight, Loader2, Smartphone, Phone, Key, Copy, Check, HelpCircle, MapPin 
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mfs'>('mfs');
  const [payOption, setPayOption] = useState<'delivery' | 'full'>('delivery'); // delivery: advance delivery charge only, full: full amount advance

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

  // Card-specific states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // MFS-specific states
  const [mfsOperator, setMfsOperator] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [mfsMode, setMfsMode] = useState<'instant' | 'manual'>('instant');
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsOtp, setMfsOtp] = useState('');
  const [mfsPin, setMfsPin] = useState('');
  const [mfsTrxId, setMfsTrxId] = useState('');
  const [mfsStep, setMfsStep] = useState<'number' | 'otp' | 'pin'>('number');

  // Copy indicator state
  const [copiedText, setCopiedText] = useState(false);

  // Common loader and success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Operator UI Branding configurations
  const operatorBranding = {
    bKash: {
      name: 'bKash',
      primaryColor: 'bg-[#e2125d]',
      textColor: 'text-[#e2125d]',
      borderColor: 'border-[#e2125d]',
      accentColor: '#e2125d',
      merchantNumber: '01712-345678',
      placeholderBg: 'bg-rose-50',
      lightBorder: 'border-rose-200',
      bannerImage: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=100&auto=format&fit=crop&q=80'
    },
    Nagad: {
      name: 'Nagad',
      primaryColor: 'bg-[#f35f22]',
      textColor: 'text-[#f35f22]',
      borderColor: 'border-[#f35f22]',
      accentColor: '#f35f22',
      merchantNumber: '01912-345678',
      placeholderBg: 'bg-orange-50',
      lightBorder: 'border-orange-200',
      bannerImage: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=100'
    },
    Rocket: {
      name: 'Rocket',
      primaryColor: 'bg-[#8c3494]',
      textColor: 'text-[#8c3494]',
      borderColor: 'border-[#8c3494]',
      accentColor: '#8c3494',
      merchantNumber: '01512-345678',
      placeholderBg: 'bg-purple-50',
      lightBorder: 'border-purple-200',
      bannerImage: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=100'
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Formatting utility for card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  // Helper to validate common customer fields
  const validateCustomerFields = () => {
    if (!customerName.trim()) {
      setError('অনুগ্রহ করে আপনার নাম প্রদান করুন (Please enter your name).');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 11) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন (Please enter a valid 11-digit mobile number).');
      return false;
    }
    if (!selectedDistrict || !selectedUpazila || !detailedAddress.trim()) {
      setError('অনুগ্রহ করে জেলা, উপজেলা এবং বাসার বিস্তারিত ঠিকানা প্রদান করুন (Please complete district, upazila and address).');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('অনুগ্রহ করে আপনার সঠিক ইমেইল আইডি প্রদান করুন (Please enter a valid email).');
      return false;
    }
    return true;
  };

  const getFullAddress = () => {
    return `${detailedAddress.trim()}, ${selectedUpazila}, ${selectedDistrict}, Bangladesh | Mobile: ${customerPhone.trim()}`;
  };

  // Card checkout submission handler
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCustomerFields()) return;

    if (!cardNumber || !expiry || !cvv) {
      setError('Please fill in card credentials.');
      return;
    }

    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Invalid credit card number. Must be 16 digits.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Connecting to secure Stripe banking gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing secure hold amount...');
      
      setTimeout(() => {
        setProcessingStep('Confirming 3D Secure verification...');
        
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          
          setTimeout(() => {
            const cardBrand = cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';
            const last4 = cardNumber.slice(-4);
            const transactionId = 'ch_sim_' + Math.random().toString(36).substr(2, 9);
            
            onSuccess({
              customerName,
              shippingAddress: getFullAddress(),
              customerEmail,
              paymentDetails: {
                cardBrand,
                last4,
                transactionId
              }
            });
            setIsSuccess(false);
            onClose();
          }, 1800);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Mobile Banking submit handler
  const handleMfsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCustomerFields()) return;

    if (mfsMode === 'manual') {
      if (!mfsNumber || mfsNumber.length < 11) {
        setError('Please enter a valid 11-digit Sender Wallet Number.');
        return;
      }
      if (!mfsTrxId || mfsTrxId.length < 8) {
        setError('Please enter a valid Transaction ID.');
        return;
      }

      setIsProcessing(true);
      setProcessingStep(`Verifying manually submitted ${mfsOperator} TrxID: ${mfsTrxId}...`);

      setTimeout(() => {
        setProcessingStep('Reconciling electronic ledger and matching amounts...');
        
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          
          setTimeout(() => {
            onSuccess({
              customerName,
              shippingAddress: getFullAddress(),
              customerEmail,
              paymentDetails: {
                cardBrand: `${mfsOperator} (Manual)`,
                last4: mfsNumber.slice(-4),
                transactionId: mfsTrxId.toUpperCase()
              }
            });
            setIsSuccess(false);
            onClose();
          }, 1800);
        }, 1500);
      }, 1200);

    } else {
      // Instant MFS API flow
      if (mfsStep === 'number') {
        if (!mfsNumber || mfsNumber.length < 11) {
          setError('Please provide a valid 11-digit mobile wallet number.');
          return;
        }
        setMfsStep('otp');
      } else if (mfsStep === 'otp') {
        if (!mfsOtp || mfsOtp.length < 4) {
          setError('Please enter the 6-digit OTP verification code.');
          return;
        }
        setMfsStep('pin');
      } else if (mfsStep === 'pin') {
        if (!mfsPin || mfsPin.length < 4) {
          setError('Please enter your secure 5-digit wallet PIN.');
          return;
        }

        setIsProcessing(true);
        setProcessingStep(`Requesting tokenized secure handshakes from ${mfsOperator} API...`);

        setTimeout(() => {
          setProcessingStep(`Debiting funds securely from account ${mfsNumber}...`);
          
          setTimeout(() => {
            setProcessingStep(`Finalizing transaction ledger verification...`);
            
            setTimeout(() => {
              setIsProcessing(false);
              setIsSuccess(true);
              
              setTimeout(() => {
                const operatorPrefix = mfsOperator === 'bKash' ? 'BK' : mfsOperator === 'Nagad' ? 'NG' : 'RK';
                const generatedTrx = operatorPrefix + Math.random().toString(36).substr(2, 8).toUpperCase();
                
                onSuccess({
                  customerName,
                  shippingAddress: getFullAddress(),
                  customerEmail,
                  paymentDetails: {
                    cardBrand: mfsOperator,
                    last4: mfsNumber.slice(-4),
                    transactionId: generatedTrx
                  }
                });
                
                // Reset states
                setMfsStep('number');
                setMfsNumber('');
                setMfsOtp('');
                setMfsPin('');
                setIsSuccess(false);
                onClose();
              }, 1800);
            }, 1000);
          }, 1200);
        }, 1200);
      }
    }
  };

  const activeBranding = operatorBranding[mfsOperator];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-stone-50 border border-stone-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5.5 h-5.5 text-emerald-600" />
            <h2 className="font-display font-extrabold text-stone-900 text-base sm:text-lg">
              Secured Sandbox Checkout
            </h2>
          </div>
          <button
            id="close-checkout-btn"
            disabled={isProcessing}
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="p-6 relative">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <h3 className="font-display font-bold text-lg text-stone-900">Processing Secure Payment</h3>
                <p className="text-stone-500 text-sm mt-1 max-w-sm font-sans">{processingStep}</p>
                <p className="text-stone-400 text-xs mt-6 font-mono bg-stone-100 px-3 py-1.5 rounded border border-stone-200">
                  Secured by AES 256-bit encryption standard
                </p>
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 border border-emerald-200">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-display font-bold text-xl text-stone-950">Payment Authorized!</h3>
                <p className="text-stone-500 text-sm mt-1">Thank you. Your order has been placed successfully.</p>
                <p className="text-emerald-600 text-xs font-semibold mt-6 animate-pulse">
                  Syncing inventory & alerting channels...
                </p>
              </motion.div>
            ) : (
              <motion.div key="form-container" className="space-y-4">
                {/* Billing items preview & Advance Delivery Charge Details */}
                <div className="bg-stone-100 rounded-xl p-4 border border-stone-200 space-y-3">
                  <div className="flex justify-between items-start border-b border-stone-200/80 pb-2.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono font-bold block mb-0.5">Order summary (অর্ডার বিবরণ)</span>
                      <span className="text-stone-700 text-xs font-semibold">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Handcrafted item(s)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 text-[10px] font-mono block">Subtotal</span>
                      <span className="text-stone-800 font-display font-bold text-sm">৳{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Advance Delivery Charge Requirement Callout */}
                  <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-stone-800">
                    <div className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold block text-amber-900">ডেলিভারি চার্জ অগ্রিম পরিশোধ বাধ্যতামূলক (Advance Delivery Charge Required)</span>
                        অর্ডারটি চূড়ান্ত করতে ডেলিভারি চার্জ <span className="font-bold text-amber-950">৳১২০</span> অগ্রিম পরিশোধ করতে হবে। বাকি মূল্য পণ্য হাতে পেয়ে পরিশোধযোগ্য (Cash on Delivery)!
                      </div>
                    </div>
                  </div>

                  {/* Advanced Payment Option Toggles */}
                  <div className="space-y-1.5">
                    <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-500 font-mono">Payment Options (পরিশোধের ধরণ)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="pay-opt-delivery"
                        type="button"
                        onClick={() => setPayOption('delivery')}
                        className={`p-2 border text-left rounded-lg transition-all flex flex-col justify-between h-16 ${
                          payOption === 'delivery'
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-stone-800 block">১. শুধু ডেলিভারি চার্জ অগ্রিম</span>
                        <div className="mt-auto flex items-baseline justify-between w-full">
                          <span className="text-stone-500 text-[9px]">Pay Now:</span>
                          <span className="text-stone-900 text-xs font-extrabold font-mono">৳১২০</span>
                        </div>
                      </button>

                      <button
                        id="pay-opt-full"
                        type="button"
                        onClick={() => setPayOption('full')}
                        className={`p-2 border text-left rounded-lg transition-all flex flex-col justify-between h-16 ${
                          payOption === 'full'
                            ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-stone-800 block">২. সম্পূর্ণ মূল্য একসাথে অগ্রিম</span>
                        <div className="mt-auto flex items-baseline justify-between w-full">
                          <span className="text-stone-500 text-[9px]">Pay Now:</span>
                          <span className="text-stone-900 text-xs font-extrabold font-mono">৳{(total + 120).toLocaleString()}</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Breakdown Panel */}
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 flex items-center justify-between text-[11px] font-semibold">
                    <div className="text-stone-600">
                      <span>পরিশোধ করতে হবে (Payable Now):</span>
                    </div>
                    <div className="text-right text-stone-950">
                      <span className="text-sm font-black text-emerald-600 block">
                        {payOption === 'delivery' ? '৳১২০' : `৳${(total + 120).toLocaleString()}`}
                      </span>
                      {payOption === 'delivery' && (
                        <span className="text-[9px] text-stone-400 font-mono block">
                          Rest: ৳{total.toLocaleString()} on Delivery (COD)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Payment Method Switcher Tabs */}
                <div className="flex border border-stone-200/85 rounded-xl overflow-hidden bg-stone-100 p-1">
                  <button
                    id="tab-card-option"
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200/30'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Stripe (Cards)</span>
                  </button>
                  <button
                    id="tab-mfs-option"
                    type="button"
                    onClick={() => { setPaymentMethod('mfs'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      paymentMethod === 'mfs'
                        ? 'bg-white text-stone-900 shadow-sm border border-stone-200/30'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Banking (MFS)</span>
                  </button>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-600 border border-rose-200 text-xs px-3.5 py-2.5 rounded-lg font-medium">
                    ⚠️ {error}
                  </div>
                )}

                {/* Shared Contact & Shipping Details */}
                <div className="bg-stone-100/80 border border-stone-200/90 rounded-xl p-3.5 space-y-3">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>গ্রাহক ও ডেলিভারি তথ্য (Delivery Information)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        আপনার নাম (Full Name) <span className="text-rose-500">*</span>
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
                        মোবাইল নাম্বার (Phone Number) <span className="text-rose-500">*</span>
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
                        জেলা নির্বাচন করুন (Select District) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="checkout-district-select"
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      >
                        {BD_DISTRICTS.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.bnName} ({d.name}) - {d.division}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        উপজেলা/থানা (Select Upazila/Thana) <span className="text-rose-500">*</span>
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
                        বিস্তারিত ঠিকানা (House / Road / Village) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="checkout-detailed-address-input"
                        type="text"
                        required
                        placeholder="বাসা নং ১২, রোড নং ৪, সেক্টর ৭..."
                        value={detailedAddress}
                        onChange={(e) => setDetailedAddress(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        ইমেইল (Email)
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

                {/* TAB 1: CARD CHECKOUT VIEW */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handleCardSubmit} className="space-y-4 pt-1">
                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-inner p-3.5 space-y-3.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 font-mono flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card Credentials</span>
                      </span>

                      <div>
                        <input
                          id="checkout-card-input"
                          type="text"
                          required
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={handleCardChange}
                          maxLength={19}
                          className="w-full bg-transparent border-0 border-b border-stone-100 pb-1.5 text-xs text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-500 focus:ring-0"
                        />
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono">Expiry Date</label>
                          <input
                            id="checkout-expiry-input"
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="w-full bg-transparent border-0 border-b border-stone-100 pb-1 text-xs text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-500 focus:ring-0"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase font-mono">CVC Code</label>
                          <input
                            id="checkout-cvv-input"
                            type="password"
                            required
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            maxLength={4}
                            className="w-full bg-transparent border-0 border-b border-stone-100 pb-1 text-xs text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-500 focus:ring-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Test Info Panel */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5">
                      <Landmark className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-800 font-sans">
                        <span className="font-semibold block">💳 Stripe Card Sandbox Active</span>
                        Use card number <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">4242 4242 4242 4242</code> with any future expiry and CVV.
                      </div>
                    </div>

                    <button
                      id="checkout-submit-btn"
                      type="submit"
                      className="w-full bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-semibold py-2.5 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Authorize Stripe Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* TAB 2: MOBILE FINANCIAL SERVICES VIEW (bKash, Nagad, Rocket) */}
                {paymentMethod === 'mfs' && (
                  <form onSubmit={handleMfsSubmit} className="space-y-4 pt-1">
                    {/* Operator Grid Choice */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">Select MFS Provider</label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* bKash */}
                        <button
                          id="mfs-select-bkash"
                          type="button"
                          onClick={() => { setMfsOperator('bKash'); setMfsStep('number'); setError(''); }}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                            mfsOperator === 'bKash'
                              ? 'border-[#e2125d] bg-[#e2125d]/5 text-[#e2125d] font-bold shadow-sm'
                              : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-[#e2125d] flex items-center justify-center text-white text-[8px] font-bold">b</div>
                          <span className="text-[11px] font-display font-bold">bKash</span>
                        </button>
                        {/* Nagad */}
                        <button
                          id="mfs-select-nagad"
                          type="button"
                          onClick={() => { setMfsOperator('Nagad'); setMfsStep('number'); setError(''); }}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                            mfsOperator === 'Nagad'
                              ? 'border-[#f35f22] bg-[#f35f22]/5 text-[#f35f22] font-bold shadow-sm'
                              : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-[#f35f22] flex items-center justify-center text-white text-[8px] font-bold">N</div>
                          <span className="text-[11px] font-display font-bold">Nagad</span>
                        </button>
                        {/* Rocket */}
                        <button
                          id="mfs-select-rocket"
                          type="button"
                          onClick={() => { setMfsOperator('Rocket'); setMfsStep('number'); setError(''); }}
                          className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                            mfsOperator === 'Rocket'
                              ? 'border-[#8c3494] bg-[#8c3494]/5 text-[#8c3494] font-bold shadow-sm'
                              : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-[#8c3494] flex items-center justify-center text-white text-[8px] font-bold">R</div>
                          <span className="text-[11px] font-display font-bold">Rocket</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulation Mode Toggle (Instant Secure Gateway API vs Manual Merchant Cashout) */}
                    <div className="flex border-b border-stone-200 pb-2">
                      <button
                        id="mfs-mode-instant"
                        type="button"
                        onClick={() => { setMfsMode('instant'); setError(''); }}
                        className={`pb-1 px-3 text-[11px] font-semibold border-b-2 transition-all ${
                          mfsMode === 'instant'
                            ? `${activeBranding.borderColor} ${activeBranding.textColor} font-bold`
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Instant Gateway Checkout
                      </button>
                      <button
                        id="mfs-mode-manual"
                        type="button"
                        onClick={() => { setMfsMode('manual'); setError(''); }}
                        className={`pb-1 px-3 text-[11px] font-semibold border-b-2 transition-all ${
                          mfsMode === 'manual'
                            ? `${activeBranding.borderColor} ${activeBranding.textColor} font-bold`
                            : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        Manual TrxID Verify
                      </button>
                    </div>

                    {/* MFS INSTANT GATEWAY WIZARD */}
                    {mfsMode === 'instant' && (
                      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white p-4 space-y-3 shadow-inner">
                        {/* Mock Operator Banner */}
                        <div className={`p-3 rounded-lg flex items-center justify-between text-white ${activeBranding.primaryColor}`}>
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-5 h-5" />
                            <div>
                              <span className="text-xs uppercase font-mono tracking-widest font-bold">{activeBranding.name} Secure Sandbox</span>
                              <div className="text-[10px] opacity-90 leading-tight">Artisan Merchant Checkout</div>
                            </div>
                          </div>
                          <span className="font-display font-black text-sm">${total.toFixed(2)}</span>
                        </div>

                        {/* STEP 1: WALLET ACCOUNT NUMBER ENTRY */}
                        {mfsStep === 'number' && (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">Enter {activeBranding.name} Account Number</label>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                id="mfs-number-input"
                                type="text"
                                maxLength={11}
                                required
                                placeholder="017XXXXXXXX"
                                value={mfsNumber}
                                onChange={(e) => setMfsNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                              />
                            </div>
                            <p className="text-[9px] text-stone-400 leading-tight">
                              🛡️ Your 11-digit mobile wallet number is secure. Enter any simulated number to receive an OTP code.
                            </p>
                          </div>
                        )}

                        {/* STEP 2: ONE-TIME OTP VERIFICATION CODE */}
                        {mfsStep === 'otp' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">Verify sandbox OTP code</label>
                              <button
                                type="button"
                                onClick={() => setMfsStep('number')}
                                className="text-[9px] font-bold text-stone-500 hover:underline"
                              >
                                Edit Number
                              </button>
                            </div>
                            <div className="text-[11px] text-stone-600">
                              We simulated sending a 6-digit OTP verification code to <span className="font-bold text-stone-800">{mfsNumber}</span>.
                            </div>
                            <div className="relative">
                              <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                id="mfs-otp-input"
                                type="text"
                                maxLength={6}
                                required
                                placeholder="Enter code (e.g., 123456)"
                                value={mfsOtp}
                                onChange={(e) => setMfsOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 font-mono tracking-widest text-center"
                              />
                            </div>
                            <p className="text-[9px] text-amber-600 font-medium">
                              Sandbox mode: Enter any 4 to 6-digit number (e.g. <b className="font-mono">123456</b>) to authorize.
                            </p>
                          </div>
                        )}

                        {/* STEP 3: TRANSACTION PIN CODE */}
                        {mfsStep === 'pin' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">Enter Sandbox PIN</label>
                              <button
                                type="button"
                                onClick={() => setMfsStep('otp')}
                                className="text-[9px] font-bold text-stone-500 hover:underline"
                              >
                                Back
                              </button>
                            </div>
                            <div className="text-[11px] text-stone-600">
                              Enter your secure {activeBranding.name} PIN to authorize checkout of <span className="font-bold">${total.toFixed(2)}</span>.
                            </div>
                            <div className="relative">
                              <ShieldCheck className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                id="mfs-pin-input"
                                type="password"
                                maxLength={5}
                                required
                                placeholder="Enter Wallet PIN (e.g., 12345)"
                                value={mfsPin}
                                onChange={(e) => setMfsPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 font-mono tracking-widest text-center"
                              />
                            </div>
                            <p className="text-[9px] text-amber-600 font-medium">
                              Sandbox mode: Secure pin shield is mock-only. Type any PIN to finalize payment simulation.
                            </p>
                          </div>
                        )}

                        {/* Progress Stepper indicators */}
                        <div className="flex justify-center items-center space-x-1.5 pt-1">
                          <div className={`w-2 h-2 rounded-full ${mfsStep === 'number' ? activeBranding.primaryColor : 'bg-stone-200'}`} />
                          <div className={`w-2 h-2 rounded-full ${mfsStep === 'otp' ? activeBranding.primaryColor : 'bg-stone-200'}`} />
                          <div className={`w-2 h-2 rounded-full ${mfsStep === 'pin' ? activeBranding.primaryColor : 'bg-stone-200'}`} />
                        </div>
                      </div>
                    )}

                    {/* MFS MANUAL MERCHANTOUT PAY (TRXID VERIFY) */}
                    {mfsMode === 'manual' && (
                      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white p-4 space-y-4 shadow-inner">
                        <div className="bg-stone-100 p-3 rounded-lg space-y-2 border border-stone-200/50">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 font-mono block">Instructions</span>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            Please open your {activeBranding.name} mobile app or dial USSD code, select <b>Send Money</b> or <b>Cash Out</b> to our verified sandbox merchant number below:
                          </p>
                          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-stone-200/60 mt-1">
                            <span className="font-mono text-xs font-bold text-stone-800">{activeBranding.merchantNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(activeBranding.merchantNumber)}
                              className="text-[10px] font-bold text-amber-600 flex items-center space-x-1 hover:text-amber-700"
                            >
                              {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedText ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1">Your Sender Account No.</label>
                            <input
                              id="mfs-manual-sender-input"
                              type="text"
                              maxLength={11}
                              required
                              placeholder="e.g. 01712345678"
                              value={mfsNumber}
                              onChange={(e) => setMfsNumber(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1">Transaction ID (TrxID)</label>
                            <input
                              id="mfs-manual-trx-input"
                              type="text"
                              maxLength={10}
                              required
                              placeholder="e.g. BK7A890K2L"
                              value={mfsTrxId}
                              onChange={(e) => setMfsTrxId(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-stone-400 leading-tight">
                          💡 Sandbox check: Any Alphanumeric Transaction ID greater than 8 characters will pass validation checks perfectly.
                        </p>
                      </div>
                    )}

                    {/* MFS Submit Buttons */}
                    <button
                      id="mfs-checkout-submit-btn"
                      type="submit"
                      className={`w-full ${activeBranding.primaryColor} hover:brightness-95 text-stone-50 font-display font-semibold py-2.5 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2`}
                    >
                      {mfsMode === 'instant' ? (
                        <>
                          <span>
                            {mfsStep === 'number' ? `Proceed with ${activeBranding.name} Pay` : 
                             mfsStep === 'otp' ? 'Verify Code' : `Authorize $${total.toFixed(2)}`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Verify Manual Ledger TrxID</span>
                          <ShieldCheck className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
