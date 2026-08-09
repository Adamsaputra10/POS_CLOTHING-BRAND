export interface CashierShift {
  name: string;
  shift: string;
  station: string;
  loginTime?: string;
}

export type AppTab = 'pos' | 'orders' | 'inventory' | 'cms' | 'reports' | 'settings';

export type ClothingCategory = 
  | 'OVERSIZED TEES'
  | 'HOODIES & SWEATERS'
  | 'CARGO & PANTS'
  | 'VESTS & JACKETS'
  | 'ACCESSORIES';

export type Size = 'S' | 'M' | 'L' | 'XL';

export type ColorVariant = 'Monochrome Black' | 'Vintage White' | 'Electric Blue';

export interface VariantStock {
  color: ColorVariant;
  size: Size;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  category: ClothingCategory;
  price: number;
  originalPrice?: number;
  materialSpec: string; // e.g. "Heavyweight Cotton Combed 24s - Boxy Fit"
  description: string;
  imageUrl: string;
  colorImages?: Record<string, string>; // e.g. { "Monochrome Black": "data:...", "Vintage White": "..." }
  variants: VariantStock[];
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  cartItemId: string; // unique ID per item + size + color combination
  productId: string;
  productName: string;
  category: ClothingCategory;
  price: number;
  imageUrl: string;
  selectedSize: Size;
  selectedColor: ColorVariant;
  quantity: number;
  materialSpec: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'BANK_TRANSFER';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type OrderSource = 'POS_OFFLINE' | 'WEB_STOREFRONT';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  selectedSize: Size;
  selectedColor: ColorVariant;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string; // e.g., "IVS-202608-8492"
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderSource: OrderSource;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  cashAmountPaid?: number;
  cashChange?: number;
  qrisRefNo?: string;
  trackingNumber?: string; // Nomot Resi Pengiriman
  items: OrderItem[];
  createdAt: string;
  cashierName?: string;
}

export interface CourierOption {
  id: string;
  name: string; // e.g. "JNE Reguler", "J&T Express", "SiCepat BEST", "GoSend Instant"
  price: number;
  estimatedDays: string;
  isAvailable: boolean;
}

export interface PaymentGatewayOption {
  id: string;
  name: string;
  accountNumber?: string;
  accountName?: string;
  isAvailable: boolean;
  type: 'QRIS' | 'BANK' | 'COD';
}

export interface StoreSettings {
  storeName: string; // "ILYASVIEL APPAREL"
  tagline: string; // "INDONESIAN HEAVYWEIGHT STREETWEAR & BOXY CUTS"
  announcementText: string;
  storeAddress: string;
  storePhone: string;
  instagramHandle: string;
  websiteUrl: string;
  qrisMerchantName: string;
  couriers: CourierOption[];
  paymentGateways: PaymentGatewayOption[];
  taxRatePercent: number; // e.g. 0 or 10
  heroBannerUrl?: string; // Foto Hero Banner Utama
  promoBannerUrl?: string; // Foto Banner Promo / Graphic
  ctaText?: string; // Teks tombol CTA, e.g., "SHOP NOW"
  promoTagline?: string; // Teks Tagline Banner, e.g., "TOO YOUNG TO STAY ORDINARY"
}
