import React from 'react';
import { AppTab, CashierShift } from '../types';
import { 
  ShoppingBag, 
  PackageCheck, 
  Boxes, 
  Settings2, 
  TrendingUp, 
  Database,
  Search,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isSupabaseConnected: boolean;
  openSupabaseModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cartCount: number;
  openCartMobile?: () => void;
  pendingOrdersCount?: number;
  activeCashier?: CashierShift | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSupabaseConnected,
  openSupabaseModal,
  searchQuery,
  setSearchQuery,
  cartCount,
  openCartMobile,
  pendingOrdersCount = 0,
  activeCashier
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pos', label: 'MODUL KASIR POS', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'orders', label: 'WEB ORDERS', icon: <PackageCheck className="w-4 h-4" />, badge: pendingOrdersCount },
    { id: 'inventory', label: 'STOK & APPAREL', icon: <Boxes className="w-4 h-4" /> },
    { id: 'cms', label: 'CMS WEB STORE', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'reports', label: 'SHIFT CLOSING & P&L', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'settings', label: 'SETTINGS & DATABASE', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <header className="bg-[#0A39A6] text-white neo-border-b-4 border-black neo-shadow-lg z-40 sticky top-0 flex flex-col">
      {/* Top Banner Row */}
      <div className="p-3 sm:px-6 sm:py-3.5 flex flex-wrap justify-between items-center gap-3 border-b-2 border-black/40">
        {/* Brand Header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('pos')}>
          <div className="bg-[#FFC72C] text-black font-anton px-3 py-1 text-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] tracking-wider transform -rotate-1">
            IVS
          </div>
          <div>
            <h1 className="font-anton text-2xl sm:text-3xl text-[#FFC72C] tracking-wide uppercase leading-none drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              ILYASVIEL APPAREL
            </h1>
            <p className="font-space text-[10px] sm:text-[11px] text-blue-200 font-bold tracking-widest uppercase mt-0.5">
              INDONESIAN HEAVYWEIGHT STREETWEAR & POS SYSTEM
            </p>
          </div>
        </div>

        {/* Center Search Input (on POS & Inventory) */}
        {(activeTab === 'pos' || activeTab === 'inventory') && (
          <div className="flex-1 max-w-sm min-w-[220px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari baju, artikel, atau SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-white text-black font-space text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-[#FFC72C] placeholder:text-gray-500 font-bold"
            />
            <Search className="w-4 h-4 text-gray-700 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        )}

        {/* Right Status Controls */}
        <div className="flex items-center gap-2">
          {/* Active Shift Indicator (Requirement #3) */}
          <button
            onClick={() => setActiveTab('reports')}
            title="Kelola Shift Kasir"
            className={`px-3 py-1.5 font-space text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 uppercase transition-transform hover:scale-105 ${
              activeCashier ? 'bg-[#00C853] text-white' : 'bg-red-600 text-white animate-pulse'
            }`}
          >
            {activeCashier ? (
              <>
                <UserCheck className="w-4 h-4 text-[#FFC72C]" />
                <span className="hidden sm:inline">KASIR: {activeCashier.name.toUpperCase()}</span>
                <span className="sm:hidden">{activeCashier.name.toUpperCase()}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-[#FFC72C]" />
                <span>BELUM ADA SHIFT AKTIF</span>
              </>
            )}
          </button>

          <button
            onClick={openSupabaseModal}
            title="Konfigurasi Database Supabase"
            className={`px-3 py-1.5 font-space text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 uppercase transition-transform hover:scale-105 ${
              isSupabaseConnected ? 'bg-[#00C853] text-white' : 'bg-[#FFC72C] text-black'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'SUPABASE CONNECTED' : 'SETUP SUPABASE DB'}
            </span>
            <span className="sm:hidden">
              {isSupabaseConnected ? 'LIVE DB' : 'SETUP DB'}
            </span>
          </button>

          {activeTab === 'pos' && openCartMobile && (
            <button 
              onClick={openCartMobile}
              className="lg:hidden bg-[#FFC72C] text-black p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative font-bold"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full border border-black flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Top Navigation Tabs (Pop-Art Tabs Requirement #1) */}
      <div className="bg-[#082C80] px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 sm:px-4 py-2 font-space text-xs sm:text-sm font-black uppercase whitespace-nowrap transition-all flex items-center gap-2 rounded-none ${
                isActive
                  ? 'bg-[#FFC72C] text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-[1.02] z-10'
                  : 'bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-90 hover:opacity-100'
              }`}
            >
              <span className={isActive ? 'text-black' : 'text-[#0A39A6]'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black border border-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

