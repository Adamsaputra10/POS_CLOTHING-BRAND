import React, { useState } from 'react';
import { Product, ClothingCategory, Size, ColorVariant, VariantStock } from '../types';
import { 
  Boxes, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Check,
  Search, 
  AlertTriangle, 
  CheckCircle,
  Tag,
  Shirt,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void>;
  searchQuery: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onSaveProduct,
  searchQuery
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form State for Add / Edit
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ClothingCategory>('OVERSIZED TEES');
  const [priceStr, setPriceStr] = useState<string>('249000');
  const [originalPriceStr, setOriginalPriceStr] = useState<string>('299000');
  const [materialSpec, setMaterialSpec] = useState<string>('Heavyweight Cotton Combed 24s - Boxy Fit 230GSM');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600');
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<VariantStock[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  const SIZES: Size[] = ['S', 'M', 'L', 'XL'];
  const COLORS: ColorVariant[] = ['Monochrome Black', 'Vintage White', 'Electric Blue'];

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.materialSpec.toLowerCase().includes(q)
    );
  });

  const handleStartAdd = () => {
    setName('');
    setCategory('OVERSIZED TEES');
    setPriceStr('249000');
    setOriginalPriceStr('299000');
    setMaterialSpec('Heavyweight Cotton Combed 24s - Boxy Fit 230GSM');
    setDescription('Streetwear apparel edisi Ilyasviel Apparel dengan jahitan double needle dan kerah rib tebal.');
    setImageUrl('https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600');
    setColorImages({});

    // Generate default variant stock list for all combinations
    const newVars: VariantStock[] = [];
    COLORS.forEach((col) => {
      SIZES.forEach((sz) => {
        newVars.push({
          color: col,
          size: sz,
          stock: 10,
          sku: `IVS-NEW-${col.slice(0, 3).toUpperCase()}-${sz}`
        });
      });
    });
    setVariants(newVars);
    setSelectedProduct(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (p: Product) => {
    setName(p.name);
    setCategory(p.category);
    setPriceStr(p.price ? String(p.price) : '');
    setOriginalPriceStr(p.originalPrice ? String(p.originalPrice) : '');
    setMaterialSpec(p.materialSpec);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
    setColorImages(p.colorImages || {});
    setVariants([...p.variants]);
    setSelectedProduct(p);
    setIsAddingNew(false);
  };

  const handleMainImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantColorFileUpload = (color: ColorVariant, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setColorImages((prev) => ({
            ...prev,
            [color]: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateVariantStock = (color: ColorVariant, size: Size, newStock: number) => {
    setVariants((prev) =>
      prev.map((v) => (v.color === color && v.size === size ? { ...v, stock: Math.max(0, newStock) } : v))
    );
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const parsedPrice = priceStr === '' ? 0 : Number(priceStr);
      const parsedOriginalPrice = originalPriceStr === '' ? undefined : Number(originalPriceStr);

      const prodId = selectedProduct ? selectedProduct.id : `prod-${Date.now()}`;
      const newProd: Product = {
        id: prodId,
        name: name.trim(),
        category,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        materialSpec: materialSpec.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        colorImages,
        variants,
        isActive: true,
        createdAt: selectedProduct ? selectedProduct.createdAt : new Date().toISOString()
      };

      await onSaveProduct(newProd);
      setSelectedProduct(null);
      setIsAddingNew(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save product stock:', err);
      alert('Gagal menyimpan stok produk. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F5F0E6] font-space space-y-6">
      {/* Pop-Art Success Alert Banner Requirement #3 */}
      {showSaveSuccess && (
        <div className="p-4 bg-[#FFC72C] text-black neo-border-4 border-black neo-shadow-lg font-black text-sm flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-6 h-6 text-black bg-white rounded-full p-1 neo-border shrink-0" />
            <div>
              <span className="font-anton text-lg uppercase block leading-none">
                STOK & PRODUK BERHASIL DISIMPAN!
              </span>
              <span className="text-xs font-bold block mt-1">
                Data katalog, spesifikasi bahan, dan stok varian telah tersinkronisasi.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSaveSuccess(false)}
            className="text-black p-1 hover:bg-black/10 neo-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#0A39A6] text-white p-5 neo-border-4 border-black neo-shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#FFC72C] text-black text-xs font-black px-2.5 py-0.5 uppercase neo-border">
            MANAJEMEN STOK & APPAREL
          </span>
          <h2 className="font-anton text-3xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-1">
            KATALOG & STOK VARIAN PER WARNA + UKURAN
          </h2>
          <p className="text-xs font-bold text-blue-200 mt-0.5">
            Atur spesifikasi bahan, harga, dan jumlah stok per kombinasi Ukuran & Warna.
          </p>
        </div>
        <button
          onClick={handleStartAdd}
          className="bg-[#FFC72C] text-black font-anton text-lg tracking-wider px-4 py-2.5 neo-border neo-shadow hover:bg-amber-400 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          TAMBAH APPAREL BARU
        </button>
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map((p) => {
          const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

          return (
            <div key={p.id} className="bg-white neo-border-3 border-black neo-shadow p-4 space-y-4">
              <div className="flex gap-4">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-24 h-24 object-cover neo-border shrink-0 bg-gray-100"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border">
                      {p.category}
                    </span>
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="bg-[#0A39A6] text-white p-1.5 neo-border text-xs font-bold hover:bg-blue-900 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      EDIT STOK
                    </button>
                  </div>
                  <h3 className="font-anton text-xl uppercase text-black leading-tight line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs font-bold text-gray-700">{p.materialSpec}</p>
                  <div className="font-anton text-lg text-[#0A39A6]">
                    {formatRupiah(p.price)}
                  </div>
                </div>
              </div>

              {/* Variant Stock Matrix Table */}
              <div className="bg-[#F5F0E6] p-3 neo-border space-y-2">
                <span className="text-[11px] font-black uppercase text-gray-700 block">
                  SISA STOK PER COMBINATION (WARNA x UKURAN):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold">
                  {p.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 neo-border flex justify-between items-center ${
                        v.stock <= 3 ? 'bg-red-100 border-red-500' : 'bg-white'
                      }`}
                    >
                      <span className="truncate text-[11px]">
                        {v.color.split(' ')[0]} - {v.size}:
                      </span>
                      <span className={`font-black ${v.stock <= 3 ? 'text-red-700' : 'text-black'}`}>
                        {v.stock} PCS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddingNew || selectedProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col font-space">
            <div className="bg-[#0A39A6] text-white p-4 neo-border-b-3 border-black flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-anton text-2xl text-[#FFC72C] uppercase">
                {isAddingNew ? 'TAMBAH ARTIKEL APPAREL BARU' : `EDIT STOK & SPESIFIKASI: ${name}`}
              </h3>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setIsAddingNew(false);
                }}
                className="bg-red-500 text-white p-1.5 neo-border font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-black block mb-1">
                    NAMA ARTIKEL CLOTHING:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: CYBER-PUNK OVERSIZED TEE"
                    className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-black block mb-1">
                    KATEOGRI CLOTHING:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                    className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border"
                  >
                    <option value="OVERSIZED TEES">OVERSIZED TEES</option>
                    <option value="HOODIES & SWEATERS">HOODIES & SWEATERS</option>
                    <option value="CARGO & PANTS">CARGO & PANTS</option>
                    <option value="VESTS & JACKETS">VESTS & JACKETS</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-black block mb-1">
                    HARGA JUAL (RP):
                  </label>
                  <input
                    type="number"
                    required
                    value={priceStr}
                    onChange={(e) => setPriceStr(e.target.value)}
                    placeholder="249000"
                    className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-black block mb-1">
                    HARGA COCORE / CORET (RP):
                  </label>
                  <input
                    type="number"
                    value={originalPriceStr}
                    onChange={(e) => setOriginalPriceStr(e.target.value)}
                    placeholder="299000"
                    className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-black block mb-1">
                  SPESIFIKASI BAHAN APPAREL:
                </label>
                <input
                  type="text"
                  required
                  value={materialSpec}
                  onChange={(e) => setMaterialSpec(e.target.value)}
                  placeholder="Heavyweight Cotton Combed 24s - Boxy Fit 230GSM"
                  className="w-full px-3 py-2 bg-white text-black font-bold text-sm neo-border"
                />
              </div>

              {/* Main Product Image Upload */}
              <div className="bg-white p-4 neo-border space-y-2">
                <label className="text-xs font-black uppercase text-black block">
                  1. FOTO UTAMA PRODUK STREETWEAR:
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-24 h-24 bg-gray-100 neo-border shrink-0 overflow-hidden relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview Utama" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="inline-flex items-center gap-2 bg-[#FFC72C] text-black px-4 py-2 text-xs font-black uppercase neo-border cursor-pointer hover:bg-amber-400 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>UPLOAD FOTO DARI HP / GALERI</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Atau masukkan URL foto Unsplash/CDN..."
                      className="w-full px-3 py-1.5 bg-[#F5F0E6] text-black font-bold text-xs neo-border"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Variant Color Image Upload Slots Requirement #4 */}
              <div className="bg-white p-4 neo-border space-y-3">
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <span className="font-black text-xs uppercase text-[#0A39A6] block">
                    2. UPLOAD FOTO MULTI-VARIAN PER WARNA APPAREL:
                  </span>
                  <span className="text-[10px] bg-[#FFC72C] text-black px-2 py-0.5 font-bold neo-border">
                    MULTI-PHOTO SLOTS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {COLORS.map((col) => {
                    const currentImg = colorImages[col] || '';
                    return (
                      <div key={col} className="bg-[#F5F0E6] p-3 neo-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-xs uppercase text-black truncate">{col}</span>
                          {currentImg && (
                            <button
                              type="button"
                              onClick={() => {
                                setColorImages((prev) => {
                                  const c = { ...prev };
                                  delete c[col];
                                  return c;
                                });
                              }}
                              className="text-red-600 hover:text-red-800 p-0.5"
                              title="Hapus Foto Varian"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="w-full h-28 bg-white neo-border overflow-hidden relative flex items-center justify-center">
                          {currentImg ? (
                            <img src={currentImg} alt={`Varian ${col}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2">
                              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <span className="text-[10px] font-bold text-gray-500 block">BELUM ADA FOTO VARIAN</span>
                            </div>
                          )}
                        </div>

                        <label className="w-full flex items-center justify-center gap-1.5 bg-white text-black py-1.5 px-2 text-[11px] font-black uppercase neo-border cursor-pointer hover:bg-gray-100 transition-colors text-center">
                          <Upload className="w-3.5 h-3.5 text-[#0A39A6]" />
                          <span>PILIH FOTO {col.split(' ')[0]}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantColorFileUpload(col, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Variant Stock Grid Inputs */}
              <div className="bg-white p-4 neo-border space-y-3">
                <span className="font-black text-xs uppercase text-[#0A39A6] block">
                  MANAJEMEN STOK SISA PER COMBINATION (WARNA + UKURAN):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {variants.map((v, idx) => (
                    <div key={idx} className="bg-[#F5F0E6] p-2 neo-border space-y-1">
                      <span className="text-[10px] font-black uppercase text-black block truncate">
                        {v.color.split(' ')[0]} - {v.size}
                      </span>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) =>
                          handleUpdateVariantStock(v.color, v.size, Number(e.target.value))
                        }
                        className="w-full px-2 py-1 bg-white font-anton text-base text-black neo-border"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsAddingNew(false);
                  }}
                  className="w-1/3 py-3 bg-white text-black font-black uppercase neo-border hover:bg-gray-100"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-2/3 py-3 bg-[#FFC72C] text-black font-anton text-lg tracking-wider uppercase neo-border neo-shadow hover:bg-amber-400 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>MENYIMPAN STOK...</span>
                    </>
                  ) : (
                    <span>SIMPAN STOK & KATALOG</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
