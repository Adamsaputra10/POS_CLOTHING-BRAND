import React, { useState } from 'react';
import { CartItem, Order, PaymentMethod } from '../types';
import { X, Banknote, QrCode, CheckCircle2, Calculator, AlertCircle, Printer, RotateCcw, Delete } from 'lucide-react';

interface PaymentModalProps {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  activeCashier?: { name: string; shift: string; station: string };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  cart,
  subtotal,
  discount,
  tax,
  total,
  onClose,
  onSuccess,
  activeCashier
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashInputStr, setCashInputStr] = useState<string>(String(total));
  const [customerName, setCustomerName] = useState<string>('Pelanggan Offline');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const cashInput = Number(cashInputStr) || 0;
  const cashChange = Math.max(0, cashInput - total);
  const isCashInsufficient = paymentMethod === 'CASH' && cashInput < total;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const quickNominals = [
    { label: 'UANG PAS', val: total },
    { label: '50 RIBU', val: 50000 },
    { label: '100 RIBU', val: 100000 },
    { label: '200 RIBU', val: 200000 },
    { label: '500 RIBU', val: 500000 }
  ];

  // Numpad button handlers
  const handleNumpadDigit = (digit: string) => {
    if (cashInputStr === '0' || cashInputStr === String(total)) {
      setCashInputStr(digit);
    } else {
      // Limit length to avoid overflow
      if (cashInputStr.length < 9) {
        setCashInputStr((prev) => prev + digit);
      }
    }
  };

  const handleNumpadDelete = () => {
    if (cashInputStr.length <= 1) {
      setCashInputStr('0');
    } else {
      setCashInputStr((prev) => prev.slice(0, -1));
    }
  };

  const handleNumpadClear = () => {
    setCashInputStr('0');
  };

  const handleProcessPayment = () => {
    if (isCashInsufficient) return;

    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `IVS-ORD-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNumber = `IVS-${Math.floor(8000 + Math.random() * 1999)}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber: orderNumber,
        customerName: customerName.trim() || 'Pelanggan Offline',
        orderSource: 'POS_OFFLINE',
        status: 'COMPLETED',
        paymentMethod,
        subtotal,
        discount,
        tax,
        shippingFee: 0,
        total,
        cashAmountPaid: paymentMethod === 'CASH' ? cashInput : total,
        cashChange: paymentMethod === 'CASH' ? cashChange : 0,
        qrisRefNo: paymentMethod === 'QRIS' ? `QRIS-XENDIT-${Date.now().toString().slice(-8)}` : undefined,
        cashierName: activeCashier ? `${activeCashier.name} (${activeCashier.station})` : 'Alex B. (Kasir Utama)',
        createdAt: new Date().toISOString(),
        items: cart.map((c, idx) => ({
          id: `item-${orderId}-${idx}`,
          orderId: orderId,
          productId: c.productId,
          productName: c.productName,
          selectedSize: c.selectedSize,
          selectedColor: c.selectedColor,
          quantity: c.quantity,
          unitPrice: c.price,
          subtotal: c.price * c.quantity
        }))
      };

      setIsProcessing(false);
      onSuccess(newOrder);
    }, 600);
  };

  const handleReprintReceipt = () => {
    alert('FUNGSI CETAK STRUK ULANG SIAP: Menyiapkan printer thermal POS...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto flex flex-col font-space my-auto">
        {/* Modal Header */}
        <div className="bg-[#0A39A6] text-white p-4 neo-border-b-3 border-black flex justify-between items-center sticky top-0 z-20">
          <div>
            <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border">
              OFFLINE POS CHECKOUT
            </span>
            <h3 className="font-anton text-2xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-0.5">
              PEMBAYARAN KASIR STORE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 text-white p-1.5 neo-border neo-shadow-sm hover:bg-red-600 font-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Customer Name & Shift Info Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-black text-xs uppercase text-black block mb-1">
                1. NAMA PELANGGAN / WALK-IN:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi / Walk in Store"
                className="w-full px-3 py-2 bg-white text-black font-space font-bold text-xs sm:text-sm neo-border neo-shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
              />
            </div>

            <div>
              <label className="font-black text-xs uppercase text-black block mb-1">
                2. METODE PEMBAYARAN:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 neo-border font-anton text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'CASH'
                      ? 'bg-[#FFC72C] text-black neo-shadow'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  TUNAI
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-2 px-3 neo-border font-anton text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'QRIS'
                      ? 'bg-[#FFC72C] text-black neo-shadow'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QRIS
                </button>
              </div>
            </div>
          </div>

          {/* Cash Payment Section with Numpad Calculator Requirement #3 */}
          {paymentMethod === 'CASH' ? (
            <div className="bg-white p-4 neo-border-3 border-black neo-shadow space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-anton text-lg uppercase text-[#0A39A6] flex items-center gap-1.5">
                  <Calculator className="w-5 h-5 text-[#FFC72C] bg-black p-0.5 neo-border" />
                  KALKULATOR TUNAI & PECAHAN RUPIAH
                </span>
                <span className="text-xs font-black bg-[#FFC72C] text-black px-2 py-0.5 neo-border uppercase">
                  PECAHAN CEPAT
                </span>
              </div>

              {/* Quick Nominal Buttons Requirement #3 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {quickNominals.map((qn) => (
                  <button
                    key={qn.label}
                    type="button"
                    onClick={() => setCashInputStr(String(qn.val))}
                    className="py-2 px-2 bg-[#F5F0E6] text-black neo-border-2 border-black text-xs font-black uppercase neo-shadow-sm hover:bg-[#FFC72C] active:translate-y-0.5 transition-all text-center"
                  >
                    <div className="font-anton text-sm">{qn.label}</div>
                    <div className="text-[10px] text-gray-700 font-bold">
                      {formatRupiah(qn.val)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Input Display & Full Numpad Grid Layout Requirement #3 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                {/* Left: Input display & Kembalian */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <label className="text-xs font-black uppercase text-black block mb-1">
                      UANG TUNAI DITERIMA (RP):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-anton text-2xl text-black">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={cashInputStr}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '');
                          setCashInputStr(cleaned || '0');
                        }}
                        className="w-full pl-12 pr-3 py-2.5 bg-[#F5F0E6] font-anton text-3xl text-black neo-border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
                      />
                    </div>
                  </div>

                  {/* Warning if insufficient */}
                  {isCashInsufficient && (
                    <div className="p-2.5 bg-red-100 text-red-700 neo-border-2 border-red-600 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Uang kurang {formatRupiah(total - cashInput)}!</span>
                    </div>
                  )}

                  {/* Kembalian Kasir Block Requirement #3 */}
                  <div className="p-3 bg-[#F5F0E6] neo-border-3 border-black space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-gray-700 uppercase">
                        KEMBALIAN KASIR:
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 uppercase neo-border ${
                        isCashInsufficient ? 'bg-red-500 text-white' : 'bg-[#00C853] text-white'
                      }`}>
                        {isCashInsufficient ? 'BELUM LUNAS' : 'SIAP STRUK'}
                      </span>
                    </div>
                    <div className="font-anton text-3xl text-[#0A39A6] leading-none">
                      {formatRupiah(cashChange)}
                    </div>
                  </div>
                </div>

                {/* Right: Full Numpad Calculator Grid (4x3 / 4x4) Requirement #3 */}
                <div className="md:col-span-6 bg-[#F5F0E6] p-3 neo-border-3 border-black space-y-2">
                  <div className="text-[10px] font-black uppercase text-black flex justify-between items-center border-b border-black/20 pb-1">
                    <span>NUMPAD KALKULATOR</span>
                    <span className="text-gray-500">TEKAN TOMBOL</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00', '000'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleNumpadDigit(digit)}
                        className="py-2.5 bg-white text-black font-anton text-xl neo-border-2 border-black neo-shadow-sm hover:bg-[#FFC72C] active:translate-y-0.5 transition-all"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleNumpadDelete}
                      className="py-2 bg-amber-200 text-black font-anton text-sm neo-border-2 border-black neo-shadow-sm hover:bg-amber-300 flex items-center justify-center gap-1"
                    >
                      <Delete className="w-4 h-4" />
                      DEL
                    </button>
                    <button
                      type="button"
                      onClick={handleNumpadClear}
                      className="py-2 bg-red-500 text-white font-anton text-sm neo-border-2 border-black neo-shadow-sm hover:bg-red-600"
                    >
                      CLEAR (C)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* QRIS Payment Section */
            <div className="bg-white p-5 neo-border-3 border-black neo-shadow text-center space-y-3">
              <span className="font-black text-xs uppercase text-[#0A39A6] block">
                QRIS DYNAMIC MERCHANT - ILYASVIEL APPAREL
              </span>

              <div className="w-44 h-44 mx-auto bg-white p-3 neo-border-3 border-black neo-shadow flex items-center justify-center relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ILYASVIEL_POS_TOTAL_${total}_TIME_${Date.now()}`}
                  alt="QRIS Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-xs font-bold text-gray-700 space-y-0.5">
                <p>Scan menggunakan GoPay, OVO, ShopeePay, BCA, DANA, atau MBanking</p>
                <p className="font-black text-[#0A39A6]">NMID: ID10203040506 - ILYASVIEL HQ</p>
              </div>
            </div>
          )}

          {/* Order Total Recap Bar */}
          <div className="bg-white p-3 neo-border-2 border-black text-xs font-space space-y-1">
            <div className="flex justify-between text-gray-600 font-bold">
              <span>SUBTOTAL ({cart.length} ARTIKEL BAJU):</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>DISCOUNT VOUCHER PROMO:</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-anton text-2xl text-black pt-2 border-t-2 border-black border-dashed">
              <span>TOTAL TAGIHAN:</span>
              <span className="bg-[#FFC72C] text-black px-3 py-1 neo-border">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer Requirement #3 */}
        <div className="p-4 bg-[#F5F0E6] neo-border-t-3 border-black space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="sm:w-1/4 py-3 bg-white text-black font-anton text-base uppercase neo-border hover:bg-gray-200"
            >
              BATAL
            </button>

            {/* Cetak Struk Ulang Button Requirement #3 */}
            <button
              type="button"
              onClick={handleReprintReceipt}
              className="sm:w-1/3 py-3 bg-[#FFC72C] text-black font-anton text-base uppercase neo-border neo-shadow hover:bg-amber-400 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-5 h-5 text-black" />
              CETAK STRUK ULANG
            </button>

            {/* Konfirmasi Lunas Button Requirement #3 */}
            <button
              type="button"
              disabled={isCashInsufficient || isProcessing}
              onClick={handleProcessPayment}
              className="sm:flex-1 py-3 bg-[#0A39A6] text-[#FFC72C] font-anton text-base uppercase neo-border neo-shadow hover:bg-blue-900 disabled:bg-gray-400 disabled:text-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-[#FFC72C]" />
              {isProcessing ? 'MEMPROSES...' : 'KONFIRMASI LUNAS & CETAK STRUK SEKARANG'}
            </button>
          </div>

          {/* Workflow Instruction Text Requirement #3 */}
          <div className="bg-black text-[#FFC72C] p-2 neo-border text-[11px] font-black uppercase text-center tracking-wide">
            ALUR CETAK STRUK: KLIK KONFIRMASI LUNAS -&gt; STRUK TERCETAK AUTOMATIS -&gt; KEMBALI KE KATALOG.
          </div>
        </div>
      </div>
    </div>
  );
};
