
export enum SubscriptionTier {
  FREE = 'FREE',
  BASE = 'BASE',
  POPULAR = 'POPULAR',
  ENTERPRISE = 'ENTERPRISE'
}

export interface UserState {
  tier: SubscriptionTier;
  photosUsedToday: number;
  isLoggedIn: boolean;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'audio' | 'video';
  metadata?: any;
}

export interface GenerationConfig {
  prompt: string;
  type: 'image' | 'video';
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: '1K' | '2K' | '4K';
}
