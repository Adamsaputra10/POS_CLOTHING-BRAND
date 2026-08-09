/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTab, Product, Order, StoreSettings, CartItem, OrderStatus, CashierShift } from './types';
import { 
  loadProducts, 
  saveProduct, 
  loadOrders, 
  saveOrder, 
  updateOrderStatus, 
  loadSettings, 
  saveSettings, 
  isSupabaseConnected 
} from './lib/supabase';
import { Header } from './components/Header';
import { PosCashierView } from './components/PosCashierView';
import { WebOrdersView } from './components/WebOrdersView';
import { InventoryView } from './components/InventoryView';
import { CmsEditorView } from './components/CmsEditorView';
import { ShiftReportView } from './components/ShiftReportView';
import { SettingsView } from './components/SettingsView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('pos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Cashier Shift State with localStorage persistence (Requirement #1 & #2)
  const [activeCashier, setActiveCashier] = useState<CashierShift | null>(() => {
    try {
      const saved = localStorage.getItem('ilyasviel_active_cashier');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse active cashier from localStorage:', e);
      return null;
    }
  });

  const handleUpdateCashier = (cashier: CashierShift | null) => {
    if (cashier) {
      const updated = {
        ...cashier,
        loginTime: cashier.loginTime || new Date().toISOString()
      };
      setActiveCashier(updated);
      localStorage.setItem('ilyasviel_active_cashier', JSON.stringify(updated));
    } else {
      setActiveCashier(null);
      localStorage.removeItem('ilyasviel_active_cashier');
    }
  };

  // Initial Data Fetching from Supabase or Local Storage
  const refreshData = async () => {
    setIsLoading(true);

    // Timeout safety net (3.5s) to prevent infinite loading screen on slow/failing Supabase network
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Data load timeout unblock')), 3500)
    );

    try {
      const [pData, oData, sData] = await Promise.race([
        Promise.all([loadProducts(), loadOrders(), loadSettings()]),
        timeoutPromise
      ]);
      setProducts(pData);
      setOrders(oData);
      setSettings(sData);
    } catch (err) {
      console.warn('Supabase fetch timed out or encountered error. Loading local storage fallback:', err);
      try {
        const pData = await loadProducts();
        const oData = await loadOrders();
        const sData = await loadSettings();
        setProducts(pData);
        setOrders(oData);
        setSettings(sData);
      } catch (fallbackErr) {
        console.error('Local fallback error:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveCompletedOrder = async (order: Order) => {
    await saveOrder(order);
    await refreshData();
  };

  const handleUpdateOrderStatus = async (
    orderId: string, 
    status: OrderStatus, 
    trackingNumber?: string
  ) => {
    await updateOrderStatus(orderId, status, trackingNumber);
    await refreshData();
  };

  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
    await refreshData();
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  const isConnected = isSupabaseConnected();
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col font-space text-black selection:bg-[#FFC72C]">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSupabaseConnected={isConnected}
        openSupabaseModal={() => setActiveTab('settings')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        pendingOrdersCount={pendingOrdersCount}
        activeCashier={activeCashier}
      />

      {/* Main Workspace Layout (Full Width 100%) */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Dynamic Tab Workspace */}
        <main className="flex-1 flex flex-col w-full overflow-hidden relative">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-[#0A39A6] border-t-[#FFC72C] rounded-full animate-spin neo-border" />
              <p className="font-anton text-2xl text-[#0A39A6] uppercase tracking-wide">
                MEMUAT SYSTEM POS ILYASVIEL APPAREL...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'pos' && (
                <PosCashierView
                  products={products}
                  searchQuery={searchQuery}
                  cart={cart}
                  setCart={setCart}
                  onSaveCompletedOrder={handleSaveCompletedOrder}
                  activeCashier={activeCashier}
                  onUpdateCashier={handleUpdateCashier}
                />
              )}

              {activeTab === 'orders' && (
                <WebOrdersView
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  products={products}
                  onSaveProduct={handleSaveProduct}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'cms' && settings && (
                <CmsEditorView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                />
              )}

              {activeTab === 'reports' && (
                <ShiftReportView
                  orders={orders}
                  activeCashier={activeCashier}
                  onUpdateCashier={handleUpdateCashier}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  onRefreshData={refreshData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Supabase Integration Configuration Modal */}
      {showSupabaseModal && (
        <SupabaseConfigModal
          onClose={() => setShowSupabaseModal(false)}
          onRefreshData={refreshData}
        />
      )}
    </div>
  );
}
