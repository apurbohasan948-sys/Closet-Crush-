import { Product, Order } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Aura Ceramic Vase',
    price: 1200,
    description: 'Hand-thrown matte white ceramic vase with subtle earth-toned speckles. Perfect for dried botanicals or minimalist floral arrangements.',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    category: 'Ceramics',
    reviews: [
      { id: 'rev_1_1', userName: 'Marcus Aurelius', rating: 5, comment: 'Absolutely gorgeous craftsmanship! It is the centerpiece of my dining room.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), verifiedPurchase: true }
    ]
  },
  {
    id: 'prod_2',
    name: 'Nomad Merino Throw Blanket',
    price: 2800,
    description: 'Woven entirely by hand on traditional wooden looms. Features a beautiful cream and charcoal geometric fringe pattern using raw natural wool.',
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528938102132-4a9276b8e320?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 5,
    category: 'Textiles',
    reviews: []
  },
  {
    id: 'prod_3',
    name: 'Forest Sage Soy Candle',
    price: 650,
    description: 'Hand-poured candle made with organic soy wax, infused with pure essential oils of white sage, cedarwood, and wild eucalyptus in an amber glass jar.',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 25,
    category: 'Home Fragrance',
    reviews: [
      { id: 'rev_3_1', userName: 'Eleanor Vance', rating: 5, comment: 'The fragrance is incredibly calming. Hand-poured perfection!', createdAt: new Date(Date.now() - 86400000).toISOString(), verifiedPurchase: true }
    ]
  },
  {
    id: 'prod_4',
    name: 'Heritage Leather Journal',
    price: 950,
    description: 'Genuine full-grain leather cover bound by hand with sturdy linen thread. Filled with 120 sheets of recycled deckled-edge cotton paper.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 8,
    category: 'Stationery',
    reviews: []
  },
  {
    id: 'prod_5',
    name: 'Hand-Carved Wooden Bowl',
    price: 1650,
    description: 'Carved out of single blocks of fallen walnut trees. Smoothed and seasoned with beeswax and cold-pressed linseed oil. Food safe.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 4,
    category: 'Wooden Ware',
    reviews: []
  },
  {
    id: 'prod_6',
    name: 'Lunar Brass Wind Chime',
    price: 1400,
    description: 'Delicate polished brass celestial shapes that reflect golden sunlight. Emits a rich, resonant bell sound when stirred by the breeze.',
    image: 'https://images.unsplash.com/photo-1528150177508-7cc0c36cda5c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1528150177508-7cc0c36cda5c?w=600&auto=format&fit=crop&q=80'
    ],
    stock: 10,
    category: 'Decor',
    reviews: []
  }
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'Ramim Hasan',
    customerEmail: 'ramimhasan920@gmail.com',
    shippingAddress: 'Gulshan-2, Dhaka, Bangladesh',
    source: 'Website',
    items: [
      {
        productId: 'prod_1',
        productName: 'Aura Ceramic Vase',
        price: 1200,
        quantity: 1
      }
    ],
    total: 1200,
    paymentDetails: {
      cardBrand: 'bKash',
      last4: '0000',
      transactionId: 'TRX9920391'
    },
    status: 'Shipped',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
