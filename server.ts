/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Product, Order, OrderStatus, OrderSource, TelegramConfig, FacebookSimulateResult } from './src/types.js';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

// Load env variables
dotenv.config();

// Firebase Server Integration Setup
const FIREBASE_DEFAULT_CONFIG = {
  apiKey: 'AIzaSyC3xqQctb-DOFzv8n5xSySxfG2iFG76uwE',
  authDomain: 'chithi-app-2025.firebaseapp.com',
  databaseURL: 'https://chithi-app-2025-default-rtdb.firebaseio.com',
  projectId: 'chithi-app-2025',
  storageBucket: 'chithi-app-2025.firebasestorage.app',
  messagingSenderId: '242886366018',
  appId: '1:242886366018:android:fc2fe423eda93f605eaedb'
};

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || FIREBASE_DEFAULT_CONFIG.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || FIREBASE_DEFAULT_CONFIG.authDomain,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || FIREBASE_DEFAULT_CONFIG.databaseURL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || FIREBASE_DEFAULT_CONFIG.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || FIREBASE_DEFAULT_CONFIG.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_DEFAULT_CONFIG.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || FIREBASE_DEFAULT_CONFIG.appId
};

let db: any = null;
let firebaseInitialized = false;

function initFirebase() {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    firebaseInitialized = true;
    console.log('[Firebase Server] Successfully initialized. Project ID:', firebaseConfig.projectId);
  } catch (err) {
    console.error('[Firebase Server] Failed to initialize Firestore:', err);
  }
}

async function saveProductToFirestore(p: Product) {
  if (!firebaseInitialized || !db) return;
  try {
    await setDoc(doc(db, 'products', p.id), {
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image,
      stock: p.stock,
      category: p.category,
      reviews: p.reviews || []
    });
  } catch (err) {
    console.warn('[Firebase Server] Failed to save product to Firestore (falling back to in-memory):', err);
  }
}

async function saveOrderToFirestore(o: Order) {
  if (!firebaseInitialized || !db) return;
  try {
    await setDoc(doc(db, 'orders', o.id), {
      items: o.items,
      total: o.total,
      customerName: o.customerName,
      shippingAddress: o.shippingAddress,
      customerEmail: o.customerEmail || '',
      source: o.source,
      status: o.status,
      createdAt: o.createdAt,
      paymentDetails: o.paymentDetails || null
    });
  } catch (err) {
    console.warn('[Firebase Server] Failed to save order to Firestore (falling back to in-memory):', err);
  }
}

async function saveChatMessageToFirestore(m: any) {
  if (!firebaseInitialized || !db) return;
  try {
    await setDoc(doc(db, 'facebook_chat', m.id), {
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp,
      orderCreatedId: m.orderCreatedId || null,
      parsedData: m.parsedData || null,
      paymentCompleted: m.paymentCompleted || null
    });
  } catch (err) {
    console.warn('[Firebase Server] Failed to save chat message to Firestore (falling back to in-memory):', err);
  }
}

async function saveSettingsToFirestore() {
  if (!firebaseInitialized || !db) return;
  try {
    await setDoc(doc(db, 'settings', 'facebook_chat'), { isDirectAdminMode });
  } catch (err) {
    console.warn('[Firebase Server] Failed to save chat mode settings to Firestore:', err);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database (seeded with elegant handmade products)
let products: Product[] = [
  {
    id: 'prod_1',
    name: 'Aura Ceramic Vase',
    price: 48.00,
    description: 'Hand-thrown matte white ceramic vase with subtle earth-toned speckles. Perfect for dried botanicals or minimalist floral arrangements.',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    category: 'Ceramics',
    reviews: [
      { id: 'rev_1_1', userName: 'Marcus Aurelius', rating: 5, comment: 'Absolutely gorgeous craftsmanship! It is the centerpiece of my dining room.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), verifiedPurchase: true }
    ]
  },
  {
    id: 'prod_2',
    name: 'Nomad Merino Throw Blanket',
    price: 110.00,
    description: 'Woven entirely by hand on traditional wooden looms. Features a beautiful cream and charcoal geometric fringe pattern using raw natural wool.',
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&auto=format&fit=crop&q=80',
    stock: 5,
    category: 'Textiles',
    reviews: []
  },
  {
    id: 'prod_3',
    name: 'Forest Sage Soy Candle',
    price: 24.00,
    description: 'Hand-poured candle made with organic soy wax, infused with pure essential oils of white sage, cedarwood, and wild eucalyptus in an amber glass jar.',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    category: 'Home Fragrance',
    reviews: [
      { id: 'rev_3_1', userName: 'Eleanor Vance', rating: 5, comment: 'The fragrance is incredibly calming. Hand-poured perfection!', createdAt: new Date(Date.now() - 86400000).toISOString(), verifiedPurchase: true }
    ]
  },
  {
    id: 'prod_4',
    name: 'Heritage Leather Journal',
    price: 36.00,
    description: 'Genuine full-grain leather cover bound by hand with sturdy linen thread. Filled with 120 sheets of recycled deckled-edge cotton paper.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    stock: 8,
    category: 'Stationery',
    reviews: []
  },
  {
    id: 'prod_5',
    name: 'Hand-Carved Wooden Bowl',
    price: 65.00,
    description: 'Carved out of single blocks of fallen walnut trees. Smoothed and seasoned with beeswax and cold-pressed linseed oil. Food safe.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
    stock: 4,
    category: 'Wooden Ware',
    reviews: []
  },
  {
    id: 'prod_6',
    name: 'Lunar Brass Wind Chime',
    price: 42.00,
    description: 'Delicate polished brass celestial shapes that reflect golden sunlight. Emits a rich, resonant bell sound when stirred by the breeze.',
    image: 'https://images.unsplash.com/photo-1528150177508-7cc0c36cda5c?w=600&auto=format&fit=crop&q=80',
    stock: 10,
    category: 'Decor',
    reviews: []
  }
];

let orders: Order[] = [
  {
    id: 'ORD-1001',
    items: [
      { productId: 'prod_3', productName: 'Forest Sage Soy Candle', quantity: 2, price: 24.00 }
    ],
    total: 48.00,
    customerName: 'Eleanor Vance',
    shippingAddress: '42 West Oak Lane, Portland, OR 97201',
    source: 'Website',
    status: 'Paid',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    paymentDetails: { cardBrand: 'visa', last4: '4242', transactionId: 'ch_sim_392f801a2' }
  },
  {
    id: 'ORD-1002',
    items: [
      { productId: 'prod_1', productName: 'Aura Ceramic Vase', quantity: 1, price: 48.00 },
      { productId: 'prod_4', productName: 'Heritage Leather Journal', quantity: 1, price: 36.00 }
    ],
    total: 84.00,
    customerName: 'Marcus Aurelius',
    shippingAddress: 'Via della Lungara 10, Rome, Italy',
    source: 'Telegram',
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

// Telegram Settings & Active Polling State
let telegramConfig: TelegramConfig = {
  token: '',
  chatId: '',
  botUsername: 'HandmadeStoreBot',
  isActive: false
};

// Log files for bot
interface SimulatedLog {
  id: string;
  timestamp: string;
  direction: 'inbound' | 'outbound' | 'system';
  sender: string;
  message: string;
}
let simulatedLogs: SimulatedLog[] = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    direction: 'system',
    sender: 'System',
    message: 'Telegram Bot Simulator initialized. Active & ready for incoming webhooks.'
  }
];

// Helper to push logs
function addLog(direction: 'inbound' | 'outbound' | 'system', sender: string, message: string) {
  simulatedLogs.push({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    direction,
    sender,
    message
  });
  if (simulatedLogs.length > 50) simulatedLogs.shift();
}

// Lazy Initialize Gemini
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// SSE clients for real-time synchronization
let sseClients: any[] = [];
function broadcast(event: string, data: any) {
  sseClients.forEach(client => {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// Real-time server-sent events connection
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  sseClients.push(res);
  
  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Products API
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { name, price, description, image, images, stock, category } = req.body;
  if (!name || typeof price !== 'number' || !category) {
    return res.status(400).json({ error: 'Missing or invalid fields.' });
  }
  const imgList: string[] = Array.isArray(images) && images.length > 0
    ? images
    : (image ? [image] : ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600']);

  const newProduct: Product = {
    id: 'prod_' + Math.random().toString(36).substr(2, 9),
    name,
    price,
    description: description || '',
    image: imgList[0],
    images: imgList,
    stock: typeof stock === 'number' ? stock : 5,
    category,
    reviews: []
  };
  products.push(newProduct);
  saveProductToFirestore(newProduct);
  broadcast('products_updated', products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, stock, category } = req.body;
  
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  
  products[idx] = {
    ...products[idx],
    name: name !== undefined ? name : products[idx].name,
    price: price !== undefined ? price : products[idx].price,
    description: description !== undefined ? description : products[idx].description,
    image: image !== undefined ? image : products[idx].image,
    stock: stock !== undefined ? stock : products[idx].stock,
    category: category !== undefined ? category : products[idx].category
  };
  
  saveProductToFirestore(products[idx]);
  broadcast('products_updated', products);
  res.json(products[idx]);
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { userName, rating, comment } = req.body;

  if (!userName || typeof rating !== 'number' || !comment) {
    return res.status(400).json({ error: 'Please provide all review details (name, rating, comment).' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const productIdx = products.findIndex(p => p.id === id);
  if (productIdx === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  // Verify if the user has purchased this item.
  // We search for any order containing this product, with matching customerName or customerEmail (case-insensitive)
  const normUser = userName.trim().toLowerCase();
  const hasPurchased = orders.some(order => {
    const hasItem = order.items.some(item => item.productId === id);
    if (!hasItem) return false;
    
    const nameMatch = order.customerName.trim().toLowerCase() === normUser;
    const emailMatch = order.customerEmail ? order.customerEmail.trim().toLowerCase() === normUser : false;
    
    return (nameMatch || emailMatch) && order.status !== 'Cancelled';
  });

  if (!hasPurchased) {
    return res.status(400).json({
      error: `Could not verify a purchase for "${products[productIdx].name}" under the name "${userName}". Please make sure you have checked out or completed a simulation order with this name first!`
    });
  }

  const newReview = {
    id: 'rev_' + Math.random().toString(36).substr(2, 9),
    userName: userName.trim(),
    rating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
    verifiedPurchase: true
  };

  if (!products[productIdx].reviews) {
    products[productIdx].reviews = [];
  }
  products[productIdx].reviews!.push(newReview);

  saveProductToFirestore(products[productIdx]);
  broadcast('products_updated', products);

  res.json({ success: true, product: products[productIdx] });
});

// Orders API
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { items, customerName, shippingAddress, customerEmail, source, paymentDetails } = req.body;
  
  if (!items || !items.length || !customerName || !shippingAddress) {
    return res.status(400).json({ error: 'Incomplete checkout parameters.' });
  }
  
  // Verify inventory and calculate total
  let total = 0;
  const verifiedItems = [];
  
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Product ${item.productName} no longer exists.` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient inventory for ${prod.name}.` });
    }
    
    prod.stock -= item.quantity;
    verifiedItems.push({
      productId: prod.id,
      productName: prod.name,
      quantity: item.quantity,
      price: prod.price
    });
    total += prod.price * item.quantity;
  }
  
  const newOrder: Order = {
    id: 'ORD-' + (1000 + orders.length + 1),
    items: verifiedItems,
    total,
    customerName,
    shippingAddress,
    customerEmail,
    source: source || 'Website',
    status: paymentDetails ? 'Paid' : 'Pending',
    createdAt: new Date().toISOString(),
    paymentDetails
  };
  
  orders.push(newOrder);
  
  // Persist order & updated inventory stocks in Firestore
  for (const item of verifiedItems) {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      saveProductToFirestore(prod);
    }
  }
  saveOrderToFirestore(newOrder);

  broadcast('products_updated', products);
  broadcast('orders_updated', orders);
  
  // Broadcast alert to Telegram Bot if configured
  notifyTelegramOrder(newOrder);
  
  res.status(211).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, paymentDetails } = req.body;
  
  const ord = orders.find(o => o.id === id);
  if (!ord) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  
  ord.status = status;
  if (paymentDetails) {
    ord.paymentDetails = paymentDetails;
  }
  
  saveOrderToFirestore(ord);
  broadcast('orders_updated', orders);
  
  // Update matching facebook chat message as well!
  const matchingFbMsg = facebookChatMessages.find(m => m.orderCreatedId === id);
  if (matchingFbMsg) {
    matchingFbMsg.paymentCompleted = true;
    saveChatMessageToFirestore(matchingFbMsg);
    
    const congratsMsg = {
      id: 'bot-congrats-' + Math.random().toString(36).substr(2, 9),
      sender: 'bot',
      text: `🎉 **পেমেন্ট সফল হয়েছে!**\nআপনার ডেলিভারি চার্জ পরিশোধ সম্পন্ন হয়েছে (TrxID: ${paymentDetails.transactionId})। আমরা আপনার অর্ডারটি চূড়ান্তভাবে কনফার্ম করেছি। দ্রুতই পণ্যটি আপনার ঠিকানায় পাঠিয়ে দেওয়া হবে। আমাদের সাথে থাকার জন্য ধন্যবাদ! 💖`,
      timestamp: new Date().toISOString(),
      orderCreatedId: id
    };
    facebookChatMessages.push(congratsMsg);
    saveChatMessageToFirestore(congratsMsg);
    
    broadcast('facebook_chat_updated', { messages: facebookChatMessages, isDirectAdminMode });
  }
  
  // Notify Telegram about status update
  notifyTelegramOrderStatus(ord);
  
  res.json(ord);
});

// Facebook Live Chat Store
let isDirectAdminMode = false;
let facebookChatMessages: any[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: "আসসালামু আলাইকুম! Closet Crush-এ আপনাকে স্বাগতম। 🌸\n\nআমাদের যেকোনো পণ্য সরাসরি ফেসবুক চ্যাটে কথা বলেও অর্ডার করতে পারেন! আপনার নাম, মোবাইল নম্বর, ঠিকানা এবং পণ্যের নাম নিচে লিখে মেসেজ দিন, আমাদের এআই (AI) সিস্টেম সাথে সাথে অর্ডার প্রসেস করে দেবে।",
    timestamp: new Date().toISOString()
  }
];

async function syncFromFirestore() {
  if (!firebaseInitialized || !db) return;
  try {
    // 1. Fetch products
    const productsCol = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCol);
    if (!productsSnapshot.empty) {
      const dbProducts: Product[] = [];
      productsSnapshot.forEach(doc => {
        dbProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      products = dbProducts;
      console.log(`[Firebase Server] Loaded ${products.length} products from Firestore.`);
    } else {
      console.log('[Firebase Server] Products collection is empty. Seeding initial items...');
      for (const p of products) {
        await saveProductToFirestore(p);
      }
    }

    // 2. Fetch orders
    const ordersCol = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCol);
    if (!ordersSnapshot.empty) {
      const dbOrders: Order[] = [];
      ordersSnapshot.forEach(doc => {
        dbOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      dbOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      orders = dbOrders;
      console.log(`[Firebase Server] Loaded ${orders.length} orders from Firestore.`);
    } else {
      console.log('[Firebase Server] Orders collection is empty. Seeding initial items...');
      for (const o of orders) {
        await saveOrderToFirestore(o);
      }
    }

    // 3. Fetch facebook chat messages
    const chatCol = collection(db, 'facebook_chat');
    const chatSnapshot = await getDocs(chatCol);
    if (!chatSnapshot.empty) {
      const dbChatMsgs: any[] = [];
      chatSnapshot.forEach(doc => {
        dbChatMsgs.push({ id: doc.id, ...doc.data() });
      });
      dbChatMsgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      facebookChatMessages = dbChatMsgs;
      console.log(`[Firebase Server] Loaded ${facebookChatMessages.length} chat messages from Firestore.`);
    } else {
      console.log('[Firebase Server] Facebook chat collection is empty. Seeding initial welcome message...');
      for (const m of facebookChatMessages) {
        await saveChatMessageToFirestore(m);
      }
    }

    // 4. Fetch admin mode settings
    const settingsCol = collection(db, 'settings');
    const settingsSnapshot = await getDocs(settingsCol);
    const chatSettingsDoc = settingsSnapshot.docs.find(d => d.id === 'facebook_chat');
    if (chatSettingsDoc) {
      isDirectAdminMode = !!chatSettingsDoc.data()?.isDirectAdminMode;
      console.log(`[Firebase Server] Loaded direct admin mode from Firestore: ${isDirectAdminMode}`);
    } else {
      await saveSettingsToFirestore();
    }
  } catch (err) {
    console.warn('[Firebase Server] Error during initial sync (falling back to local memory):', err);
  }
}

// Facebook Chat APIs
app.get('/api/facebook/chat', (req, res) => {
  res.json({ messages: facebookChatMessages, isDirectAdminMode });
});

app.post('/api/facebook/chat/toggle-admin', (req, res) => {
  const { enabled } = req.body;
  isDirectAdminMode = !!enabled;
  saveSettingsToFirestore();
  
  const sysMsg = {
    id: 'sys-' + Math.random().toString(36).substr(2, 9),
    sender: 'system',
    text: isDirectAdminMode 
      ? "🔔 সরাসরি এডমিন চ্যাট চালু হয়েছে। একজন এডমিন শীঘ্রই আপনার সাথে যুক্ত হবেন।" 
      : "🤖 স্বয়ংক্রিয় এআই (AI) অ্যাসিস্ট্যান্ট মোড চালু হয়েছে।",
    timestamp: new Date().toISOString()
  };
  facebookChatMessages.push(sysMsg);
  saveChatMessageToFirestore(sysMsg);
  
  broadcast('facebook_chat_updated', { messages: facebookChatMessages, isDirectAdminMode });
  res.json({ success: true, isDirectAdminMode, messages: facebookChatMessages });
});

app.post('/api/facebook/chat/clear', async (req, res) => {
  isDirectAdminMode = false;
  saveSettingsToFirestore();
  
  // Clear chat documents in Firestore
  if (firebaseInitialized && db) {
    try {
      const chatCol = collection(db, 'facebook_chat');
      const chatSnapshot = await getDocs(chatCol);
      for (const d of chatSnapshot.docs) {
        await deleteDoc(doc(db, 'facebook_chat', d.id));
      }
    } catch (e) {
      console.warn('[Firebase Server] Failed to clear chat collection in Firestore:', e);
    }
  }

  const welcomeMsg = {
    id: 'welcome-1',
    sender: 'bot',
    text: "আসসালামু আলাইকুম! Closet Crush-এ আপনাকে স্বাগতম। 🌸\n\nআমাদের যেকোনো পণ্য সরাসরি ফেসবুক চ্যাটে কথা বলেও অর্ডার করতে পারেন! আপনার নাম, মোবাইল নম্বর, ঠিকানা এবং পণ্যের নাম নিচে লিখে মেসেজ দিন, আমাদের এআই (AI) সিস্টেম সাথে সাথে অর্ডার প্রসেস করে দেবে।",
    timestamp: new Date().toISOString()
  };
  facebookChatMessages = [welcomeMsg];
  saveChatMessageToFirestore(welcomeMsg);
  
  broadcast('facebook_chat_updated', { messages: facebookChatMessages, isDirectAdminMode });
  res.json({ success: true, isDirectAdminMode, messages: facebookChatMessages });
});

app.post('/api/facebook/chat/message', (req, res) => {
  const { sender, text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Message text is required.' });
  }
  
  let adminAnnouncementAdded = false;
  if (sender === 'admin' && !isDirectAdminMode) {
    isDirectAdminMode = true;
    saveSettingsToFirestore();
    const joinedMsg = {
      id: 'sys-joined-' + Math.random().toString(36).substr(2, 9),
      sender: 'system',
      text: "🔔 এডমিন সরাসরি চ্যাটে যুক্ত হয়েছেন।",
      timestamp: new Date().toISOString()
    };
    facebookChatMessages.push(joinedMsg);
    saveChatMessageToFirestore(joinedMsg);
    adminAnnouncementAdded = true;
  }
  
  const newMsg = {
    id: Math.random().toString(36).substr(2, 9),
    sender,
    text,
    timestamp: new Date().toISOString()
  };
  
  facebookChatMessages.push(newMsg);
  saveChatMessageToFirestore(newMsg);
  broadcast('facebook_chat_updated', { messages: facebookChatMessages, isDirectAdminMode });
  
  res.json({ success: true, message: newMsg });
  
  // Auto bot response if user sent a message and isDirectAdminMode is false
  if (sender === 'user' && !isDirectAdminMode) {
    setTimeout(async () => {
      const ai = getGeminiClient();
      let parsedJson: any = null;
      
      if (ai) {
        try {
          const productSchema = products.map(p => `"${p.name}" (ID: ${p.id}, Price: $${p.price.toFixed(2)})`).join(', ');
          const systemPrompt = `You are an AI order processing clerk for an e-commerce website selling handmade goods. 
Extract the order specifications from the user's raw social media comment or message. 

Current Available Handmade Catalog:
[${productSchema}]

Return a structured JSON output mapping the text to fields.
JSON format requirements:
{
  "customerName": "Extracted customer name, or default to 'Facebook Buyer' if not mentioned",
  "productName": "Match the best product name from the catalog strictly, or null if no matching product was found",
  "productId": "Corresponding matching product ID from the catalog, or null",
  "quantity": number (integer, default to 1 if not specified),
  "shippingAddress": "Extracted shipping address or 'Facebook Pick Up' if not specified",
  "totalPriceEstimate": number
}

Raw customer input: "${text}"`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: systemPrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  customerName: { type: Type.STRING },
                  productName: { type: Type.STRING },
                  productId: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  shippingAddress: { type: Type.STRING },
                  totalPriceEstimate: { type: Type.NUMBER }
                },
                required: ['customerName', 'productName', 'quantity', 'shippingAddress']
              }
            }
          });
          const responseText = response.text || '{}';
          parsedJson = JSON.parse(responseText.trim());
        } catch (err: any) {
          console.warn('Gemini extraction inside chat message failed:', err);
        }
      }
      
      if (!parsedJson) {
        parsedJson = ruleBasedParse(text);
      }
      
      let botResponseText = '';
      let orderCreatedId: string | undefined = undefined;
      let matchedProduct: any = null;
      
      if (parsedJson && parsedJson.productId) {
        matchedProduct = products.find(p => p.id === parsedJson.productId);
      }
      
      if (!matchedProduct) {
        const matched = products.find(p => 
          text.toLowerCase().includes(p.name.toLowerCase()) || 
          text.toLowerCase().includes(p.category.toLowerCase().slice(0, -1))
        );
        if (matched) {
          matchedProduct = matched;
          parsedJson.productId = matched.id;
          parsedJson.productName = matched.name;
          parsedJson.totalPriceEstimate = matched.price * (parsedJson.quantity || 1);
        }
      }
      
      if (matchedProduct) {
        const qty = parsedJson.quantity || 1;
        if (matchedProduct.stock >= qty) {
          matchedProduct.stock -= qty;
          const orderId = 'ORD-' + (1000 + orders.length + 1);
          const newOrder: Order = {
            id: orderId,
            items: [{
              productId: matchedProduct.id,
              productName: matchedProduct.name,
              quantity: qty,
              price: matchedProduct.price
            }],
            total: matchedProduct.price * qty,
            customerName: parsedJson.customerName || 'Facebook Buyer',
            shippingAddress: parsedJson.shippingAddress || 'Facebook Direct Pickup',
            source: 'Facebook',
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
          orders.push(newOrder);
          orderCreatedId = orderId;
          
          saveOrderToFirestore(newOrder);
          saveProductToFirestore(matchedProduct);
          
          broadcast('products_updated', products);
          broadcast('orders_updated', orders);
          notifyTelegramOrder(newOrder);
          
          botResponseText = `অসংখ্য ধন্যবাদ! আপনার মেসেজটি এআই প্রযুক্তির সাহায্যে প্রসেস করা হয়েছে। 😊\n\n**অর্ডারের বিবরণ:**\n👤 ক্রেতা: ${parsedJson.customerName}\n📦 পণ্য: ${parsedJson.productName} (Qty: ${qty})\n📍 ঠিকানা: ${parsedJson.shippingAddress}\n💵 আনুমানিক মূল্য: $${parsedJson.totalPriceEstimate.toFixed(2)} (৳${(parsedJson.totalPriceEstimate * 120).toLocaleString()} BDT)\n\n**ডেলিভারি চার্জ পরিশোধ করুন:**\nআমাদের সিকিউর সিস্টেম অনুযায়ী অর্ডার কনফার্ম করতে ডেলিভারি চার্জ **৳১২০ ($১.০০)** অগ্রিম পরিশোধ করা বাধ্যতামূলক। বাকি টাকা পণ্য হাতে পেয়ে পরিশোধ করবেন।`;
        } else {
          botResponseText = `দুঃখিত, "${matchedProduct.name}" পণ্যটির পর্যাপ্ত স্টক নেই (অনুরোধ করা হয়েছে ${qty}, অবশিষ্ট স্টক ${matchedProduct.stock})।`;
        }
      } else {
        botResponseText = `দুঃখিত, আপনার মেসেজটি থেকে সম্পূর্ণ অর্ডারের তথ্য খুঁজে পাওয়া যায়নি।\n\nসঠিকভাবে অর্ডারের জন্য অনুগ্রহ করে পণ্যটির নাম ও ঠিকানা উল্লেখ করুন। যেমন: "আমি ১টি Aura Ceramic Vase কিনতে চাই। আমার ঠিকানা ধানমন্ডি, ঢাকা।"\n\nআপনি চাইলে উপর থেকে **"এডমিনের সাথে সরাসরি চ্যাট"** অপশনটি চালু করে সরাসরি আমাদের এডমিনের সাথে কথা বলতে পারেন!`;
      }
      
      const botMsg = {
        id: 'bot-' + Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toISOString(),
        orderCreatedId,
        parsedData: matchedProduct ? parsedJson : undefined
      };
      facebookChatMessages.push(botMsg);
      saveChatMessageToFirestore(botMsg);
      
      broadcast('facebook_chat_updated', { messages: facebookChatMessages, isDirectAdminMode });
    }, 1000);
  }
});

// Facebook Page Comment Simulation (Gemini integration!)
app.post('/api/facebook/simulate', async (req, res) => {
  const { commentText } = req.body;
  if (!commentText) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }
  
  const ai = getGeminiClient();
  let parsedJson: any = null;
  
  if (ai) {
    try {
      // Craft a detailed prompt with list of products so Gemini can accurately map them!
      const productSchema = products.map(p => `"${p.name}" (ID: ${p.id}, Price: $${p.price.toFixed(2)})`).join(', ');
      const systemPrompt = `You are an AI order processing clerk for an e-commerce website selling handmade goods. 
Extract the order specifications from the user's raw social media comment or message. 

Current Available Handmade Catalog:
[${productSchema}]

Return a structured JSON output mapping the text to fields.
JSON format requirements:
{
  "customerName": "Extracted customer name, or default to 'Facebook Buyer' if not mentioned",
  "productName": "Match the best product name from the catalog strictly, or null if no matching product was found",
  "productId": "Corresponding matching product ID from the catalog, or null",
  "quantity": number (integer, default to 1 if not specified),
  "shippingAddress": "Extracted shipping address or 'Facebook Pick Up' if not specified",
  "totalPriceEstimate": number
}

Raw customer input: "${commentText}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customerName: { type: Type.STRING },
              productName: { type: Type.STRING },
              productId: { type: Type.STRING },
              quantity: { type: Type.INTEGER },
              shippingAddress: { type: Type.STRING },
              totalPriceEstimate: { type: Type.NUMBER }
            },
            required: ['customerName', 'productName', 'quantity', 'shippingAddress']
          }
        }
      });
      
      const responseText = response.text || '{}';
      parsedJson = JSON.parse(responseText.trim());
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini Extraction Notice] AI parsing encountered an issue: ${errMsg}. Utilizing robust rule-based fallback.`);
    }
  }
  
  // Fallback Rule-based parser if Gemini is not set up or fails
  if (!parsedJson) {
    parsedJson = ruleBasedParse(commentText);
  }
  
  // Validate if we matched a product
  if (!parsedJson.productId) {
    // Try to match product by loose substring
    const matched = products.find(p => 
      commentText.toLowerCase().includes(p.name.toLowerCase()) || 
      commentText.toLowerCase().includes(p.category.toLowerCase().slice(0, -1)) ||
      (parsedJson.productName && p.name.toLowerCase().includes(parsedJson.productName.toLowerCase()))
    );
    if (matched) {
      parsedJson.productId = matched.id;
      parsedJson.productName = matched.name;
      parsedJson.totalPriceEstimate = matched.price * (parsedJson.quantity || 1);
    } else {
      // Default to product 1
      parsedJson.productId = products[0].id;
      parsedJson.productName = products[0].name;
      parsedJson.totalPriceEstimate = products[0].price * (parsedJson.quantity || 1);
    }
  }
  
  // Make sure product exists and stock checks out
  const targetProduct = products.find(p => p.id === parsedJson.productId);
  if (!targetProduct) {
    return res.status(400).json({ error: 'Unable to resolve any matching product.' });
  }
  
  const quantity = parsedJson.quantity || 1;
  if (targetProduct.stock < quantity) {
    return res.json({
      success: false,
      rawComment: commentText,
      parsedData: parsedJson,
      error: `Product "${targetProduct.name}" matches but has insufficient inventory (Requested ${quantity}, Available ${targetProduct.stock}).`
    });
  }
  
  // Deduct inventory
  targetProduct.stock -= quantity;
  
  // Create Order
  const orderId = 'ORD-' + (1000 + orders.length + 1);
  const newOrder: Order = {
    id: orderId,
    items: [{
      productId: targetProduct.id,
      productName: targetProduct.name,
      quantity,
      price: targetProduct.price
    }],
    total: targetProduct.price * quantity,
    customerName: parsedJson.customerName,
    shippingAddress: parsedJson.shippingAddress,
    source: 'Facebook',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  saveProductToFirestore(targetProduct);
  saveOrderToFirestore(newOrder);
  
  broadcast('products_updated', products);
  broadcast('orders_updated', orders);
  
  // Trigger Telegram
  notifyTelegramOrder(newOrder);
  
  const result: FacebookSimulateResult = {
    success: true,
    rawComment: commentText,
    parsedData: parsedJson,
    orderCreated: newOrder
  };
  
  res.json(result);
});

// Simple regex parser fallback supporting English & Bengali
function ruleBasedParse(text: string) {
  const convertBengaliDigits = (str: string): string => {
    const bToE: { [key: string]: string } = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return str.replace(/[০-৯]/g, d => bToE[d]);
  };

  const t = text.toLowerCase();
  const normalizedText = convertBengaliDigits(t);
  
  let quantity = 1;
  // Match Bengali-style count "২টি" or English "2 items" / "2"
  const numMatch = normalizedText.match(/(\d+)\s*টি/) || normalizedText.match(/\b(\d+)\b/);
  if (numMatch) {
    quantity = parseInt(numMatch[1], 10);
  }
  
  let customerName = 'Facebook Page Buyer';
  // Try matching Bengali names "আমার নাম মইনুল হোসেন"
  const nameMatchBn = text.match(/(?:আমার নাম|নাম|ক্রেতা)\s*[:\s-]*\s*([^\s,।\n]+(?:\s+[^\s,।\n]+)?)/);
  const nameMatchEn = text.match(/(?:my name is|i'm|this is|behalf of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nameMatchBn) {
    customerName = nameMatchBn[1].trim();
  } else if (nameMatchEn) {
    customerName = nameMatchEn[1].trim();
  }
  
  let shippingAddress = 'Facebook Direct Pickup';
  // Try matching Bengali addresses "ঠিকানা: হাউজ ১২, ধানমন্ডি"
  const addrMatchBn = text.match(/(?:ঠিকানা|ঠিকানা হলো|ডেলিভারি)\s*[:\s-]*\s*([^?.!,।\n]+)/);
  const addrMatchEn = text.match(/(?:deliver to|ship to|address is|at)\s+([^?.!,]+)/i);
  if (addrMatchBn) {
    shippingAddress = addrMatchBn[1].trim();
  } else if (addrMatchEn) {
    shippingAddress = addrMatchEn[1].trim();
  }
  
  // Find matching product in catalog
  let matchedProduct = products[0];
  let maxScore = 0;
  for (const p of products) {
    const pName = p.name.toLowerCase();
    if (t.includes(pName)) {
      matchedProduct = p;
      break;
    }
    const words = pName.split(' ');
    let score = 0;
    for (const w of words) {
      if (w.length > 3 && t.includes(w)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matchedProduct = p;
    }
  }
  
  return {
    customerName,
    productName: matchedProduct.name,
    productId: matchedProduct.id,
    quantity,
    shippingAddress,
    totalPriceEstimate: matchedProduct.price * quantity
  };
}

// Telegram Integration endpoints
app.get('/api/telegram/status', (req, res) => {
  res.json({
    config: telegramConfig,
    logs: simulatedLogs
  });
});

app.post('/api/telegram/config', (req, res) => {
  const { token, chatId, botUsername } = req.body;
  
  telegramConfig = {
    token: token || '',
    chatId: chatId || '',
    botUsername: botUsername || 'HandmadeStoreBot',
    isActive: !!token && !!chatId
  };
  
  addLog('system', 'System', `Configuration updated. Real Bot Connection: ${telegramConfig.isActive ? 'ENABLED' : 'DISABLED (Simulator Mode)'}`);
  
  if (telegramConfig.isActive) {
    initializeRealTelegramPolling();
  }
  
  broadcast('telegram_status', { config: telegramConfig, logs: simulatedLogs });
  res.json({ success: true, config: telegramConfig });
});

// Simulated interaction with Telegram Bot (User chatting on Telegram screen)
app.post('/api/telegram/simulate-chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is empty.' });
  
  addLog('inbound', 'Customer', message);
  
  const responseText = processTelegramCommand(message);
  
  setTimeout(() => {
    addLog('outbound', 'Bot', responseText);
    broadcast('telegram_message_simulated', { logs: simulatedLogs });
  }, 600);
  
  res.json({ success: true });
});

// Process Telegram Bot input and return output string
function processTelegramCommand(input: string): string {
  const text = input.trim();
  const cmd = text.toLowerCase().split(' ')[0];
  
  if (cmd === '/start' || cmd === '/help') {
    return `👋 Welcome to the Handmade Goods Marketplace Bot!\n\nHere are my commands:\n📦 /products - Browse handmade inventory\n🛒 /orders - View recent store orders\n🔍 /status <id> - Track order status\n📦 /stock <id> - Check item inventory\n🙋‍♂️ /help - View this help menu`;
  }
  
  if (cmd === '/products') {
    let resp = `🏺 Current Handmade Catalog:\n\n`;
    products.forEach((p, idx) => {
      resp += `${idx + 1}. *${p.name}* - $${p.price.toFixed(2)}\n`;
      resp += `   Category: ${p.category}\n`;
      resp += `   Stock: ${p.stock > 0 ? `${p.stock} left` : '⚠️ OUT OF STOCK'}\n\n`;
    });
    return resp;
  }
  
  if (cmd === '/orders') {
    let resp = `📝 Recent Store Orders:\n\n`;
    orders.slice(-5).reverse().forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      resp += `• *${o.id}* | $${o.total.toFixed(2)} | *${o.status}*\n`;
      resp += `  Source: ${o.source} | Customer: ${o.customerName}\n\n`;
    });
    return resp;
  }
  
  if (cmd === '/status') {
    const parts = text.split(' ');
    if (parts.length < 2) return `⚠️ Usage: /status <order_id>\nExample: /status ORD-1002`;
    const orderId = parts[1].toUpperCase();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return `❌ Order ${orderId} not found.`;
    
    let resp = `🔍 Order Tracking *${ord.id}*\n`;
    resp += `Status: *${ord.status}*\n`;
    resp += `Customer: ${ord.customerName}\n`;
    resp += `Address: ${ord.shippingAddress}\n`;
    resp += `Total: $${ord.total.toFixed(2)}\n`;
    resp += `Items:\n`;
    ord.items.forEach(i => {
      resp += ` - ${i.quantity}x ${i.productName}\n`;
    });
    return resp;
  }
  
  if (cmd === '/stock') {
    const parts = text.split(' ');
    if (parts.length < 2) return `⚠️ Usage: /stock <prod_id> (e.g., prod_1)`;
    const prodId = parts[1];
    const prod = products.find(p => p.id === prodId || p.name.toLowerCase().includes(prodId.toLowerCase()));
    if (!prod) return `❌ Product not found.`;
    
    return `📦 Inventory Status for *${prod.name}*:\nStock Level: *${prod.stock} items*\nPrice: $${prod.price.toFixed(2)}\nCategory: ${prod.category}`;
  }
  
  return `❓ Unknown command "${text}". Type /help to see what I can do!`;
}

// Push live Telegram notifications if a physical bot is configured
async function notifyTelegramOrder(order: Order) {
  addLog('system', 'System', `🔔 Alert: New order ${order.id} received from ${order.source} ($${order.total.toFixed(2)})`);
  
  const text = `🔔 *New Order Received!*\n\n` +
    `Order ID: *${order.id}*\n` +
    `Source: *${order.source}*\n` +
    `Customer: ${order.customerName}\n` +
    `Shipping: ${order.shippingAddress}\n` +
    `Total: *$${order.total.toFixed(2)}*\n\n` +
    `*Items:* \n` +
    order.items.map(i => ` - ${i.quantity}x ${i.productName} ($${i.price.toFixed(2)})`).join('\n');
    
  if (telegramConfig.isActive && telegramConfig.chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text,
          parse_mode: 'Markdown'
        })
      });
      addLog('outbound', 'Bot (Real)', `Sent alert for order ${order.id} to chat ID ${telegramConfig.chatId}`);
    } catch (err) {
      console.error('Failed to send real Telegram notification:', err);
    }
  }
  
  // Always trigger simulator notification
  broadcast('telegram_status', { config: telegramConfig, logs: simulatedLogs });
}

async function notifyTelegramOrderStatus(order: Order) {
  addLog('system', 'System', `🔔 Order ${order.id} status updated to: ${order.status}`);
  
  const text = `🔔 *Order Status Update!*\n\n` +
    `Order ID: *${order.id}*\n` +
    `Customer: ${order.customerName}\n` +
    `New Status: *${order.status}* 📦`;
    
  if (telegramConfig.isActive && telegramConfig.chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text,
          parse_mode: 'Markdown'
        })
      });
    } catch (err) {
      console.error('Failed to send real Telegram notification:', err);
    }
  }
  
  // Always trigger simulator notification
  broadcast('telegram_status', { config: telegramConfig, logs: simulatedLogs });
}

// REAL Physical Telegram Bot Polling
let pollTimeoutId: any = null;
let lastUpdateId = 0;

function initializeRealTelegramPolling() {
  if (pollTimeoutId) {
    clearTimeout(pollTimeoutId);
    pollTimeoutId = null;
  }
  
  if (!telegramConfig.isActive) return;
  
  addLog('system', 'System', `Starting real long-polling for Bot token: ${telegramConfig.token.substring(0, 10)}...`);
  pollTelegramUpdates();
}

async function pollTelegramUpdates() {
  if (!telegramConfig.isActive) return;
  
  try {
    const url = `https://api.telegram.org/bot${telegramConfig.token}/getUpdates?offset=${lastUpdateId}&timeout=20`;
    const res = await fetch(url);
    const data: any = await res.json();
    
    if (data && data.ok && data.result && data.result.length) {
      for (const update of data.result) {
        lastUpdateId = update.update_id + 1;
        
        if (update.message && update.message.text) {
          const fromUser = update.message.from?.username || update.message.from?.first_name || 'User';
          const msgText = update.message.text;
          const chatId = update.message.chat.id;
          
          addLog('inbound', `Telegram User (@${fromUser})`, msgText);
          
          const reply = processTelegramCommand(msgText);
          
          // Send response back
          await fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply,
              parse_mode: 'Markdown'
            })
          });
          
          addLog('outbound', 'Bot (Real)', `Replied to @${fromUser}: ${reply.substring(0, 30)}...`);
          broadcast('telegram_status', { config: telegramConfig, logs: simulatedLogs });
        }
      }
    }
  } catch (err: any) {
    console.error('Telegram polling error:', err);
    addLog('system', 'System', `Polling error: ${err.message}. Retrying...`);
  }
  
  // Loop again in 1 second
  pollTimeoutId = setTimeout(pollTelegramUpdates, 1000);
}

// Initialize any existing real polling on boot if keys were injected
if (telegramConfig.isActive) {
  initializeRealTelegramPolling();
}

// Setup Vite & static assets
async function startServer() {
  // Initialize Firebase Server side and load remote Firestore state
  initFirebase();
  await syncFromFirestore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
