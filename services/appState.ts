export type UserRole = 'create' | 'shop' | 'chat' | 'business';

export type BusinessVerificationStatus = 'unverified' | 'pending' | 'verified';

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  businessType: string;
  address: string;
  location?: { lat: number; lng: number };
  googleMapsLink?: string;
  documents: {
    idCardFront?: string;
    idCardBack?: string;
    businessCertificate?: string;
    proofOfAddress?: string;
  };
  submittedAt?: string;
}

export interface TrackingEvent {
  id: string;
  status: 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';
  label: string;
  timestamp: string;
  location?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  trackingNumber: string;
  createdAt: string;
  events: TrackingEvent[];
}

const KEYS = {
  role: 'gigavibe_role',
  businessStatus: 'gigavibe_business_status',
  businessProfile: 'gigavibe_business_profile',
  walletPin: 'gigavibe_wallet_pin',
  orders: 'gigavibe_orders'
} as const;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const appState = {
  getRole(): UserRole | null {
    const v = localStorage.getItem(KEYS.role);
    if (v === 'create' || v === 'shop' || v === 'chat' || v === 'business') return v;
    return null;
  },
  setRole(role: UserRole) {
    localStorage.setItem(KEYS.role, role);
  },

  getBusinessStatus(): BusinessVerificationStatus {
    const v = localStorage.getItem(KEYS.businessStatus);
    if (v === 'pending' || v === 'verified' || v === 'unverified') return v;
    return 'unverified';
  },
  setBusinessStatus(status: BusinessVerificationStatus) {
    localStorage.setItem(KEYS.businessStatus, status);
  },
  getBusinessProfile(): BusinessProfile | null {
    return safeJsonParse<BusinessProfile>(localStorage.getItem(KEYS.businessProfile));
  },
  setBusinessProfile(profile: BusinessProfile) {
    localStorage.setItem(KEYS.businessProfile, JSON.stringify(profile));
  },

  getWalletPin(): string | null {
    const v = localStorage.getItem(KEYS.walletPin);
    return v && /^\d{4}$/.test(v) ? v : null;
  },
  setWalletPin(pin: string) {
    localStorage.setItem(KEYS.walletPin, pin);
  },

  getOrders(): Order[] {
    return safeJsonParse<Order[]>(localStorage.getItem(KEYS.orders)) || [];
  },
  setOrders(orders: Order[]) {
    localStorage.setItem(KEYS.orders, JSON.stringify(orders));
  }
};

