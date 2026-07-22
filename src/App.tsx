/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.js';
import Storefront from './components/Storefront.js';
import Cart, { CartItem } from './components/Cart.js';
import CheckoutModal from './components/CheckoutModal.js';
import Dashboard from './components/Dashboard.js';
import FacebookLiveChat from './components/FacebookLiveChat.js';
import AdminLogin from './components/AdminLogin.js';
import SimulatedInbox, { SimulatedEmail } from './components/SimulatedInbox.js';
import OrderTrackingModal from './components/OrderTrackingModal.js';
import UserAuthModal from './components/UserAuthModal.js';
import { Product, Order, OrderStatus } from './types.js';
import { DEFAULT_PRODUCTS, DEFAULT_ORDERS } from './data/initialProducts.js';
import { Mail, ArrowRight, Bell, X, CloudCheck } from 'lucide-react';
import { db } from './firebase.js';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [isAdminGatewayUnlocked, setIsAdminGatewayUnlocked] = useState<boolean>(() => {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (isAuth) return true;
    const isGatewayUnlocked = sessionStorage.getItem('isAdminGatewayUnlocked') === 'true';
    if (isGatewayUnlocked) return true;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.get('admin') === 'true') {
        sessionStorage.setItem('isAdminGatewayUnlocked', 'true');
        return true;
      }
    } catch (e) {
      console.warn('URLSearchParams is not supported', e);
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'store' | 'admin'>('store');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isAdminAuthenticated') === 'true';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bd_app_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage', e);
    }
    return DEFAULT_PRODUCTS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bd_app_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load categories from localStorage', e);
    }
    return ['All', 'Ceramics', 'Textiles', 'Home Fragrance', 'Stationery', 'Wooden Ware', 'Decor'];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bd_app_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load orders from localStorage', e);
    }
    return DEFAULT_ORDERS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // User Auth Modal State
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    emailOrPhone: string;
    authType: 'email' | 'phone';
    isLoggedIn: boolean;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('bd_app_user_account');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const handleUserLoginSuccess = (userData: { name: string; emailOrPhone: string; authType: 'email' | 'phone' }) => {
    const user = { ...userData, isLoggedIn: true };
    setCurrentUser(user);
    try {
      localStorage.setItem('bd_app_user_account', JSON.stringify(user));
    } catch (e) {}
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bd_app_user_account');
    } catch (e) {}
  };

  // MFS Numbers State (bKash & Nagad)
  const [bkashNumber, setBkashNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('bd_app_bkash') || '01712-345678';
    } catch (e) {
      return '01712-345678';
    }
  });

  const [nagadNumber, setNagadNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('bd_app_nagad') || '01812-345678';
    } catch (e) {
      return '01812-345678';
    }
  });

  const handleUpdateMfsNumbers = async (bkash: string, nagad: string) => {
    setBkashNumber(bkash);
    setNagadNumber(nagad);
    try {
      localStorage.setItem('bd_app_bkash', bkash);
      localStorage.setItem('bd_app_nagad', nagad);
      await setDoc(doc(db, 'store_settings', 'settings'), { bkashNumber: bkash, nagadNumber: nagad }, { merge: true });
    } catch (e) {}
  };

  // Dynamic Admin Password State
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('bd_app_admin_password') || 'admin123';
    } catch (e) {
      return 'admin123';
    }
  });

  const handleUpdateAdminPassword = async (newPassword: string) => {
    setAdminPassword(newPassword);
    try {
      localStorage.setItem('bd_app_admin_password', newPassword);
      await setDoc(doc(db, 'store_settings', 'settings'), { adminPassword: newPassword }, { merge: true });
    } catch (e) {}
  };

  // WhatsApp Admin Number State
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('bd_app_whatsapp') || '8801712345678';
    } catch (e) {
      return '8801712345678';
    }
  });

  const handleUpdateWhatsappNumber = async (newNumber: string) => {
    const cleanNumber = newNumber.trim().replace(/[^0-9]/g, '');
    setWhatsappNumber(cleanNumber);
    try {
      localStorage.setItem('bd_app_whatsapp', cleanNumber);
      await setDoc(doc(db, 'store_settings', 'settings'), { whatsappNumber: cleanNumber }, { merge: true });
    } catch (e) {}
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bd_app_products', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('bd_app_categories', JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('bd_app_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);
  
  // Simulated Email Client States
  const [isEmailClientOpen, setIsEmailClientOpen] = useState(false);
  const [activeEmailToast, setActiveEmailToast] = useState<{
    subject: string;
    recipient: string;
  } | null>(null);
  const [sentEmails, setSentEmails] = useState<SimulatedEmail[]>([
    {
      id: 'em_welcome',
      subject: 'Welcome to Closet Crush! 🌸',
      recipient: 'customer@gmail.com',
      sender: 'ramimhasan920@gmail.com',
      sentAt: new Date(Date.now() - 3600000 * 24).toLocaleString(), // 24 hours ago
      isRead: false,
      bodyHtml: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf9; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; color: #44403c;">
          <div style="background-color: #1c1917; padding: 24px; text-align: center;">
            <h1 style="font-family: 'Playfair Display', serif; color: #f5f5f4; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Closet Crush</h1>
            <p style="color: #a8a29e; font-size: 11px; margin: 4px 0 0 0; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Curated Fashion Marketplace</p>
          </div>
          <div style="padding: 32px 24px; line-height: 1.6;">
            <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #44403c;">
              <div style="margin-bottom: 4px;"><strong>From (এডমিন প্রেরক):</strong> ramimhasan920@gmail.com</div>
              <div><strong>To (গ্রাহক প্রাপক):</strong> customer@gmail.com</div>
            </div>
            <h2 style="font-size: 18px; color: #1c1917; margin-top: 0; margin-bottom: 16px;">Welcome to Closet Crush!</h2>
            <p style="margin-bottom: 20px;">Thank you for joining Closet Crush. We are a premier curated platform dedicated to bringing you high-quality pre-loved apparel, vintage gems, and bespoke closet statement pieces.</p>
            <p style="margin-bottom: 0;">Explore our latest curated collections. When you place your first order, a simulated order confirmation receipt will be sent directly to this inbox in real-time from our admin email (ramimhasan920@gmail.com)!</p>
          </div>
          <div style="background-color: #f5f5f4; padding: 20px 24px; text-align: center; border-top: 1px solid #e7e5e4; font-size: 11px; color: #78716c;">
            <p style="margin: 0 0 8px 0;">Closet Crush Marketplace &bull; Dhaka, Bangladesh</p>
            <p style="margin: 0;">This is a high-fidelity Sandbox transactional email simulation.</p>
          </div>
        </div>
      `
    }
  ]);
  
  // Checkout pre-fill overrides for Facebook Chat order checkouts
  const [checkoutPrefills, setCheckoutPrefills] = useState<{
    customerName: string;
    shippingAddress: string;
    cartItems: CartItem[];
    onSuccessOverride: (paymentDetails: any) => Promise<void>;
  } | null>(null);

  // Real-time Cloud Database Sync with Firebase Firestore across devices
  useEffect(() => {
    // 1. Sync Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default products to Firestore if empty
        DEFAULT_PRODUCTS.forEach((prod) => {
          setDoc(doc(db, 'products', prod.id), prod).catch(console.error);
        });
      } else {
        const firestoreProds = snapshot.docs.map(d => d.data() as Product);
        setProducts(firestoreProds);
      }
    }, (err) => console.warn('Firestore products sync warning:', err));

    // 2. Sync Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default orders to Firestore if empty
        DEFAULT_ORDERS.forEach((ord) => {
          setDoc(doc(db, 'orders', ord.id), ord).catch(console.error);
        });
      } else {
        const firestoreOrders = snapshot.docs.map(d => d.data() as Order);
        firestoreOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setOrders(firestoreOrders);
      }
    }, (err) => console.warn('Firestore orders sync warning:', err));

    // 3. Sync Store Settings (WhatsApp, bKash, Nagad, Admin Password)
    const unsubSettings = onSnapshot(doc(db, 'store_settings', 'settings'), (snapshot) => {
      if (!snapshot.exists()) {
        const initialSettings = {
          whatsappNumber: '8801712345678',
          bkashNumber: '01712-345678',
          nagadNumber: '01812-345678',
          adminPassword: 'admin123'
        };
        setDoc(doc(db, 'store_settings', 'settings'), initialSettings).catch(console.error);
      } else {
        const data = snapshot.data();
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
        if (data.bkashNumber) setBkashNumber(data.bkashNumber);
        if (data.nagadNumber) setNagadNumber(data.nagadNumber);
        if (data.adminPassword) setAdminPassword(data.adminPassword);
      }
    }, (err) => console.warn('Firestore settings sync warning:', err));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
    };
  }, []);

  // Keyboard shortcut listener to securely unlock admin gateway (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminGatewayUnlocked(true);
        sessionStorage.setItem('isAdminGatewayUnlocked', 'true');
        setActiveTab('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. Cart handlers
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Enforce inventory limit
        const targetQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Helper to generate a beautiful, rich HTML receipt for the customer email simulator
  const generateReceiptEmailHtml = (order: Order, emailAddress: string) => {
    const itemRows = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 12px 0; font-size: 13px;">
          <div style="font-weight: 600; color: #1c1917;">${item.productName}</div>
          <div style="font-size: 11px; color: #78716c; font-family: monospace; margin-top: 2px;">ID: ${item.productId}</div>
        </td>
        <td style="padding: 12px 0; text-align: center; font-size: 13px; font-weight: 600; color: #44403c;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; text-align: right; font-size: 13px; font-family: monospace; font-weight: 600; color: #1c1917;">
          $${item.price.toFixed(2)}
        </td>
        <td style="padding: 12px 0; text-align: right; font-size: 13px; font-family: monospace; font-weight: 700; color: #1c1917;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const paymentMethodName = order.paymentDetails?.cardBrand || 'Cash on Delivery';
    const trxId = order.paymentDetails?.transactionId || 'N/A';
    const advancePaid = paymentMethodName !== 'Cash on Delivery' ? 1.00 : 0.00; // Simulating advance delivery charge charge
    const remainingCod = order.total - advancePaid;

    return `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf9; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; color: #44403c; text-align: left;">
        <div style="background-color: #1c1917; padding: 28px 24px; text-align: center;">
          <div style="color: #f5f5f4; font-family: 'Playfair Display', serif; font-size: 26px; font-weight: bold; letter-spacing: -0.025em; margin: 0;">Closet Crush</div>
          <p style="color: #a8a29e; font-size: 10px; margin: 6px 0 0 0; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em;">Curated Fashion Marketplace</p>
        </div>

        <div style="padding: 32px 24px;">
          <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 12px; color: #44403c; line-height: 1.5;">
            <div style="margin-bottom: 4px;"><strong>From (এডমিন প্রেরক):</strong> ramimhasan920@gmail.com</div>
            <div><strong>To (গ্রাহক প্রাপক):</strong> ${order.customerEmail || emailAddress || 'customer@gmail.com'}</div>
          </div>

          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: bold; font-family: monospace; text-transform: uppercase;">
              Order Confirmed
            </div>
            <h2 style="font-size: 20px; color: #1c1917; margin: 12px 0 4px 0;">Thank you for your order, ${order.customerName}!</h2>
            <p style="font-size: 12px; color: #78716c; margin: 0;">We appreciate your patronage.</p>
          </div>

          <p style="font-size: 13.5px; margin-bottom: 16px;">Hi <strong>${order.customerName}</strong>,</p>
          <p style="font-size: 13.5px; margin-bottom: 24px; line-height: 1.6;">We have successfully received and processed your sandbox payment. Our master artisans are already preparing your handmade products with meticulous care.</p>

          <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin-bottom: 28px; font-size: 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #78716c; font-weight: 500;">Order Number:</td>
                <td style="padding: 4px 0; text-align: right; color: #1c1917; font-weight: bold; font-family: monospace;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78716c; font-weight: 500;">Date Placed:</td>
                <td style="padding: 4px 0; text-align: right; color: #1c1917; font-weight: 600;">${new Date(order.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78716c; font-weight: 500;">Payment Gateway:</td>
                <td style="padding: 4px 0; text-align: right; color: #1c1917; font-weight: 600;">${paymentMethodName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78716c; font-weight: 500;">Transaction ID:</td>
                <td style="padding: 4px 0; text-align: right; color: #1c1917; font-weight: bold; font-family: monospace; font-size: 11px;">${trxId}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 13px; color: #1c1917; text-transform: uppercase; font-family: monospace; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; margin-bottom: 12px;">Itemized Receipt</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="text-align: left; padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: bold; border-bottom: 1px solid #e7e5e4;">Artisan Item</th>
                <th style="text-align: center; padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: bold; border-bottom: 1px solid #e7e5e4;">Qty</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: bold; border-bottom: 1px solid #e7e5e4;">Price</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: bold; border-bottom: 1px solid #e7e5e4;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="border-top: 1px solid #e7e5e4; padding-top: 12px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #78716c;">Cart Subtotal:</td>
                <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #1c1917;">$${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78716c;">Advance Hold Charge Paid:</td>
                <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #d97706; font-weight: 600;">-$1.00</td>
              </tr>
              <tr style="font-size: 15px; font-weight: bold;">
                <td style="padding: 12px 0 4px 0; color: #1c1917; border-top: 1px dashed #e7e5e4; margin-top: 8px;">Remaining Balance (Payable on COD):</td>
                <td style="padding: 12px 0 4px 0; text-align: right; font-family: monospace; color: #059669; border-top: 1px dashed #e7e5e4;">
                  $${remainingCod > 0 ? remainingCod.toFixed(2) : '0.00'}
                </td>
              </tr>
            </table>
            <p style="font-size: 11px; color: #78716c; font-style: italic; margin-top: 6px; line-height: 1.4;">
              * Note: The remaining balance is payable upon home delivery to the logistics agent.
            </p>
          </div>

          <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; font-size: 12.5px; margin-bottom: 24px;">
            <div style="font-weight: bold; color: #1c1917; text-transform: uppercase; font-family: monospace; font-size: 11px; margin-bottom: 6px;">Delivery Address</div>
            <div style="color: #44403c; line-height: 1.5;">
              <strong>${order.customerName}</strong><br/>
              ${order.shippingAddress}
            </div>
          </div>

          <p style="font-size: 11px; color: #78716c; line-height: 1.5; margin: 0;">
            If you need to make any alterations to your delivery or contact details, please reply directly to this email concierge setup.
          </p>
        </div>

        <div style="background-color: #f5f5f4; border-top: 1px solid #e7e5e4; padding: 24px; text-align: center; font-size: 11px; color: #78716c; line-height: 1.5;">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #44403c;">Closet Crush Curated Fashion Marketplace</p>
          <p style="margin: 0;">This is a sandbox-simulated notification for testing checkout workflows.</p>
        </div>
      </div>
    `;
  };

  const generateAdminOrderEmailHtml = (order: Order) => {
    const itemRows = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 10px 0; font-size: 13px;">
          <div style="font-weight: 700; color: #1c1917;">${item.productName}</div>
          <div style="font-size: 11px; color: #78716c; font-family: monospace;">Item ID: ${item.productId}</div>
        </td>
        <td style="padding: 10px 0; text-align: center; font-size: 13px; font-weight: 700; color: #1c1917;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-size: 13px; font-family: monospace; font-weight: 700; color: #1c1917;">৳${item.price.toLocaleString()}</td>
        <td style="padding: 10px 0; text-align: right; font-size: 13px; font-family: monospace; font-weight: 800; color: #059669;">৳${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: 'Inter', sans-serif; max-width: 620px; margin: 0 auto; background-color: #fcfbf9; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; color: #44403c;">
        <div style="background-color: #111827; padding: 24px; text-align: center;">
          <span style="background-color: #f59e0b; color: #111827; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em;">ADMIN NEW ORDER NOTIFICATION</span>
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 10px 0 0 0;">New Order #${order.id}</h1>
          <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0 0;">Recipient: ramimhasan920@gmail.com</p>
        </div>

        <div style="padding: 24px; line-height: 1.5;">
          <div style="background-color: #f3f4f6; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #111827;">👤 Customer Information (গ্রাহক ও ঠিকানা)</h3>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Name:</strong> ${order.customerName}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Customer Email:</strong> ${order.customerEmail || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Order Source:</strong> ${order.source}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Order Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #065f46;">💳 Payment Details (পেমেন্ট তথ্য)</h3>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Method:</strong> ${order.paymentDetails?.cardBrand || 'Mobile Banking'}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>TrxID / Reference:</strong> <span style="font-family: monospace; font-weight: bold; color: #047857;">${order.paymentDetails?.transactionId || 'N/A'}</span></p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Total Value:</strong> <strong style="font-size: 16px; color: #047857;">৳${order.total.toLocaleString()}</strong></p>
          </div>

          <h3 style="font-size: 12px; text-transform: uppercase; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; font-family: monospace;">Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280;">
                <th style="padding-bottom: 6px;">Product</th>
                <th style="padding-bottom: 6px; text-align: center;">Qty</th>
                <th style="padding-bottom: 6px; text-align: right;">Unit Price</th>
                <th style="padding-bottom: 6px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; text-align: center; font-size: 12px; color: #92400e; font-weight: 600;">
            ⚡ Action Needed: Manage order delivery status from the Admin Panel.
          </div>
        </div>
      </div>
    `;
  };

  // 4. Checkout handlers
  const handleCheckoutSuccess = async (paymentData: {
    customerName: string;
    shippingAddress: string;
    customerEmail: string;
    paymentDetails: { cardBrand: string; last4: string; transactionId: string };
  }) => {
    // Map items for checkout payload
    const orderItems = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = cartItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

    const fallbackOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      items: orderItems,
      total: totalAmount,
      customerName: paymentData.customerName,
      shippingAddress: paymentData.shippingAddress,
      customerEmail: paymentData.customerEmail,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      source: 'Website',
      paymentDetails: paymentData.paymentDetails
    };

    let createdOrder: Order = fallbackOrder;

    try {
      // Save order to Firestore
      await setDoc(doc(db, 'orders', createdOrder.id), createdOrder);
    } catch (err) {
      console.warn('Firestore order save error, keeping local fallback:', err);
      setOrders(prev => [createdOrder, ...prev]);
    }

    // Deduct stock in Firestore & locally
    setProducts(prevProds => prevProds.map(prod => {
      const cartMatch = cartItems.find(ci => ci.product.id === prod.id);
      if (cartMatch) {
        const newStock = Math.max(0, prod.stock - cartMatch.quantity);
        updateDoc(doc(db, 'products', prod.id), { stock: newStock }).catch(console.warn);
        return { ...prod, stock: newStock };
      }
      return prod;
    }));

    setCartItems([]);
    setIsCartOpen(false);

    // 1. Deliver customer email (From: ramimhasan920@gmail.com, To: paymentData.customerEmail)
    const customerEmailHtml = generateReceiptEmailHtml(createdOrder, paymentData.customerEmail);
    const customerEmailObj: SimulatedEmail = {
      id: 'em_cust_' + Math.random().toString(36).substr(2, 9),
      subject: `Order Confirmed: #${createdOrder.id} - Closet Crush 📦`,
      recipient: paymentData.customerEmail,
      sender: 'ramimhasan920@gmail.com',
      bodyHtml: customerEmailHtml,
      sentAt: new Date().toLocaleString(),
      isRead: false
    };

    // 2. Deliver ADMIN Notification Email to ramimhasan920@gmail.com
    const adminEmailHtml = generateAdminOrderEmailHtml(createdOrder);
    const adminEmailObj: SimulatedEmail = {
      id: 'em_admin_' + Math.random().toString(36).substr(2, 9),
      subject: `🚨 ADMIN NEW ORDER: #${createdOrder.id} from ${paymentData.customerName} (৳${createdOrder.total.toLocaleString()})`,
      recipient: 'ramimhasan920@gmail.com',
      sender: 'ramimhasan920@gmail.com',
      bodyHtml: adminEmailHtml,
      sentAt: new Date().toLocaleString(),
      isRead: false
    };

    setSentEmails(prev => [adminEmailObj, customerEmailObj, ...prev]);

    // Push toast notification for admin email
    setActiveEmailToast({
      subject: adminEmailObj.subject,
      recipient: 'ramimhasan920@gmail.com'
    });

    // Clear toast after 8s
    setTimeout(() => {
      setActiveEmailToast(prev => prev?.subject === adminEmailObj.subject ? null : prev);
    }, 8000);
  };

  const handleAddCategory = (catName: string) => {
    if (!catName || categories.includes(catName)) return;
    setCategories(prev => [...prev, catName]);
  };

  // 5. Admin handlers
  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    try {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      await updateDoc(doc(db, 'products', productId), { stock: newStock });
    } catch (err) {
      console.error('Failed to update product stock in Firestore:', err);
    }
  };

  const handleUpdateProductImage = async (productId: string, newImage: string, newImages?: string[]) => {
    const imagesList = newImages && newImages.length > 0 ? newImages : [newImage];
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, image: newImage, images: imagesList } : p));
    try {
      await updateDoc(doc(db, 'products', productId), { image: newImage, images: imagesList });
    } catch (err) {
      console.warn('Updated product image in Firestore error:', err);
    }
  };

  const handleAddProduct = async (productData: any) => {
    // Construct new product object
    const imgList: string[] = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : (productData.image ? [productData.image] : ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80']);

    const localNewProd: Product = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: productData.name,
      price: productData.price,
      description: productData.description || '',
      image: imgList[0],
      images: imgList,
      stock: productData.stock ?? 5,
      category: productData.category || 'Ceramics',
      reviews: []
    };

    // Add to Firestore
    try {
      await setDoc(doc(db, 'products', localNewProd.id), localNewProd);
    } catch (err) {
      console.warn('Firestore add product error, retained locally:', err);
      setProducts(prev => [localNewProd, ...prev]);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string, trackingUrl?: string) => {
    // Update local state immediately for instant response
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          ...(trackingNumber !== undefined ? { trackingNumber } : {}),
          ...(trackingUrl !== undefined ? { trackingUrl } : {})
        };
      }
      return o;
    }));

    try {
      const updateData: any = { status };
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
      await updateDoc(doc(db, 'orders', orderId), updateData);
    } catch (err) {
      console.warn('Firestore order status update error:', err);
    }
  };

  const handleTriggerFacebookCheckout = (
    customerName: string,
    shippingAddress: string,
    productName: string,
    price: number,
    qty: number,
    onSuccessOverride: (paymentDetails: any) => Promise<void>
  ) => {
    const mockProduct = {
      id: 'mock_fb_prod_' + Math.random().toString(36).substr(2, 5),
      name: productName,
      price: price,
      description: 'Facebook Live Chat Order',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600',
      stock: qty,
      category: 'Decor'
    };

    setCheckoutPrefills({
      customerName,
      shippingAddress,
      cartItems: [{ product: mockProduct, quantity: qty }],
      onSuccessOverride
    });
    setIsCheckoutOpen(true);
  };

  const handleMarkAsRead = (emailId: string) => {
    setSentEmails(prev =>
      prev.map(e => e.id === emailId ? { ...e, isRead: true } : e)
    );
  };

  const handleClearAllEmails = () => {
    if (window.confirm('সিমুলেটর ইনবক্সের সকল মেইল ডিলেট করতে চান?')) {
      setSentEmails([]);
    }
  };

  const handleDeleteEmail = (emailId: string) => {
    setSentEmails(prev => prev.filter(e => e.id !== emailId));
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-amber-400 selection:text-stone-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        isAdminGatewayUnlocked={isAdminGatewayUnlocked}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenInbox={() => setIsEmailClientOpen(true)}
        unreadEmailCount={sentEmails.filter(e => !e.isRead).length}
        whatsappNumber={whatsappNumber}
        currentUser={currentUser}
        onOpenUserAuth={() => setIsUserAuthOpen(true)}
        onUserLogout={handleUserLogout}
      />

      <main className="flex-1">
        {activeTab === 'store' ? (
          <Storefront
            products={products}
            categories={categories}
            addToCart={handleAddToCart}
          />
        ) : !isAdminAuthenticated ? (
          <AdminLogin
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            adminPassword={adminPassword}
          />
        ) : (
          <Dashboard
            products={products}
            orders={orders}
            categories={categories}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateProductImage={handleUpdateProductImage}
            onAddProduct={handleAddProduct}
            onAddCategory={handleAddCategory}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            whatsappNumber={whatsappNumber}
            onUpdateWhatsappNumber={handleUpdateWhatsappNumber}
            bkashNumber={bkashNumber}
            nagadNumber={nagadNumber}
            onUpdateMfsNumbers={handleUpdateMfsNumbers}
            adminPassword={adminPassword}
            onUpdateAdminPassword={handleUpdateAdminPassword}
            onLogout={() => {
              sessionStorage.removeItem('isAdminAuthenticated');
              sessionStorage.removeItem('isAdminGatewayUnlocked');
              setIsAdminAuthenticated(false);
              setIsAdminGatewayUnlocked(false);
              setActiveTab('store');
            }}
          />
        )}
      </main>

      <footer className="bg-stone-900 text-stone-400 py-8 border-t border-stone-800 text-xs text-center shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-display font-semibold text-stone-300">Closet Crush Curated Fashion Marketplace</p>
          <p className="max-w-md mx-auto leading-relaxed">
            A full-stack, real-time e-commerce simulation integrating Stripe sandbox checkouts, 
            Telegram bot automated notifications, and AI-powered Facebook order parsing.
          </p>
          <div className="pt-4 text-stone-500 font-mono flex items-center justify-center gap-1">
            <span>&copy; {new Date().getFullYear()} Closet Crush Corp. All Rights Reserved.</span>
            <button
              id="secret-gateway-dot"
              onClick={() => {
                setIsAdminGatewayUnlocked(true);
                sessionStorage.setItem('isAdminGatewayUnlocked', 'true');
                setActiveTab('admin');
              }}
              className="text-[10px] text-stone-700 hover:text-stone-500 focus:outline-none transition-colors select-none cursor-pointer"
              title="Secure Entry"
            >
              &bull;
            </button>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={handleUpdateCartQuantity}
        removeItem={handleRemoveCartItem}
        triggerCheckout={() => {
          setIsCheckoutOpen(true);
        }}
      />

      {/* Payment Gateway Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutPrefills(null);
        }}
        cartItems={checkoutPrefills ? checkoutPrefills.cartItems : cartItems}
        initialCustomerName={checkoutPrefills ? checkoutPrefills.customerName : ''}
        initialShippingAddress={checkoutPrefills ? checkoutPrefills.shippingAddress : ''}
        bkashNumber={bkashNumber}
        nagadNumber={nagadNumber}
        currentUser={currentUser}
        onOpenUserAuth={() => setIsUserAuthOpen(true)}
        onSuccess={async (paymentData) => {
          if (checkoutPrefills?.onSuccessOverride) {
            await checkoutPrefills.onSuccessOverride(paymentData.paymentDetails);
          } else {
            await handleCheckoutSuccess(paymentData);
          }
          setIsCheckoutOpen(false);
          setCheckoutPrefills(null);
        }}
      />

      {/* User Account Login & Registration Modal */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onLoginSuccess={handleUserLoginSuccess}
      />

      {/* Facebook Messenger Live Chat simulation overlay (for customers on the storefront) */}
      {activeTab === 'store' && (
        <FacebookLiveChat
          products={products}
          onTriggerCheckout={handleTriggerFacebookCheckout}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          whatsappNumber={whatsappNumber}
        />
      )}

      {/* Floating Simulated Email Inbox Trigger Button (Admin Only) */}
      {activeTab === 'admin' && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            id="email-sim-trigger-btn"
            onClick={() => setIsEmailClientOpen(true)}
            className="relative group flex items-center space-x-2 bg-stone-900 hover:bg-stone-850 active:scale-95 text-white rounded-full px-4 py-3 shadow-2xl border border-stone-800 transition-all font-sans font-bold text-xs cursor-pointer"
          >
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-500" />
              {sentEmails.filter(e => !e.isRead).length > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-amber-500 text-stone-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-stone-900 animate-bounce">
                  {sentEmails.filter(e => !e.isRead).length}
                </span>
              )}
            </div>
            <span className="text-stone-300 group-hover:text-amber-400 transition-colors">ইমেইল প্যানেল (Admin)</span>
          </button>
        </div>
      )}

      {/* Slide-in Simulated Email Toast Notification (Admin Only) */}
      {activeEmailToast && activeTab === 'admin' && (
        <div
          id="email-sent-toast"
          className="fixed top-20 right-6 z-50 bg-white border border-stone-200 rounded-xl shadow-2xl p-4 max-w-sm flex items-start space-x-3.5 border-l-4 border-l-amber-500 animate-bounce"
        >
          <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block font-mono">Admin Email Received</span>
            <h4 className="text-xs font-extrabold text-stone-900 truncate mt-0.5">{activeEmailToast.subject}</h4>
            <p className="text-[10px] text-stone-500 mt-1">Dispatched to: {activeEmailToast.recipient}</p>
            <button
              onClick={() => {
                setIsEmailClientOpen(true);
                setActiveEmailToast(null);
              }}
              className="mt-2.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 group focus:outline-none cursor-pointer"
            >
              Open Admin Inbox <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <button
            onClick={() => setActiveEmailToast(null)}
            className="text-stone-400 hover:text-stone-600 focus:outline-none shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simulated Email Client Inbox Modal Overlay (Admin Only) */}
      {activeTab === 'admin' && (
        <SimulatedInbox
          isOpen={isEmailClientOpen}
          onClose={() => setIsEmailClientOpen(false)}
          emails={sentEmails}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAllEmails}
          onDeleteEmail={handleDeleteEmail}
        />
      )}

      {/* User Order Tracking Modal Overlay */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orders={orders}
      />
    </div>
  );
}
