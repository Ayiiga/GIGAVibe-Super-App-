
export enum TabType {
  SOCIAL = 'SOCIAL',
  CHATS = 'CHATS',
  MARKETPLACE = 'MARKETPLACE',
  AI_LAB = 'AI_LAB',
  WALLET = 'WALLET'
}

// Content types for creator uploads
export type ContentType = 'photo' | 'video' | 'short' | 'story' | 'audio';

export interface CreatorContent {
  id: string;
  type: ContentType;
  url: string;
  thumbnail?: string;
  duration?: number; // For video/audio in seconds
  expiresAt?: string; // For stories
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  contentUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  contentType?: ContentType;
  audioUrl?: string;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type?: 'text' | 'system' | 'image';
}

// Business Registration Types
export interface BusinessRegistration {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  idCardFront?: string;
  idCardBack?: string;
  businessCertificate?: string;
  businessType: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
}

// Order Tracking Types
export interface OrderTracking {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'delivered';
  estimatedDelivery: string;
  trackingNumber?: string;
  carrier?: string;
  timeline: TrackingEvent[];
  sellerName: string;
  buyerAddress: string;
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  location?: string;
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
  vendorId?: string;
}

// Boost Post Types
export interface BoostConfig {
  postId: string;
  budget: number; // $1 to $100
  days: number;
  estimatedReach: number;
  targetAudience?: string[];
  startDate: string;
}

// Wallet Types
export interface WalletSettings {
  pin: string;
  pinSetup: boolean;
  biometricEnabled: boolean;
  lastPinChange?: string;
}

export interface Transaction {
  id: string;
  type: 'payout' | 'purchase' | 'received' | 'boost';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
  description?: string;
}
