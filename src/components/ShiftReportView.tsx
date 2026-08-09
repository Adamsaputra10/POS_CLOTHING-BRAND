import React, { useState } from 'react';
import { Order } from '../types';
import { 
  TrendingUp, 
  Banknote, 
  QrCode, 
  Calculator, 
  Printer, 
  ShieldCheck, 
  DollarSign, 
  Store, 
  Globe,
  UserCheck,
  X,
  Check,
  Clock,
  MapPin
} from 'lucide-react';

interface ShiftReportViewProps {
  orders: Order[];
  activeCashier?: { name: string; shift: string; station: string };
  onUpdateCashier?: (cashier: { name: string; shift: string; station: string }) => void;
}

export const ShiftReportView: React.FC<ShiftReportViewProps> = ({ 
  orders,
  activeCashier = { name: 'Alex B.', shift: 'Shift Pagi (08:00 - 16:00 WIB)', station: 'Station 01 BSD HQ' },
  onUpdateCashier
}) => {
  const [openingCash, setOpeningCash] = useState<number>(500000);
  const [actualCashInDrawer, setActualCashInDrawer] = useState<number>(1429000);

  // Cashier Shift Login Modal State Requirement #2
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(activeCashier.name);
  const [inputShift, setInputShift] = useState<string>(activeCashier.shift);
  const [inputStation, setInputStation] = useState<string>(activeCashier.station);
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);

  const STATIONS = ['Station 01 BSD HQ', 'Station 02 Jakarta South', 'Station 03 Bandung Hub'];
  const SHIFTS = [
    'Shift Pagi (08:00 - 16:00 WIB)',
    'Shift Malam (16:00 - 23:00 WIB)',
    'Full Day Shift (08:00 - 22:00 WIB)'
  ];

  const handleSaveShiftLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      name: inputName.trim() || 'Kasir Store',
      shift: inputShift,
      station: inputStation
    };
    if (onUpdateCashier) {
      onUpdateCashier(updated);
    }
    setShowLoginModal(false);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3500);
  };

  // Filter completed or valid orders
  const validOrders = orders.filter((o) => o.status !== 'CANCELLED');

  const posOrders = validOrders.filter((o) => o.orderSource === 'POS_OFFLINE');
  const webOrders = validOrders.filter((o) => o.orderSource === 'WEB_STOREFRONT');

  const posSalesTotal = posOrders.reduce((sum, o) => sum + o.total, 0);
  const webSalesTotal = webOrders.reduce((sum, o) => sum + o.total, 0);
  const grandTotalSales = posSalesTotal + webSalesTotal;

  // Cash vs QRIS/Card
  const totalCashSales = validOrders
    .filter((o) => o.paymentMethod === 'CASH')
    .reduce((sum, o) => sum + o.total, 0);

  const totalNonCashSales = validOrders
    .filter((o) => o.paymentMethod !== 'CASH')
    .reduce((sum, o) => sum + o.total, 0);

  const expectedCashInDrawer = openingCash + totalCashSales;
  const variance = actualCashInDrawer - expectedCashInDrawer;

  // P&L estimation
  const estimatedCogs = Math.round(grandTotalSales * 0.45); // ~45% HPP Bahan Heavyweight
  const operationalExpense = 150000;
  const netProfit = grandTotalSales - estimatedCogs - operationalExpense;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handlePrintShiftReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F5F0E6] font-space space-y-6">
      {/* Header */}
      <div className="bg-[#0A39A6] text-white p-5 neo-border-4 border-black neo-shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#FFC72C] text-black text-xs font-black px-2.5 py-0.5 uppercase neo-border">
            SHIFT CLOSING & P&L REPORT
          </span>
          <h2 className="font-anton text-3xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-1">
            RINGKASAN SHIFT KASIR & LAPORAN PENJUALAN
          </h2>
          <p className="text-xs font-bold text-blue-200 mt-0.5">
            Rekonsiliasi uang laci kasir, performa POS In-Store vs Web Storefront, dan laba bersih.
          </p>
        </div>
        <button
          onClick={handlePrintShiftReport}
          className="bg-[#FFC72C] text-black font-anton text-lg tracking-wider px-4 py-2.5 neo-border neo-shadow hover:bg-amber-400 flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          CETAK LAPORAN SHIFT
        </button>
      </div>

      {/* Success Pop-Art Notification Alert */}
      {showSuccessNotification && (
        <div className="bg-[#FFC72C] p-4 neo-border-4 border-black neo-shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Check className="w-6 h-6 text-black bg-white rounded-full p-1 neo-border shrink-0" />
            <div>
              <span className="font-anton text-lg uppercase text-black block leading-none">
                LOGIN SHIFT KASIR BERHASIL TERHUBUNG!
              </span>
              <span className="text-xs font-bold text-black block mt-1">
                Kasir {activeCashier.name} aktif di {activeCashier.station} ({activeCashier.shift}). Teraplikasi ke struk offline.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessNotification(false)}
            className="text-black font-black p-1 hover:bg-black/10 neo-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cashier Shift Info Banner Requirement #2 */}
      <div className="bg-[#FFC72C] p-4 neo-border-3 border-black neo-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-black text-[#FFC72C] text-[10px] font-black px-2 py-0.5 uppercase neo-border">
              ACTIVE SESSION
            </span>
            <span className="text-xs font-black text-black uppercase">
              {activeCashier.station}
            </span>
          </div>
          <h3 className="font-anton text-2xl uppercase text-black leading-tight">
            KASIR AKTIF: {activeCashier.name.toUpperCase()}
          </h3>
          <p className="text-xs font-bold text-black uppercase mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>SHIFT: {activeCashier.shift}</span>
            <span>|</span>
            <span>TANGGAL: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => {
              setInputName(activeCashier.name);
              setInputShift(activeCashier.shift);
              setInputStation(activeCashier.station);
              setShowLoginModal(true);
            }}
            className="bg-[#0A39A6] text-white font-anton text-base tracking-wider px-4 py-2 neo-border neo-shadow hover:bg-blue-900 transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-[#FFC72C]" />
            LOGIN / UBAH SHIFT KASIR
          </button>

          <div className="bg-black text-[#FFC72C] px-3 py-2 neo-border font-anton text-lg shrink-0">
            {validOrders.length} ORDERS
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 neo-border-3 border-black neo-shadow">
          <span className="text-xs font-black text-gray-600 block uppercase">
            1. MODAL AWAL LACI (OPENING CASH):
          </span>
          <span className="font-anton text-3xl text-black block mt-1">
            {formatRupiah(openingCash)}
          </span>
        </div>

        <div className="bg-white p-4 neo-border-3 border-black neo-shadow">
          <span className="text-xs font-black text-gray-600 block uppercase">
            2. TOTAL PENJUALAN TUNAI (CASH):
          </span>
          <span className="font-anton text-3xl text-emerald-700 block mt-1">
            {formatRupiah(totalCashSales)}
          </span>
        </div>

        <div className="bg-white p-4 neo-border-3 border-black neo-shadow">
          <span className="text-xs font-black text-gray-600 block uppercase">
            3. TOTAL NON-TUNAI (QRIS / BANK):
          </span>
          <span className="font-anton text-3xl text-[#0A39A6] block mt-1">
            {formatRupiah(totalNonCashSales)}
          </span>
        </div>
      </div>

      {/* Cash Drawer Reconciliation Calculator */}
      <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-black pb-2">
          <Calculator className="w-5 h-5 text-[#0A39A6]" />
          <h3 className="font-anton text-xl uppercase text-black">
            DRAWER RECONCILIATION (REKONSILIASI UANG LACI)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-black uppercase text-black block mb-1">
              FISIK UANG TUNAI DI LACI (RP):
            </label>
            <input
              type="number"
              value={actualCashInDrawer}
              onChange={(e) => setActualCashInDrawer(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F5F0E6] font-anton text-2xl text-black neo-border"
            />
          </div>

          <div className="bg-[#F5F0E6] p-3 neo-border">
            <span className="text-xs font-bold text-gray-600 block">EKSPEKTASI UANG LACI:</span>
            <span className="font-anton text-2xl text-black">
              {formatRupiah(expectedCashInDrawer)}
            </span>
          </div>

          <div className={`p-3 neo-border ${variance === 0 ? 'bg-emerald-300' : variance > 0 ? 'bg-[#FFC72C]' : 'bg-red-400 text-white'}`}>
            <span className="text-xs font-black block">VARIANCE / SELISIH:</span>
            <span className="font-anton text-2xl">
              {formatRupiah(variance)}
            </span>
          </div>
        </div>
      </div>

      {/* Sales Channel Breakdown: POS vs Web */}
      <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-4">
        <h3 className="font-anton text-xl uppercase text-black border-b-2 border-black pb-2">
          REVENUE BREAKDOWN BY CHANNEL (POS OFFLINE VS WEB STORE)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#F5F0E6] p-4 neo-border space-y-2">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#0A39A6]" />
              <span className="font-anton text-lg uppercase text-black">POS STORE OFFLINE</span>
            </div>
            <span className="font-anton text-3xl text-[#0A39A6] block">
              {formatRupiah(posSalesTotal)}
            </span>
            <p className="text-xs font-bold text-gray-600">
              Total Order Offline: {posOrders.length} Transaksi
            </p>
          </div>

          <div className="bg-[#F5F0E6] p-4 neo-border space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-800" />
              <span className="font-anton text-lg uppercase text-black">WEB STOREFRONT ONLINE</span>
            </div>
            <span className="font-anton text-3xl text-purple-900 block">
              {formatRupiah(webSalesTotal)}
            </span>
            <p className="text-xs font-bold text-gray-600">
              Total Order Online: {webOrders.length} Transaksi
            </p>
          </div>
        </div>
      </div>

      {/* Profit & Loss Report */}
      <div className="bg-[#0A39A6] text-white p-5 neo-border-4 border-black neo-shadow-lg space-y-4">
        <h3 className="font-anton text-2xl text-[#FFC72C] uppercase border-b-2 border-white/30 pb-2">
          LAPORAN LABA RUGI HARI INI (P&L REPORT)
        </h3>

        <div className="space-y-2 text-sm font-bold">
          <div className="flex justify-between py-1 border-b border-white/20">
            <span>GROSS REVENUE (TOTAL OMSET HARI INI):</span>
            <span className="font-anton text-xl text-[#FFC72C]">{formatRupiah(grandTotalSales)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/20 text-red-300">
            <span>HPP / COST OF GOODS SOLD (~45% HEAVYWEIGHT APPAREL):</span>
            <span className="font-anton text-xl">-{formatRupiah(estimatedCogs)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/20 text-amber-200">
            <span>OPERATIONAL EXPENSE (LISTRIK & CONSUMABLES):</span>
            <span className="font-anton text-xl">-{formatRupiah(operationalExpense)}</span>
          </div>

          <div className="flex justify-between items-center pt-3 font-anton text-3xl text-[#FFC72C]">
            <span>NET PROFIT BERSIH HARI INI:</span>
            <span className="bg-[#FFC72C] text-black px-3 py-1 neo-border">
              {formatRupiah(netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Login Shift Kasir Requirement #2 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-xl w-full max-w-lg overflow-hidden flex flex-col font-space">
            {/* Modal Header */}
            <div className="bg-[#0A39A6] text-white p-4 neo-border-b-3 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-[#FFC72C]" />
                <div>
                  <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border">
                    OFFLINE POS SESSION
                  </span>
                  <h3 className="font-anton text-2xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-0.5">
                    LOGIN / UBAH SHIFT KASIR
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="bg-red-500 text-white p-1.5 neo-border hover:bg-red-600 font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveShiftLogin} className="p-5 space-y-4">
              <div>
                <label className="font-black text-xs uppercase text-black block mb-1">
                  1. NAMA KASIR AKTIF:
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Contoh: Alex B. / Sarah M."
                  className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border neo-shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
                />
              </div>

              <div>
                <label className="font-black text-xs uppercase text-black block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0A39A6]" />
                  2. PILIHAN SHIFT KERJA KASIR:
                </label>
                <select
                  value={inputShift}
                  onChange={(e) => setInputShift(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-black font-bold text-xs neo-border focus:outline-none"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-black text-xs uppercase text-black block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  3. PILIHAN STATION / LOKASI KASIR:
                </label>
                <select
                  value={inputStation}
                  onChange={(e) => setInputStation(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-black font-bold text-xs neo-border focus:outline-none"
                >
                  {STATIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t-2 border-black border-dashed flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2.5 bg-white text-black font-anton text-base uppercase neo-border hover:bg-gray-100"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FFC72C] text-black font-anton text-base uppercase neo-border neo-shadow hover:bg-amber-400 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-5 h-5" />
                  SIMPAN SHIFT KASIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
