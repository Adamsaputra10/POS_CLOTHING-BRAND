import React, { useState, useEffect } from 'react';
import { Product, Size, ColorVariant, CartItem } from '../types';
import { X, Check, ShoppingBag, Info, AlertTriangle, ShieldCheck, ZoomIn, Maximize2 } from 'lucide-react';

interface VariantModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const VariantModal: React.FC<VariantModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const SIZES: Size[] = ['S', 'M', 'L', 'XL'];
  const COLORS: ColorVariant[] = ['Monochrome Black', 'Vintage White', 'Electric Blue'];

  const [selectedSize, setSelectedSize] = useState<Size>('L');
  const [selectedColor, setSelectedColor] = useState<ColorVariant>('Monochrome Black');
  const [quantity, setQuantity] = useState<number>(1);
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);

  // Find exact stock for current variant
  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const availableStock = currentVariant ? currentVariant.stock : 0;

  // Reset quantity if stock changes or size/color changes
  useEffect(() => {
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (availableStock === 0) {
      setQuantity(1);
    }
  }, [selectedSize, selectedColor, availableStock]);

  const handleAdd = () => {
    if (availableStock <= 0) return;

    const cartItem: CartItem = {
      cartItemId: `${product.id}-${selectedColor.replace(/\s+/g, '_')}-${selectedSize}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      selectedSize,
      selectedColor,
      quantity,
      materialSpec: product.materialSpec
    };

    onAddToCart(cartItem);
    onClose();
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const displayImage = product.colorImages?.[selectedColor] || product.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col font-space">
        {/* Modal Header */}
        <div className="bg-[#0A39A6] text-white p-4 sm:p-5 neo-border-b-3 border-black flex justify-between items-center sticky top-0 z-10">
          <div className="pr-2">
            <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border inline-block">
              {product.category}
            </span>
            <h3 className="font-anton text-xl sm:text-2xl text-[#FFC72C] tracking-wide uppercase leading-normal mt-1 break-words">
              PILIH UKURAN & VARIAN WARNA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 text-white p-2 neo-border neo-shadow-sm hover:bg-red-600 transition-colors font-black shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Apparel Preview Banner Requirement #5 */}
          <div className="flex gap-4 bg-white p-3 neo-border neo-shadow-sm items-center">
            <div 
              onClick={() => setShowZoomModal(true)}
              className="w-24 h-24 bg-gray-100 neo-border overflow-hidden shrink-0 relative cursor-pointer group hover:opacity-90 transition-all"
              title="Klik untuk zoom foto besar"
            >
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all group-hover:scale-105"
              />
              <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-black px-1 uppercase">
                STREETWEAR
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#FFC72C] gap-0.5 p-1 text-center">
                <ZoomIn className="w-5 h-5" />
                <span className="font-anton text-[9px] uppercase tracking-wider">KLIK ZOOM</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-anton text-lg tracking-wide uppercase text-black leading-tight line-clamp-1">
                  {product.name}
                </h4>
                <button
                  onClick={() => setShowZoomModal(true)}
                  className="text-xs bg-[#FFC72C] text-black font-black px-2 py-0.5 neo-border hover:bg-amber-400 shrink-0 flex items-center gap-1"
                >
                  <Maximize2 className="w-3 h-3" />
                  ZOOM FOTO
                </button>
              </div>
              <p className="text-xs font-bold text-gray-700 mt-0.5 line-clamp-2">
                {product.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-anton text-xl text-[#0A39A6]">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through font-bold">
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Material Spec Badge Requirement #2 */}
          <div className="bg-[#FFC72C]/30 p-3 neo-border border-black flex items-start gap-2 text-xs font-bold text-black">
            <Info className="w-4 h-4 text-[#0A39A6] shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase text-[#0A39A6] block mb-0.5">
                SPESIFIKASI BAHAN APPAREL:
              </span>
              <span>{product.materialSpec}</span>
            </div>
          </div>

          {/* Size Selector Requirement #2 (S, M, L, XL) */}
          <div className="space-y-2">
            <label className="font-black text-xs uppercase tracking-wider text-black flex justify-between items-center">
              <span>1. PILIH UKURAN BAJU:</span>
              <span className="text-[11px] text-blue-800 font-bold">BOXI FIT CUTTING</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SIZES.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-3 neo-border font-anton text-lg tracking-wider transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#0A39A6] text-[#FFC72C] neo-shadow translate-x-[1px] translate-y-[1px]'
                        : 'bg-white text-black hover:bg-[#FFC72C]'
                    }`}
                  >
                    <span>SIZE {sz}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Variant Selector Requirement #2 */}
          <div className="space-y-2">
            <label className="font-black text-xs uppercase tracking-wider text-black">
              2. PILIH VARIAN WARNA:
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => {
                const isSelected = selectedColor === col;
                let bgBadge = 'bg-black text-white';
                if (col === 'Vintage White') bgBadge = 'bg-slate-100 text-black border border-black';
                if (col === 'Electric Blue') bgBadge = 'bg-[#0A39A6] text-white';

                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`flex-1 min-w-[130px] p-2.5 sm:p-3 neo-border font-bold text-xs uppercase text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#FFC72C] text-black neo-shadow'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${bgBadge}`} />
                      <span className="break-words font-black">{col}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Stock Management per Variant Requirement #2 */}
          <div className="bg-white p-3 neo-border neo-shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-600 block">SISA STOK SPESIFIK VARIAN:</span>
              <span className="font-black text-sm text-black uppercase">
                {selectedColor} - SIZE {selectedSize}
              </span>
            </div>
            <div className={`px-3 py-1 font-anton text-lg neo-border ${
              availableStock > 5 
                ? 'bg-emerald-300 text-black' 
                : availableStock > 0 
                ? 'bg-[#FFC72C] text-black' 
                : 'bg-red-500 text-white'
            }`}>
              {availableStock > 0 ? `${availableStock} PCS` : 'STOK HABIS'}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="font-black text-xs uppercase tracking-wider text-black">
              3. JUMLAH ITEM (PCS):
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center neo-border bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1 || availableStock <= 0}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-gray-200 text-black font-black text-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  -
                </button>
                <span className="px-6 font-anton text-2xl text-black">
                  {availableStock > 0 ? quantity : 0}
                </span>
                <button
                  type="button"
                  disabled={quantity >= availableStock || availableStock <= 0}
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="px-4 py-2 bg-gray-200 text-black font-black text-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <div className="flex-1 text-right">
                <span className="text-xs font-bold text-gray-600 block">SUBTOTAL VARIAN:</span>
                <span className="font-anton text-2xl text-[#0A39A6]">
                  {formatRupiah(product.price * (availableStock > 0 ? quantity : 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 bg-[#F5F0E6] neo-border-t-3 border-black flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 bg-white text-black font-black text-sm uppercase neo-border hover:bg-gray-200 transition-colors"
          >
            BATAL
          </button>
          <button
            type="button"
            disabled={availableStock <= 0}
            onClick={handleAdd}
            className="w-2/3 py-3 bg-[#FFC72C] text-black font-black text-sm uppercase neo-border neo-shadow hover:bg-amber-400 disabled:bg-gray-300 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {availableStock > 0 ? 'MASUKKAN KE KERANJANG KASIR' : 'STOK VARIAN HABIS'}
          </button>
        </div>
      </div>

      {/* Large Image Zoom Modal Overlay Requirement #5 */}
      {showZoomModal && (
        <div 
          onClick={() => setShowZoomModal(false)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col font-space max-h-[95vh]"
          >
            {/* Header */}
            <div className="bg-[#0A39A6] text-white p-4 neo-border-b-3 border-black flex items-center justify-between">
              <div>
                <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border">
                  HIGH-RES MODEL PREVIEW
                </span>
                <h3 className="font-anton text-xl text-[#FFC72C] uppercase mt-0.5 leading-tight">
                  {product.name} ({selectedColor.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={() => setShowZoomModal(false)}
                className="bg-red-500 text-white p-2 neo-border hover:bg-red-600 font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Image Container */}
            <div className="p-4 bg-black/5 overflow-y-auto flex-1 flex flex-col items-center justify-center">
              <div className="relative w-full max-h-[60vh] flex items-center justify-center bg-gray-900 neo-border overflow-hidden group">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="max-h-[60vh] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 bg-black/80 text-[#FFC72C] text-[11px] font-black px-2.5 py-1 neo-border uppercase">
                  VARIAN: {selectedColor}
                </span>
              </div>

              {/* Material Spec & Fitting Details */}
              <div className="w-full mt-3 bg-white p-3 neo-border text-xs font-bold text-black space-y-1">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="font-black text-[#0A39A6] uppercase">SPESIFIKASI BAHAN:</span>
                  <span className="bg-[#FFC72C] text-black px-2 py-0.5 text-[10px] font-black neo-border">
                    BOXY FIT 230GSM
                  </span>
                </div>
                <p className="text-gray-700">{product.materialSpec}</p>
                <p className="text-[11px] text-gray-500 font-normal italic">
                  *Foto memperlihatkan detail jahitan double-needle, kualitas kain Heavyweight Cotton, serta kerapihan sablon.
                </p>
              </div>
            </div>

            {/* Footer Close Requirement #4 */}
            <div className="p-3 bg-white neo-border-t-3 border-black flex justify-end items-center">
              <button
                onClick={() => setShowZoomModal(false)}
                className="px-6 py-2 bg-[#FFC72C] text-black font-anton text-base uppercase neo-border neo-shadow hover:bg-amber-400"
              >
                TUTUP PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
