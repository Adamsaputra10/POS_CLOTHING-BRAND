import React from 'react';
import { AppTab } from '../types';
import { 
  ShoppingBag, 
  PackageCheck, 
  Boxes, 
  Settings2, 
  TrendingUp, 
  Database,
  Store,
  UserCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  openSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  totalPendingOrders: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openSupabaseModal,
  isSupabaseConnected,
  totalPendingOrders
}) => {
  return (
    <aside className="w-full lg:w-64 bg-[#F5F0E6] neo-border-3 border-black neo-shadow-lg p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        {/* Station Info Box */}
        <div className="bg-[#FFC72C] p-3 neo-border neo-shadow-sm font-space">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
              FLAGSHIP HQ
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-black">
              <UserCheck className="w-3.5 h-3.5" />
              Kasir: Alex B.
            </span>
          </div>
          <h2 className="font-anton text-lg tracking-wide uppercase text-black leading-tight">
            STATION 01 - BSD HQ
          </h2>
          <p className="text-[11px] font-bold text-gray-800">
            Offline POS & Web Order Sync
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2">
          <p className="font-space text-[10px] font-black tracking-widest uppercase text-gray-500 px-1">
            MODUL KASIR & STOREFRONT
          </p>

          <button
            onClick={() => setActiveTab('pos')}
            className={`w-full text-left p-3 font-space text-sm font-black neo-border uppercase transition-all flex items-center justify-between ${
              activeTab === 'pos'
                ? 'bg-[#0A39A6] text-white neo-shadow-sm translate-x-1'
                : 'bg-white text-black hover:bg-[#FFC72C]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Kasir POS (Offline)</span>
            </div>
            <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left p-3 font-space text-sm font-black neo-border uppercase transition-all flex items-center justify-between ${
              activeTab === 'orders'
                ? 'bg-[#0A39A6] text-white neo-shadow-sm translate-x-1'
                : 'bg-white text-black hover:bg-[#FFC72C]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PackageCheck className="w-4 h-4" />
              <span>Web Orders</span>
            </div>
            {totalPendingOrders > 0 ? (
              <span className="bg-red-500 text-white text-[11px] px-2 py-0.5 font-black animate-pulse neo-border">
                {totalPendingOrders} NEW
              </span>
            ) : (
              <span className="text-[10px] bg-gray-200 text-black px-1.5 py-0.5 font-bold">
                SYNC
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left p-3 font-space text-sm font-black neo-border uppercase transition-all flex items-center justify-between ${
              activeTab === 'inventory'
                ? 'bg-[#0A39A6] text-white neo-shadow-sm translate-x-1'
                : 'bg-white text-black hover:bg-[#FFC72C]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4" />
              <span>Stok & Apparel</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`w-full text-left p-3 font-space text-sm font-black neo-border uppercase transition-all flex items-center justify-between ${
              activeTab === 'cms'
                ? 'bg-[#0A39A6] text-white neo-shadow-sm translate-x-1'
                : 'bg-white text-black hover:bg-[#FFC72C]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings2 className="w-4 h-4" />
              <span>CMS Web Store</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left p-3 font-space text-sm font-black neo-border uppercase transition-all flex items-center justify-between ${
              activeTab === 'reports'
                ? 'bg-[#0A39A6] text-white neo-shadow-sm translate-x-1'
                : 'bg-white text-black hover:bg-[#FFC72C]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>Shift & Laporan P&L</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Settings & Database Link */}
      <div className="mt-6 pt-4 border-t-2 border-black space-y-3 font-space">
        <div className="bg-white p-3 neo-border neo-shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-black text-xs uppercase flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#0A39A6]" />
              Database Supabase
            </span>
            <span className={`w-2.5 h-2.5 rounded-full neo-border ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </div>
          <p className="text-[11px] text-gray-700 font-bold mb-2">
            {isSupabaseConnected ? 'Tersambung ke Supabase Cloud' : 'Mode Offline Mock Storage'}
          </p>
          <button
            onClick={openSupabaseModal}
            className="w-full py-1.5 bg-[#FFC72C] text-black font-black text-xs uppercase neo-border hover:bg-amber-300 transition-colors"
          >
            Kelola Koneksi DB
          </button>
        </div>

        <div className="text-center text-[10px] font-bold text-gray-600 uppercase">
          ILYASVIEL APPAREL © 2026<br />
          HEAVYWEIGHT STREETWEAR CUTS
        </div>
      </div>
    </aside>
  );
};
