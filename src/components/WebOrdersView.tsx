import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  PackageCheck, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Send, 
  Eye, 
  User, 
  MapPin, 
  Phone,
  Filter
} from 'lucide-react';

interface WebOrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;
}

export const WebOrdersView: React.FC<WebOrdersViewProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  const STATUSES: (OrderStatus | 'ALL')[] = [
    'ALL',
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED',
    'CANCELLED'
  ];

  const filteredOrders = orders.filter((o) => {
    const matchStatus = selectedStatusFilter === 'ALL' || o.status === selectedStatusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleSaveTrackingNumber = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    await onUpdateOrderStatus(orderId, 'SHIPPED', trackingInput.trim());
    setEditingTrackingOrderId(null);
    setTrackingInput('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-400 text-black px-2 py-0.5 font-black text-[10px] neo-border">MENUNGGU BAYAR</span>;
      case 'PROCESSING':
        return <span className="bg-[#FFC72C] text-black px-2 py-0.5 font-black text-[10px] neo-border">DIPROSES CUST</span>;
      case 'SHIPPED':
        return <span className="bg-[#0A39A6] text-white px-2 py-0.5 font-black text-[10px] neo-border">DIKIRIM (RESI)</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-400 text-black px-2 py-0.5 font-black text-[10px] neo-border">SELESAI</span>;
      case 'CANCELLED':
        return <span className="bg-red-500 text-white px-2 py-0.5 font-black text-[10px] neo-border">BATAL</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F5F0E6] font-space space-y-6">
      {/* Header Title */}
      <div className="bg-[#0A39A6] text-white p-5 neo-border-4 border-black neo-shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#FFC72C] text-black text-xs font-black px-2.5 py-0.5 uppercase neo-border">
            WEB STOREFRONT MANAGEMENT
          </span>
          <h2 className="font-anton text-3xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-1">
            MANAJEMEN PESANAN MASUK (ONLINE & POS)
          </h2>
          <p className="text-xs font-bold text-blue-200 mt-0.5">
            Kelola konfirmasi pembayaran, update nomor resi kurir pengiriman, dan status order.
          </p>
        </div>
        <div className="bg-[#FFC72C] text-black p-3 neo-border font-anton text-2xl">
          {orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length} PESANAN PERLU DIPROSES
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 neo-border-3 border-black neo-shadow space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Status Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 items-center">
            <span className="text-xs font-black uppercase text-gray-700 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#0A39A6]" />
              STATUS:
            </span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1 font-space text-xs font-black neo-border uppercase whitespace-nowrap transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-[#FFC72C] text-black neo-shadow-sm'
                    : 'bg-[#F5F0E6] text-black hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'SEMUA PESANAN' : st}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No Order, Nama, No HP..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F0E6] text-black font-space text-xs font-bold neo-border focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Orders Table List */}
      <div className="bg-white neo-border-3 border-black neo-shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0A39A6] text-white font-anton tracking-wider text-sm border-b-3 border-black">
              <th className="p-3.5 neo-border-r border-black">NO ORDER / TANGGAL</th>
              <th className="p-3.5 neo-border-r border-black">PELANGGAN & ALAMAT</th>
              <th className="p-3.5 neo-border-r border-black">SUMBER / BAYAR</th>
              <th className="p-3.5 neo-border-r border-black">ITEM STREETWEAR</th>
              <th className="p-3.5 neo-border-r border-black">TOTAL</th>
              <th className="p-3.5 neo-border-r border-black">STATUS</th>
              <th className="p-3.5 text-center">AKSI MANAJEMEN</th>
            </tr>
          </thead>
          <tbody className="font-space text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                  TIDAK ADA PESANAN SESUAI FILTER
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="border-b-2 border-black hover:bg-[#F5F0E6]/60 transition-colors">
                  {/* Order Number & Date */}
                  <td className="p-3.5 neo-border-r border-black align-top min-w-[140px]">
                    <span className="font-mono font-bold text-sm text-[#0A39A6] block tracking-tight">{ord.orderNumber}</span>
                    <span className="text-[11px] text-gray-600 font-bold block mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {ord.trackingNumber && (
                      <span className="mt-1.5 bg-[#FFC72C] text-black px-1.5 py-0.5 text-[10px] font-black neo-border inline-block break-all">
                        RESI: {ord.trackingNumber}
                      </span>
                    )}
                  </td>

                  {/* Customer Info */}
                  <td className="p-3.5 neo-border-r border-black align-top max-w-[220px] sm:max-w-xs break-words">
                    <span className="font-black text-black text-xs block">{ord.customerName}</span>
                    {ord.customerPhone && (
                      <span className="text-gray-700 font-bold text-[11px] block flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#0A39A6] shrink-0" />
                        {ord.customerPhone}
                      </span>
                    )}
                    {ord.shippingAddress && (
                      <span className="text-gray-600 text-[11px] block mt-1 break-words whitespace-normal leading-normal">
                        <MapPin className="w-3 h-3 text-red-600 inline mr-0.5 shrink-0" />
                        {ord.shippingAddress}
                      </span>
                    )}
                  </td>

                  {/* Source & Payment Method */}
                  <td className="p-3.5 neo-border-r border-black align-top">
                    <span className={`px-2 py-0.5 text-[10px] font-black neo-border block w-fit mb-1 ${
                      ord.orderSource === 'WEB_STOREFRONT' 
                        ? 'bg-purple-200 text-purple-900' 
                        : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {ord.orderSource === 'WEB_STOREFRONT' ? 'WEB STORE' : 'POS OFFLINE'}
                    </span>
                    <span className="font-bold text-gray-800 uppercase block">{ord.paymentMethod}</span>
                  </td>

                  {/* Items Ordered */}
                  <td className="p-3.5 neo-border-r border-black align-top">
                    <div className="space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="bg-[#F5F0E6] p-1.5 neo-border text-[11px]">
                          <span className="font-black text-black block truncate max-w-[180px]">
                            {it.productName}
                          </span>
                          <span className="text-gray-700 font-bold">
                            SIZE {it.selectedSize} | {it.selectedColor} ({it.quantity}x)
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="p-3.5 font-anton text-base text-[#0A39A6] neo-border-r border-black align-top">
                    {formatRupiah(ord.total)}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5 neo-border-r border-black align-top">
                    {getStatusBadge(ord.status)}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3.5 align-top space-y-1.5 min-w-[160px]">
                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'PROCESSING')}
                        className="w-full py-1.5 bg-[#FFC72C] text-black font-black text-[11px] uppercase neo-border hover:bg-amber-400"
                      >
                        KONFIRMASI BAYAR
                      </button>
                    )}

                    {ord.status === 'PROCESSING' && (
                      <>
                        {editingTrackingOrderId === ord.id ? (
                          <div className="space-y-1 bg-[#F5F0E6] p-2 neo-border">
                            <input
                              type="text"
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              placeholder="Input No Resi JNE/J&T..."
                              className="w-full px-2 py-1 bg-white text-black text-xs font-bold neo-border"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveTrackingNumber(ord.id)}
                                className="flex-1 py-1 bg-[#0A39A6] text-white font-black text-[10px] uppercase neo-border"
                              >
                                KIRIM RESI
                              </button>
                              <button
                                onClick={() => setEditingTrackingOrderId(null)}
                                className="px-2 py-1 bg-gray-300 text-black font-black text-[10px] neo-border"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTrackingOrderId(ord.id);
                              setTrackingInput(ord.trackingNumber || '');
                            }}
                            className="w-full py-1.5 bg-[#0A39A6] text-white font-black text-[11px] uppercase neo-border hover:bg-blue-900 flex items-center justify-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#FFC72C]" />
                            INPUT RESI KIRIM
                          </button>
                        )}
                      </>
                    )}

                    {ord.status === 'SHIPPED' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'COMPLETED')}
                        className="w-full py-1.5 bg-emerald-400 text-black font-black text-[11px] uppercase neo-border hover:bg-emerald-500"
                      >
                        SET SELESAI
                      </button>
                    )}

                    {ord.status !== 'CANCELLED' && ord.status !== 'COMPLETED' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'CANCELLED')}
                        className="w-full py-1 bg-red-100 text-red-700 font-bold text-[10px] uppercase neo-border border-red-500 hover:bg-red-200"
                      >
                        BATALKAN
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
