/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, LayoutDashboard, Store, Flame, Truck, Mail, MessageCircle, User, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'store' | 'admin';
  setActiveTab: (tab: 'store' | 'admin') => void;
  cartCount: number;
  toggleCart: () => void;
  isAdminGatewayUnlocked: boolean;
  onOpenTracking?: () => void;
  onOpenInbox?: () => void;
  unreadEmailCount?: number;
  whatsappNumber?: string;
  currentUser?: { name: string; emailOrPhone: string; authType: 'email' | 'phone'; isLoggedIn: boolean } | null;
  onOpenUserAuth?: () => void;
  onUserLogout?: () => void;
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  cartCount, 
  toggleCart, 
  isAdminGatewayUnlocked,
  onOpenTracking,
  onOpenInbox,
  unreadEmailCount = 0,
  whatsappNumber = '8801712345678',
  currentUser,
  onOpenUserAuth,
  onUserLogout
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-stone-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('store')}>
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-stone-900 shadow">
              <Flame className="w-5 h-5 text-stone-100" />
            </div>
            <div>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                Closet Crush
              </span>
              <p className="text-[10px] text-amber-400/90 font-medium tracking-wide -mt-0.5">
                ক্লোসেট ক্রাশ • প্রিমিয়াম ফ্যাশন
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              id="nav-store-btn"
              onClick={() => setActiveTab('store')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'store'
                  ? 'bg-stone-800 text-amber-400'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>

            {/* Track Order Button */}
            {onOpenTracking && (
              <button
                id="nav-track-order-btn"
                onClick={onOpenTracking}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-amber-400 transition-colors border border-stone-700/60"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>অর্ডার ট্র্যাকিং</span>
              </button>
            )}

            {isAdminGatewayUnlocked && (
              <button
                id="nav-admin-btn"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-stone-800 text-amber-400'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin & Channels</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Admin WhatsApp Link */}
            <a
              id="nav-whatsapp-direct-btn"
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-full font-bold transition-all shadow-sm"
              title="Direct Admin WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>কথা বলুন</span>
            </a>

            {/* Track Order Mobile Icon */}
            {onOpenTracking && (
              <button
                id="mobile-nav-track-btn"
                onClick={onOpenTracking}
                className="md:hidden p-2 rounded-full text-amber-400 hover:bg-stone-800 transition-colors"
                title="Track Order"
              >
                <Truck className="w-5 h-5" />
              </button>
            )}

            {/* Simulated Email Tray Icon (Admin Only) */}
            {onOpenInbox && activeTab === 'admin' && (
              <button
                id="nav-inbox-btn"
                onClick={onOpenInbox}
                className="relative p-2 rounded-full text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-all focus:outline-none"
                title="Email Receipts & Notifications (Admin)"
              >
                <Mail className="w-5 h-5 text-stone-300" />
                {unreadEmailCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadEmailCount}
                  </span>
                )}
              </button>
            )}

            {/* User Account Login Status Button */}
            {currentUser?.isLoggedIn ? (
              <div className="flex items-center space-x-1.5 bg-stone-800 border border-stone-700 rounded-full pl-2.5 pr-1.5 py-1 text-xs">
                <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold text-stone-200 max-w-[90px] sm:max-w-[120px] truncate text-[11px]">
                  {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={onUserLogout}
                  title="লগআউট করুন"
                  className="p-1 text-stone-400 hover:text-rose-400 rounded-full transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="nav-user-auth-btn"
                onClick={onOpenUserAuth}
                className="flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/80 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all"
                title="কাস্টমার একাউন্ট খুলুন বা লগইন করুন"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">সাইন ইন</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              id="nav-cart-btn"
              onClick={toggleCart}
              className="relative p-2 rounded-full text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-all focus:outline-none"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Quick Dock Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 shadow-2xl px-2 py-1.5 flex items-center justify-around font-sans">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'store' ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>শপ catalog</span>
        </button>

        {onOpenTracking && (
          <button
            onClick={onOpenTracking}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-stone-400 hover:text-amber-400 transition-all"
          >
            <Truck className="w-5 h-5 mb-0.5 text-amber-400" />
            <span>ট্র্যাকিং</span>
          </button>
        )}

        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-all"
        >
          <MessageCircle className="w-5 h-5 mb-0.5 text-emerald-400" />
          <span>হোয়াটসঅ্যাপ</span>
        </a>

        {currentUser?.isLoggedIn ? (
          <button
            onClick={onUserLogout}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-stone-300 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-5 h-5 mb-0.5 text-rose-400" />
            <span>লগআউট</span>
          </button>
        ) : (
          <button
            onClick={onOpenUserAuth}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-stone-400 hover:text-amber-400 transition-all"
          >
            <User className="w-5 h-5 mb-0.5 text-amber-400" />
            <span>একাউন্ট</span>
          </button>
        )}

        <button
          onClick={toggleCart}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-stone-300 relative transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-amber-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>কার্ট</span>
        </button>
      </div>
    </nav>
  );
}
