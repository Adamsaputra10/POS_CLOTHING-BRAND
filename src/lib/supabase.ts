import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, StoreSettings, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS } from '../data/initialData';

const LOCAL_PRODUCTS_KEY = 'ilyasviel_pos_products_v2';
const LOCAL_ORDERS_KEY = 'ilyasviel_pos_orders_v2';
const LOCAL_SETTINGS_KEY = 'ilyasviel_pos_settings_v2';
const LOCAL_SUPABASE_URL_KEY = 'ilyasviel_supabase_url';
const LOCAL_SUPABASE_KEY_KEY = 'ilyasviel_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(LOCAL_SUPABASE_URL_KEY) || '';
  const localKey = localStorage.getItem(LOCAL_SUPABASE_KEY_KEY) || '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey
  };
}

export function setSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(LOCAL_SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(LOCAL_SUPABASE_KEY_KEY, anonKey.trim());
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    try {
      cachedClient = createClient(url, anonKey);
      return cachedClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function isSupabaseConnected(): boolean {
  return getSupabaseClient() !== null;
}

/* ================= Local Storage Utilities ================= */
export function getLocalProducts(): Product[] {
  const data = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

export function setLocalProducts(products: Product[]) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

export function getLocalOrders(): Order[] {
  const data = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ORDERS;
  }
}

export function setLocalOrders(orders: Order[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

export function getLocalSettings(): StoreSettings {
  const data = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_SETTINGS;
  }
}

export function setLocalSettings(settings: StoreSettings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

/* ================= Data Access API (Supabase or Local) ================= */

export async function loadProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('products').select('*');
      if (!error && data && data.length > 0) {
        // Parse JSON variants if stored as JSON string or object
        const formattedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          originalPrice: item.original_price || undefined,
          materialSpec: item.material_spec || '',
          description: item.description || '',
          imageUrl: item.image_url || '',
          colorImages: typeof item.color_images === 'string' ? JSON.parse(item.color_images) : (item.color_images || undefined),
          variants: typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants,
          isActive: item.is_active ?? true,
          createdAt: item.created_at || new Date().toISOString()
        }));
        setLocalProducts(formattedProducts);
        return formattedProducts;
      }
    } catch (err) {
      console.warn('Supabase fetch products error, using local fallback:', err);
    }
  }
  return getLocalProducts();
}

export async function saveProduct(product: Product): Promise<void> {
  // Always update local state
  const current = getLocalProducts();
  const idx = current.findIndex((p) => p.id === product.id);
  let updated: Product[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = product;
  } else {
    updated = [product, ...current];
  }
  setLocalProducts(updated);

  // Sync to Supabase if connected
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        material_spec: product.materialSpec,
        description: product.description,
        image_url: product.imageUrl,
        color_images: product.colorImages ? JSON.stringify(product.colorImages) : null,
        variants: JSON.stringify(product.variants),
        is_active: product.isActive,
        created_at: product.createdAt
      });
    } catch (err) {
      console.warn('Supabase product upsert failed:', err);
    }
  }
}

export async function loadOrders(): Promise<Order[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: ordersData, error: ordersErr } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ordersErr && ordersData && ordersData.length > 0) {
        // Fetch order items
        const { data: itemsData } = await client.from('order_items').select('*');
        const itemsByOrderId: Record<string, any[]> = {};
        if (itemsData) {
          itemsData.forEach((it: any) => {
            if (!itemsByOrderId[it.order_id]) itemsByOrderId[it.order_id] = [];
            itemsByOrderId[it.order_id].push({
              id: it.id,
              orderId: it.order_id,
              productId: it.product_id,
              productName: it.product_name,
              selectedSize: it.selected_size,
              selectedColor: it.selected_color,
              quantity: it.quantity,
              unitPrice: it.unit_price,
              subtotal: it.subtotal
            });
          });
        }

        const fullOrders: Order[] = ordersData.map((ord: any) => ({
          id: ord.id,
          orderNumber: ord.order_number || ord.id,
          customerName: ord.customer_name || 'Pelanggan',
          customerPhone: ord.customer_phone || undefined,
          shippingAddress: ord.shipping_address || undefined,
          orderSource: ord.order_source || 'POS_OFFLINE',
          status: ord.status || 'COMPLETED',
          paymentMethod: ord.payment_method || 'CASH',
          subtotal: ord.subtotal || 0,
          discount: ord.discount || 0,
          tax: ord.tax || 0,
          shippingFee: ord.shipping_fee || 0,
          total: ord.total || 0,
          cashAmountPaid: ord.cash_amount_paid || undefined,
          cashChange: ord.cash_change || undefined,
          qrisRefNo: ord.qris_ref_no || undefined,
          trackingNumber: ord.tracking_number || undefined,
          cashierName: ord.cashier_name || undefined,
          createdAt: ord.created_at || new Date().toISOString(),
          items: itemsByOrderId[ord.id] || []
        }));

        setLocalOrders(fullOrders);
        return fullOrders;
      }
    } catch (err) {
      console.warn('Supabase fetch orders error, using local fallback:', err);
    }
  }
  return getLocalOrders();
}

export async function saveOrder(order: Order): Promise<void> {
  const current = getLocalOrders();
  const updated = [order, ...current.filter((o) => o.id !== order.id)];
  setLocalOrders(updated);

  // Deducing variant stock
  const products = getLocalProducts();
  order.items.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      const v = prod.variants.find(
        (varItem) => varItem.size === item.selectedSize && varItem.color === item.selectedColor
      );
      if (v && v.stock >= item.quantity) {
        v.stock -= item.quantity;
      }
    }
  });
  setLocalProducts([...products]);

  const client = getSupabaseClient();
  if (client) {
    try {
      // Upsert order
      await client.from('orders').upsert({
        id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone || null,
        shipping_address: order.shippingAddress || null,
        order_source: order.orderSource,
        status: order.status,
        payment_method: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        shipping_fee: order.shippingFee,
        total: order.total,
        cash_amount_paid: order.cashAmountPaid || null,
        cash_change: order.cashChange || null,
        qris_ref_no: order.qrisRefNo || null,
        tracking_number: order.trackingNumber || null,
        cashier_name: order.cashierName || null,
        created_at: order.createdAt
      });

      // Insert order items
      if (order.items && order.items.length > 0) {
        const itemPayloads = order.items.map((it) => ({
          id: it.id,
          order_id: order.id,
          product_id: it.productId,
          product_name: it.productName,
          selected_size: it.selectedSize,
          selected_color: it.selectedColor,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          subtotal: it.subtotal
        }));
        await client.from('order_items').upsert(itemPayloads);
      }
    } catch (err) {
      console.warn('Supabase save order failed:', err);
    }
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<void> {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    if (trackingNumber !== undefined) {
      orders[idx].trackingNumber = trackingNumber;
    }
    setLocalOrders([...orders]);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: any = { status };
      if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
      await client.from('orders').update(payload).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase update order status failed:', err);
    }
  }
}

export async function loadSettings(): Promise<StoreSettings> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('store_settings').select('*').limit(1).single();
      if (!error && data) {
        const settings: StoreSettings = {
          storeName: data.store_name,
          tagline: data.tagline,
          announcementText: data.announcement_text,
          storeAddress: data.store_address,
          storePhone: data.store_phone,
          instagramHandle: data.instagram_handle,
          websiteUrl: data.website_url,
          qrisMerchantName: data.qris_merchant_name,
          taxRatePercent: data.tax_rate_percent || 0,
          heroBannerUrl: data.hero_banner_url || undefined,
          promoBannerUrl: data.promo_banner_url || undefined,
          ctaText: data.cta_text || undefined,
          promoTagline: data.promo_tagline || undefined,
          couriers: typeof data.couriers === 'string' ? JSON.parse(data.couriers) : data.couriers,
          paymentGateways: typeof data.payment_gateways === 'string' ? JSON.parse(data.payment_gateways) : data.payment_gateways
        };
        setLocalSettings(settings);
        return settings;
      }
    } catch (err) {
      console.warn('Supabase load settings failed, using local fallback:', err);
    }
  }
  return getLocalSettings();
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  setLocalSettings(settings);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('store_settings').upsert({
        id: 1, // single row settings
        store_name: settings.storeName,
        tagline: settings.tagline,
        announcement_text: settings.announcementText,
        store_address: settings.storeAddress,
        store_phone: settings.storePhone,
        instagram_handle: settings.instagramHandle,
        website_url: settings.websiteUrl,
        qris_merchant_name: settings.qrisMerchantName,
        tax_rate_percent: settings.taxRatePercent,
        hero_banner_url: settings.heroBannerUrl || null,
        promo_banner_url: settings.promoBannerUrl || null,
        cta_text: settings.ctaText || null,
        promo_tagline: settings.promoTagline || null,
        couriers: JSON.stringify(settings.couriers),
        payment_gateways: JSON.stringify(settings.paymentGateways),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase save settings failed:', err);
    }
  }
}

export function generateSupabaseSqlSchema(): string {
  return `-- DDL SCHEMA FOR ILYASVIEL APPAREL SUPABASE DATABASE

-- 1. Table: products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  material_spec TEXT,
  description TEXT,
  image_url TEXT,
  color_images JSONB DEFAULT '{}'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  order_source TEXT NOT NULL DEFAULT 'POS_OFFLINE',
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  payment_method TEXT NOT NULL DEFAULT 'CASH',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  cash_amount_paid NUMERIC,
  cash_change NUMERIC,
  qris_ref_no TEXT,
  tracking_number TEXT,
  cashier_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  selected_size TEXT NOT NULL,
  selected_color TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- 4. Table: store_settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL,
  tagline TEXT,
  announcement_text TEXT,
  store_address TEXT,
  store_phone TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  qris_merchant_name TEXT,
  tax_rate_percent NUMERIC DEFAULT 0,
  hero_banner_url TEXT,
  promo_banner_url TEXT,
  cta_text TEXT,
  promo_tagline TEXT,
  couriers JSONB DEFAULT '[]'::jsonb,
  payment_gateways JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) or enable public access for POS operations
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings DISABLE ROW LEVEL SECURITY;
`;
}
