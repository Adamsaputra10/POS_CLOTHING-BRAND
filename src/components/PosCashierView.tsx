import React, { useState } from 'react';
import { Product, CartItem, ClothingCategory, Size, ColorVariant, CashierShift } from '../types';
import { VariantModal } from './VariantModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { Order } from '../types';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  Info,
  UserCheck,
  AlertCircle,
  Clock,
  MapPin,
  X
} from 'lucide-react';

interface PosCashierViewProps {
  products: Product[];
  searchQuery: string;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onSaveCompletedOrder: (order: Order) => Promise<void>;
  activeCashier?: CashierShift | null;
  onUpdateCashier?: (cashier: CashierShift | null) => void;
}

export const PosCashierView: React.FC<PosCashierViewProps> = ({
  products,
  searchQuery,
  cart,
  setCart,
  onSaveCompletedOrder,
  activeCashier,
  onUpdateCashier
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'ALL'>('ALL');
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [discountMessage, setDiscountMessage] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState<Order | null>(null);

  // Shift Login Modal inside POS
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>('');
  const [inputShift, setInputShift] = useState<string>('Shift Pagi (08:00 - 16:00 WIB)');
  const [inputStation, setInputStation] = useState<string>('Station 01 BSD HQ');

  const STATIONS = ['Station 01 BSD HQ', 'Station 02 Jakarta South', 'Station 03 Bandung Hub'];
  const SHIFTS = [
    'Shift Pagi (08:00 - 16:00 WIB)',
    'Shift Malam (16:00 - 23:00 WIB)',
    'Full Day Shift (08:00 - 22:00 WIB)'
  ];

  const handleSaveShiftLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CashierShift = {
      name: inputName.trim() || 'Kasir Store',
      shift: inputShift,
      station: inputStation
    };
    if (onUpdateCashier) {
      onUpdateCashier(updated);
    }
    setShowShiftModal(false);
    // Proceed to payment modal if cart is not empty
    if (cart.length > 0) {
      setShowPaymentModal(true);
    }
  };

  const CATEGORIES: (ClothingCategory | 'ALL')[] = [
    'ALL',
    'OVERSIZED TEES',
    'HOODIES & SWEATERS',
    'CARGO & PANTS',
    'VESTS & JACKETS',
    'ACCESSORIES'
  ];

  // Filter products by category & search query
  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.materialSpec.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleAddToCartFromModal = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.cartItemId === item.cartItemId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = discountCode.trim().toUpperCase();
    if (code === 'STREETWEAR10') {
      setAppliedDiscountPercent(10);
      setDiscountMessage('PROMO 10% OFF BERHASIL!');
    } else if (code === 'HEAVY20' || code === 'ILYASVIEL20') {
      setAppliedDiscountPercent(20);
      setDiscountMessage('PROMO SPECIAL 20% OFF BERHASIL!');
    } else {
      setAppliedDiscountPercent(0);
      setDiscountMessage('KODE PROMO TIDAK VALID');
    }
  };

  // Financials
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * appliedDiscountPercent) / 100);
  const total = Math.max(0, subtotal - discount);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handlePaymentSuccess = async (order: Order) => {
    setShowPaymentModal(false);
    await onSaveCompletedOrder(order);
    setCart([]);
    setDiscountCode('');
    setAppliedDiscountPercent(0);
    setDiscountMessage('');
    setCompletedOrderForReceipt(order);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F5F0E6] font-space">
      {/* Left Column: Product Catalog & Filters (65%) */}
      <div className="flex-1 flex flex-col overflow-hidden neo-border-r-3 border-black">
        {/* Category Pills Header Requirement #1 */}
        <div className="p-3 bg-[#F5F0E6] neo-border-b-3 border-black overflow-x-auto flex gap-2 items-center shrink-0">
          <span className="text-xs font-black uppercase text-gray-700 flex items-center gap-1 shrink-0 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0A39A6]" />
            KATEGORI:
          </span>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 font-space text-xs font-black neo-border uppercase whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#FFC72C] text-black neo-shadow-sm scale-102'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {cat === 'ALL' ? 'ALL CATALOG' : cat}
              </button>
            );
          })}
        </div>

        {/* Product Grid Catalog Requirement #2 */}
        <div className="flex-1 overflow-y-auto min-h-0 h-[calc(100vh-120px)] p-4 bg-[#F5F0E6]">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white p-8 neo-border neo-shadow">
              <div className="font-anton text-3xl text-gray-400 uppercase">
                TIDAK ADA BAJU DITEMUKAN
              </div>
              <p className="text-xs font-bold text-gray-600">
                Coba ganti kategori atau kata kunci pencarian apparel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                // Calculate total stock across all variants
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductForVariant(p)}
                    className="bg-white neo-border-3 border-black neo-shadow hover:neo-shadow-lg transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                  >
                    {/* Image Area */}
                    <div className="h-48 w-full bg-gray-100 border-b-3 border-black relative overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#FFC72C] text-black font-space text-[10px] font-black px-2 py-0.5 uppercase neo-border">
                        {p.category}
                      </span>
                      <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 uppercase neo-border ${
                        totalStock > 10 
                          ? 'bg-black text-white' 
                          : totalStock > 0 
                          ? 'bg-amber-400 text-black' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {totalStock > 0 ? `STOK: ${totalStock} PCS` : 'HABIS'}
                      </span>
                    </div>

                    {/* Content Area */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h3 className="font-anton text-lg tracking-wide uppercase text-black leading-tight group-hover:text-[#0A39A6] transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-[11px] font-bold text-gray-600 mt-1 line-clamp-2">
                          {p.materialSpec}
                        </p>
                      </div>

                      {/* Variant Badges Indicator */}
                      <div className="flex items-center justify-between pt-2 border-t-2 border-black border-dashed">
                        <div className="flex gap-1 text-[9px] font-black">
                          <span className="bg-[#F5F0E6] px-1.5 py-0.5 neo-border">S</span>
                          <span className="bg-[#F5F0E6] px-1.5 py-0.5 neo-border">M</span>
                          <span className="bg-[#F5F0E6] px-1.5 py-0.5 neo-border">L</span>
                          <span className="bg-[#F5F0E6] px-1.5 py-0.5 neo-border">XL</span>
                        </div>

                        <div className="font-anton text-lg text-[#0A39A6]">
                          {formatRupiah(p.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Billing Ticket / Cashier Cart (35%) Requirement #1 */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white neo-border-3 border-black flex flex-col h-full shrink-0 overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-[#0A39A6] text-white p-3.5 neo-border-b-3 border-black flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-anton text-xl text-[#FFC72C] tracking-wide uppercase leading-none">
              KERANJANG POS KASIR
            </h2>
            <p className="text-[11px] font-bold text-blue-200 mt-0.5">
              {activeCashier 
                ? `OFFLINE STORE | KASIR: ${activeCashier.name.toUpperCase()} (${activeCashier.station})`
                : 'OFFLINE STORE | BELUM LOG IN SHIFT'}
            </p>
          </div>
          <span className="bg-[#FFC72C] text-black font-space text-xs font-black px-2.5 py-1 neo-border">
            {cart.length} ITEM
          </span>
        </div>

        {/* Shift Warning Banner if not logged in (Requirement #3) */}
        {!activeCashier && (
          <div 
            onClick={() => {
              setInputName('');
              setShowShiftModal(true);
            }}
            className="bg-red-600 text-white p-2.5 neo-border-b-3 border-black text-xs font-black uppercase flex items-center justify-between cursor-pointer hover:bg-red-700 transition-colors animate-pulse shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#FFC72C] shrink-0" />
              <span>BELUM ADA SHIFT AKTIF! KLIK UNTUK LOGIN</span>
            </div>
            <UserCheck className="w-4 h-4 text-[#FFC72C] shrink-0" />
          </div>
        )}

        {/* Cart Line Items (Auto Scroll, Fill Remaining Space) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2.5 bg-[#F5F0E6]">
          {cart.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-white p-5 neo-border">
              <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="font-anton text-lg text-gray-500 uppercase">
                KERANJANG MASIH KOSONG
              </p>
              <p className="text-xs font-bold text-gray-600">
                Klik produk baju di sebelah kiri untuk memilih ukuran dan varian warna.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white neo-border-2 border-black p-2.5 neo-shadow-sm space-y-1.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-anton text-sm sm:text-base uppercase text-black leading-tight">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-[#0A39A6] text-white text-[10px] font-black px-1.5 py-0.2 neo-border">
                        SIZE {item.selectedSize}
                      </span>
                      <span className="bg-[#FFC72C] text-black text-[10px] font-black px-1.5 py-0.2 neo-border truncate max-w-[130px]">
                        {item.selectedColor}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.cartItemId)}
                    className="text-red-600 hover:text-red-800 p-1 neo-border bg-red-50 hover:bg-red-100 shrink-0"
                    title="Hapus item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-black border-dashed">
                  {/* Qty Controller */}
                  <div className="flex items-center neo-border bg-white text-xs">
                    <button
                      onClick={() => handleUpdateCartQty(item.cartItemId, -1)}
                      className="px-2 py-0.5 bg-gray-200 text-black font-bold hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-2.5 font-anton text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateCartQty(item.cartItemId, 1)}
                      className="px-2 py-0.5 bg-gray-200 text-black font-bold hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-bold block">
                      @ {formatRupiah(item.price)}
                    </span>
                    <span className="font-anton text-base text-[#0A39A6]">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Voucher / Promo Code Form (Pinned at Bottom) */}
        <div className="p-2.5 bg-white border-t-2 border-black space-y-1 shrink-0">
          <form onSubmit={handleApplyVoucher} className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Kode Voucher (e.g. STREETWEAR10)"
              className="flex-1 px-2.5 py-1.5 bg-[#F5F0E6] text-black font-space text-xs font-bold neo-border focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-black text-[#FFC72C] font-black text-xs uppercase neo-border hover:bg-gray-800"
            >
              APPLY
            </button>
          </form>
          {discountMessage && (
            <p className={`text-[10px] font-bold ${appliedDiscountPercent > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {discountMessage}
            </p>
          )}
        </div>

        {/* Totals & Checkout Action (Pinned Compact at Bottom) */}
        <div className="p-3 bg-[#F5F0E6] border-t-3 border-black space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>SUBTOTAL:</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-xs font-bold text-emerald-700">
              <span>PROMO DISCOUNT ({appliedDiscountPercent}%):</span>
              <span>-{formatRupiah(discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center font-anton text-2xl text-black pt-1.5 border-t-2 border-black border-dashed">
            <span>TOTAL:</span>
            <span className="bg-[#FFC72C] px-3 py-0.5 neo-border neo-shadow-sm text-[#0A39A6]">
              {formatRupiah(total)}
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              if (!activeCashier) {
                setInputName('');
                setShowShiftModal(true);
              } else {
                setShowPaymentModal(true);
              }
            }}
            className="w-full mt-1.5 py-3 bg-[#0A39A6] text-[#FFC72C] font-anton text-lg sm:text-xl tracking-wider uppercase neo-border neo-shadow hover:bg-blue-900 disabled:bg-gray-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>PROSES BAYAR SEKARANG</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Shift Login Prompt Modal (Requirement #3) */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-space">
            <div className="bg-[#0A39A6] text-white p-4 neo-border-b-3 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-[#FFC72C]" />
                <div>
                  <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border">
                    MANDATORY POS SHIFT
                  </span>
                  <h3 className="font-anton text-2xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-0.5">
                    START SHIFT KASIR
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="bg-red-500 text-white p-1.5 neo-border hover:bg-red-600 font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftLogin} className="p-5 space-y-4">
              <div className="bg-amber-100 border-2 border-black p-2.5 text-xs font-bold text-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Silakan input nama kasir dan lokasi station untuk memulai transaksi offline.</span>
              </div>

              <div>
                <label className="font-black text-xs uppercase text-black block mb-1">
                  1. NAMA KASIR AKTIF:
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Masukkan nama kasir (e.g. Budi P. / Sarah)"
                  className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border neo-shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
                />
              </div>

              <div>
                <label className="font-black text-xs uppercase text-black block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0A39A6]" />
                  2. SHIFT KERJA:
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
                  3. STATION / LOKASI:
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
                  onClick={() => setShowShiftModal(false)}
                  className="w-1/3 py-2.5 bg-white text-black font-anton text-base uppercase neo-border hover:bg-gray-100"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FFC72C] text-black font-anton text-base uppercase neo-border neo-shadow hover:bg-amber-400 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-5 h-5" />
                  SIMPAN / START SHIFT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Selector Modal */}
      {selectedProductForVariant && (
        <VariantModal
          product={selectedProductForVariant}
          onClose={() => setSelectedProductForVariant(null)}
          onAddToCart={handleAddToCartFromModal}
        />
      )}

      {/* Payment Checkout Modal */}
      {showPaymentModal && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          tax={0}
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          activeCashier={activeCashier}
        />
      )}

      {/* Printable Receipt Modal */}
      {completedOrderForReceipt && (
        <ReceiptModal
          order={completedOrderForReceipt}
          onClose={() => setCompletedOrderForReceipt(null)}
          onNewOrder={() => {
            setCompletedOrderForReceipt(null);
            setCart([]);
          }}
        />
      )}
    </div>
  );
};
