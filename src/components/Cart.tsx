/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  triggerCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeItem,
  triggerCheckout
}: CartProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-stone-50 border-l border-stone-200/80 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-100">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="font-display font-bold text-lg text-stone-900">Your Craft Basket</h2>
            </div>
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 border border-stone-200">
                  <ShoppingBag className="w-8 h-8 text-stone-300" />
                </div>
                <h3 className="font-display font-semibold text-stone-700 text-base">Your basket is empty</h3>
                <p className="text-stone-400 text-xs mt-1 max-w-xs leading-relaxed">
                  Browse our handcrafted collection and discover unique treasures waiting for a home.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 text-sm font-semibold font-display text-amber-500 hover:text-amber-600 underline underline-offset-4"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.product.id} className="flex items-start space-x-4 pb-4 border-b border-stone-100">
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                    <img
                      referrerPolicy="no-referrer"
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm text-stone-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">{item.product.category}</p>
                    <p className="font-display font-semibold text-stone-800 text-sm mt-1">
                      ৳{item.product.price.toLocaleString()} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-3 mt-3">
                      <div className="flex items-center border border-stone-200 rounded bg-white overflow-hidden shadow-sm">
                        <button
                          id={`qty-decrease-${item.product.id}`}
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-50 text-stone-500 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold font-mono text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          id={`qty-increase-${item.product.id}`}
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className={`p-1 text-stone-500 transition-colors ${
                            item.quantity >= item.product.stock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        id={`remove-cart-item-${item.product.id}`}
                        onClick={() => removeItem(item.product.id)}
                        className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Billing & Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-stone-100 border-t border-stone-200">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Subtotal (পণ্যমূল্য)</span>
                  <span className="font-semibold font-mono">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Delivery Charge (অগ্রিম চার্জ)</span>
                  <span className="font-semibold text-amber-600 font-mono">+৳১২০</span>
                </div>
                <div className="flex justify-between text-stone-900 font-display font-extrabold text-base pt-2 border-t border-stone-200">
                  <span>Total Order Value</span>
                  <span>৳{(subtotal + 120).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-stone-500 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg leading-relaxed mt-1">
                  💡 <b>নোট:</b> ডেলিভারি চার্জ <b>৳১২০</b> অগ্রিম পরিশোধ করে অর্ডার চূড়ান্ত করতে হবে। বাকি মূল্য পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারি (COD) পরিশোধ করুন।
                </p>
              </div>

              <div className="flex justify-center items-center flex-wrap gap-1.5 mb-3 text-[9px] font-bold text-stone-500 tracking-wider uppercase">
                <span>Accepted:</span>
                <span className="bg-[#e2125d]/10 text-[#e2125d] border border-[#e2125d]/20 px-1.5 py-0.5 rounded font-mono">bKash</span>
                <span className="bg-[#f35f22]/10 text-[#f35f22] border border-[#f35f22]/20 px-1.5 py-0.5 rounded font-mono">Nagad</span>
                <span className="bg-[#8c3494]/10 text-[#8c3494] border border-[#8c3494]/20 px-1.5 py-0.5 rounded font-mono">Rocket</span>
                <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono">Cards</span>
              </div>

              <button
                id="checkout-btn"
                onClick={triggerCheckout}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-display font-bold py-3.5 rounded-xl shadow flex items-center justify-center space-x-2 transition-all tracking-wide"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Secure Checkout</span>
              </button>
              <p className="text-stone-400 text-[10px] text-center mt-3 leading-tight">
                🔒 Checkout is 100% secure. Simulated sandbox payment supporting Cards, bKash, Nagad, and Rocket payments.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
