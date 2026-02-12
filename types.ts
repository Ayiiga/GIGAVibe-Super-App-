
export enum TabType {
  SOCIAL = 'SOCIAL',
  CHATS = 'CHATS',
  MARKETPLACE = 'MARKETPLACE',
  AI_LAB = 'AI_LAB',
  WALLET = 'WALLET',
  ORDERS = 'ORDERS'
}

export interface BusinessProfile {
  businessName: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  idCardUrl: string;
  businessCertUrl: string;
  isVerified: boolean;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  estimatedDelivery: string;
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  contentUrl?: string;
  audioUrl?: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  type?: 'image' | 'video' | 'audio' | 'story' | 'text';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type?: 'text' | 'system' | 'image';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  videoUrl?: string;
  isBoosted: boolean;
  category: string;
  vendorVerified?: boolean;
  socialShares?: number;
}

export interface Transaction {
  id: string;
  type: 'payout' | 'purchase' | 'received';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}
