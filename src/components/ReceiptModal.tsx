import React from 'react';
import { Order } from '../types';
import { Printer, CheckCircle, X, Download, RotateCcw } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  onNewOrder
}) => {
  if (!order) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto flex flex-col font-space">
        {/* Actions bar above receipt */}
        <div className="bg-[#0A39A6] text-white p-3 neo-border-3 border-black neo-shadow flex justify-between items-center mb-2">
          <span className="font-anton text-lg text-[#FFC72C] tracking-wide uppercase">
            STRUK THERMAL OFFICIALLY ISSUED
          </span>
          <button
            onClick={onClose}
            className="bg-red-500 text-white p-1 neo-border hover:bg-red-600 font-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Canvas with Jagged Edge */}
        <div id="thermal-receipt" className="receipt-paper receipt-jagged neo-border-4 border-black p-6 text-black space-y-4">
          {/* Receipt Brand Header */}
          <div className="text-center border-b-2 border-black border-dashed pb-4 space-y-1">
            <div className="inline-block bg-[#FFC72C] text-black font-anton px-3 py-0.5 text-2xl neo-border tracking-wider transform -rotate-1 mb-1">
              ILYASVIEL APPAREL
            </div>
            <p className="font-anton text-xs tracking-widest text-gray-800 uppercase">
              INDONESIAN HEAVYWEIGHT STREETWEAR & BOXY CUTS
            </p>
            <p className="text-[11px] font-bold text-gray-600">
              BSD Raya Utama No. 88, Tangsel - Banten
            </p>
            <p className="text-[11px] font-bold text-gray-600">
              Tel: +62 812-8800-9900 | IG: @ilyasviel.apparel
            </p>
          </div>

          {/* Transaction Meta Info */}
          <div className="text-xs font-bold text-gray-800 space-y-1 border-b-2 border-black border-dashed pb-3">
            <div className="flex justify-between">
              <span>NO. STRUK:</span>
              <span className="font-black text-black">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>TANGGAL / WAKTU:</span>
              <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>KASIR STORE:</span>
              <span>{order.cashierName || 'Alex B. (Kasir)'}</span>
            </div>
            <div className="flex justify-between">
              <span>PELANGGAN:</span>
              <span className="uppercase">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>SUMBER PESANAN:</span>
              <span className="bg-black text-white px-1 py-0.2 text-[9px] font-black">
                {order.orderSource === 'POS_OFFLINE' ? 'STORE POS OFFLINE' : 'WEB STOREFRONT'}
              </span>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="space-y-3 border-b-2 border-black border-dashed pb-4">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 block">
              DAFTAR ITEM STREETWEAR:
            </span>
            {order.items.map((item, idx) => (
              <div key={idx} className="text-xs font-bold space-y-0.5">
                <div className="flex justify-between font-black text-black">
                  <span className="uppercase">{item.productName}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>
                    VARIAN: {item.selectedColor} | SIZE {item.selectedSize}
                  </span>
                  <span>
                    {item.quantity} x {formatRupiah(item.unitPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Payments */}
          <div className="space-y-1.5 text-xs font-bold text-black border-b-2 border-black border-dashed pb-4">
            <div className="flex justify-between">
              <span>SUBTOTAL ARTIKEL:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>DISCOUNT VOUCHER:</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-anton text-2xl text-black pt-2 border-t-2 border-black">
              <span>TOTAL BAYAR:</span>
              <span className="bg-[#FFC72C] px-2 py-0.5 neo-border">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>

          {/* Cash / QRIS Breakdown */}
          <div className="text-xs font-bold text-gray-800 space-y-1 bg-gray-100 p-2.5 neo-border">
            <div className="flex justify-between">
              <span>METODE PEMBAYARAN:</span>
              <span className="font-black text-black">{order.paymentMethod}</span>
            </div>

            {order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between">
                  <span>TUNAI DITERIMA:</span>
                  <span>{formatRupiah(order.cashAmountPaid || order.total)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-black">
                  <span>KEMBALIAN:</span>
                  <span>{formatRupiah(order.cashChange || 0)}</span>
                </div>
              </>
            )}

            {order.paymentMethod === 'QRIS' && (
              <div className="flex justify-between text-[#0A39A6] font-black">
                <span>REF QRIS:</span>
                <span>{order.qrisRefNo || 'QRIS-LUNAS'}</span>
              </div>
            )}
          </div>

          {/* Footer Receipt Note */}
          <div className="text-center text-[10px] font-bold text-gray-600 uppercase space-y-1 pt-2">
            <p>TERIMA KASIH TELAH BERBELANJA DI ILYASVIEL APPAREL!</p>
            <p>BARANG YANG SUDAH DIBELI DAPAT DITUKAR SIZE DALAM 3 HARI DENGAN STRUK INI.</p>
            <p className="font-black text-black">WWW.ILYASVIEL-APPAREL.COM</p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#FFC72C] text-black font-black text-xs uppercase neo-border neo-shadow hover:bg-amber-400 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            CETAK STRUK (PRINT)
          </button>
          <button
            onClick={() => {
              onClose();
              onNewOrder();
            }}
            className="flex-1 py-3 bg-[#0A39A6] text-white font-black text-xs uppercase neo-border neo-shadow hover:bg-blue-900 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            TRANSAKSI BARU
          </button>
        </div>
      </div>
    </div>
  );
};
