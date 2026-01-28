
export enum TabType {
  SOCIAL = 'SOCIAL',
  CHATS = 'CHATS',
  MARKETPLACE = 'MARKETPLACE',
  AI_LAB = 'AI_LAB',
  WALLET = 'WALLET'
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
