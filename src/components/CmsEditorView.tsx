import React, { useState } from 'react';
import { StoreSettings, CourierOption, PaymentGatewayOption } from '../types';
import { Settings2, Save, Truck, CreditCard, Store, Check, Info, Upload, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';

interface CmsEditorViewProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => Promise<void>;
}

export const CmsEditorView: React.FC<CmsEditorViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [storeName, setStoreName] = useState<string>(settings.storeName);
  const [tagline, setTagline] = useState<string>(settings.tagline);
  const [announcementText, setAnnouncementText] = useState<string>(settings.announcementText);
  const [storeAddress, setStoreAddress] = useState<string>(settings.storeAddress);
  const [storePhone, setStorePhone] = useState<string>(settings.storePhone);
  const [instagramHandle, setInstagramHandle] = useState<string>(settings.instagramHandle);
  const [qrisMerchantName, setQrisMerchantName] = useState<string>(settings.qrisMerchantName);
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>(
    settings.heroBannerUrl || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200'
  );
  const [promoBannerUrl, setPromoBannerUrl] = useState<string>(
    settings.promoBannerUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200'
  );
  const [ctaText, setCtaText] = useState<string>(settings.ctaText || 'SHOP NOW');
  const [promoTagline, setPromoTagline] = useState<string>(settings.promoTagline || 'TOO YOUNG TO STAY ORDINARY');
  
  const [couriers, setCouriers] = useState<CourierOption[]>([...settings.couriers]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayOption[]>([...settings.paymentGateways]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  const handleHeroBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHeroBannerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromoBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPromoBannerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCourierPrice = (id: string, price: number) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, price: Math.max(0, price) } : c))
    );
  };

  const handleToggleCourier = (id: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isAvailable: !c.isAvailable } : c))
    );
  };

  const handleTogglePayment = (id: string) => {
    setPaymentGateways((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSavedSuccess(false);

    try {
      const updated: StoreSettings = {
        ...settings,
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        announcementText: announcementText.trim(),
        storeAddress: storeAddress.trim(),
        storePhone: storePhone.trim(),
        instagramHandle: instagramHandle.trim(),
        qrisMerchantName: qrisMerchantName.trim(),
        heroBannerUrl: heroBannerUrl.trim(),
        promoBannerUrl: promoBannerUrl.trim(),
        ctaText: ctaText.trim(),
        promoTagline: promoTagline.trim(),
        couriers,
        paymentGateways
      };

      await onSaveSettings(updated);
      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Gagal menyimpan pengaturan CMS. Silakan coba lagi.');
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
      {/* Header */}
      <div className="bg-[#0A39A6] text-white p-5 neo-border-4 border-black neo-shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#FFC72C] text-black text-xs font-black px-2.5 py-0.5 uppercase neo-border">
            CMS STOREFRONT EDITOR
          </span>
          <h2 className="font-anton text-3xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-1">
            PENGATURAN TEKS WEB, TARIF ONGKIR & METODE BAYAR
          </h2>
          <p className="text-xs font-bold text-blue-200 mt-0.5">
            Ubah tagline toko online, teks running promo, ongkos kirim kurir, dan rekening transfer.
          </p>
        </div>
      </div>

      {isSavedSuccess && (
        <div className="p-4 bg-emerald-400 text-black neo-border-3 border-black neo-shadow font-black text-sm flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>PENGATURAN CMS BERHASIL DISIMPAN & DISINKRONISASI DENGAN SUPABASE!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Store Tagline & Announcement Text */}
        <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-2">
            <Store className="w-5 h-5 text-[#0A39A6]" />
            <h3 className="font-anton text-xl uppercase text-black">
              1. IDENTITAS WEB STORE & RUNNING BANNER
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                NAMA STOREFRONT:
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-sm neo-border"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                TAGLINE CLOTHING BRAND:
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="INDONESIAN STREETWEAR & HEAVYWEIGHT CUTS"
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-sm neo-border"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-black block mb-1">
              TEKS RUNNING ANNOUNCEMENT (PROMO STOREFRONT):
            </label>
            <textarea
              rows={2}
              required
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-sm neo-border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                ALAMAT FLAGSHIP STORE:
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-xs neo-border"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                NO HP / WHATSAPP STORE:
              </label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-xs neo-border"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                INSTAGRAM OFFICIAL:
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-xs neo-border"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Media Banner & Graphic CMS Requirement #5 */}
        <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-5">
          <div className="flex items-center gap-2 border-b-2 border-black pb-2">
            <Sparkles className="w-5 h-5 text-[#0A39A6]" />
            <h3 className="font-anton text-xl uppercase text-black">
              2. EDIT FOTO BANNER, TAGLINE PROMO & TOMBOL CTA
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Banner File Upload Slot */}
            <div className="bg-[#F5F0E6] p-4 neo-border space-y-3">
              <span className="font-black text-xs uppercase text-black block">
                A. FOTO HERO BANNER UTAMA WEB STOREFRONT:
              </span>
              <div className="w-full h-40 bg-white neo-border overflow-hidden relative">
                {heroBannerUrl ? (
                  <img src={heroBannerUrl} alt="Hero Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-[#FFC72C] text-black font-black text-[10px] px-2 py-0.5 neo-border">
                  MAIN HERO MODEL
                </span>
              </div>
              <div className="space-y-2">
                <label className="w-full flex items-center justify-center gap-2 bg-[#FFC72C] text-black py-2.5 px-3 text-xs font-black uppercase neo-border cursor-pointer hover:bg-amber-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>UPLOAD BANNER HERO DARI GALERI</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroBannerFileUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={heroBannerUrl}
                  onChange={(e) => setHeroBannerUrl(e.target.value)}
                  placeholder="URL Foto Hero Banner..."
                  className="w-full px-3 py-1.5 bg-white text-black font-bold text-xs neo-border"
                />
              </div>
            </div>

            {/* Tagline Promo Banner Upload Slot */}
            <div className="bg-[#F5F0E6] p-4 neo-border space-y-3">
              <span className="font-black text-xs uppercase text-black block">
                B. FOTO BANNER GRAPHIC / PROMO TAGLINE:
              </span>
              <div className="w-full h-40 bg-white neo-border overflow-hidden relative">
                {promoBannerUrl ? (
                  <img src={promoBannerUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-[#0A39A6] text-white font-black text-[10px] px-2 py-0.5 neo-border">
                  GRAPHIC CAMPAIGN
                </span>
              </div>
              <div className="space-y-2">
                <label className="w-full flex items-center justify-center gap-2 bg-[#FFC72C] text-black py-2.5 px-3 text-xs font-black uppercase neo-border cursor-pointer hover:bg-amber-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>UPLOAD BANNER PROMO DARI GALERI</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePromoBannerFileUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={promoBannerUrl}
                  onChange={(e) => setPromoBannerUrl(e.target.value)}
                  placeholder="URL Foto Banner Promo..."
                  className="w-full px-3 py-1.5 bg-white text-black font-bold text-xs neo-border"
                />
              </div>
            </div>
          </div>

          {/* Tagline & CTA Button Text Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                SLOGAN / PROMO TAGLINE BANNER:
              </label>
              <input
                type="text"
                value={promoTagline}
                onChange={(e) => setPromoTagline(e.target.value)}
                placeholder="TOO YOUNG TO STAY ORDINARY"
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-sm neo-border"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                TEKS TOMBOL CTA (CALL TO ACTION):
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="SHOP NOW"
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-bold text-sm neo-border"
              />
            </div>
          </div>

          {/* Live Hero Banner Card Preview Requirement #5 */}
          <div className="bg-black p-6 neo-border border-black text-white space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              {heroBannerUrl && (
                <img src={heroBannerUrl} alt="Banner Live Preview" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="relative z-10 max-w-lg space-y-2">
              <span className="bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 uppercase neo-border">
                LIVE STOREFRONT BANNER PREVIEW
              </span>
              <h2 className="font-anton text-3xl text-[#FFC72C] uppercase tracking-wide leading-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {promoTagline || 'TOO YOUNG TO STAY ORDINARY'}
              </h2>
              <p className="font-space text-xs text-gray-200 font-bold uppercase tracking-wider">
                {tagline}
              </p>
              <button
                type="button"
                className="bg-[#FFC72C] text-black px-6 py-2.5 font-anton text-base tracking-wider uppercase neo-border neo-shadow hover:bg-amber-400 mt-2 flex items-center gap-2"
              >
                <span>{ctaText || 'SHOP NOW'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Courier Shipping Rates Requirement #4 */}
        <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-2">
            <Truck className="w-5 h-5 text-[#0A39A6]" />
            <h3 className="font-anton text-xl uppercase text-black">
              3. TARIF ONGKIR KURIR PENGIRIMAN STORE
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {couriers.map((c) => (
              <div key={c.id} className="bg-[#F5F0E6] p-3 neo-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-anton text-base uppercase text-black">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCourier(c.id)}
                    className={`px-2 py-0.5 text-[10px] font-black neo-border ${
                      c.isAvailable ? 'bg-emerald-400 text-black' : 'bg-red-400 text-white'
                    }`}
                  >
                    {c.isAvailable ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">TARIF ONGKIR (RP):</span>
                  <input
                    type="number"
                    value={c.price}
                    onChange={(e) => handleUpdateCourierPrice(c.id, Number(e.target.value))}
                    className="flex-1 px-2 py-1 bg-white font-anton text-base text-black neo-border"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-500 block">
                  ESTIMASI: {c.estimatedDays}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Payment Gateways Requirement #4 */}
        <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-black pb-2">
            <CreditCard className="w-5 h-5 text-[#0A39A6]" />
            <h3 className="font-anton text-xl uppercase text-black">
              3. METODE PEMBAYARAN ONLINE & POS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentGateways.map((p) => (
              <div key={p.id} className="bg-[#F5F0E6] p-3 neo-border space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-anton text-base uppercase text-black">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePayment(p.id)}
                    className={`px-2 py-0.5 text-[10px] font-black neo-border ${
                      p.isAvailable ? 'bg-emerald-400 text-black' : 'bg-red-400 text-white'
                    }`}
                  >
                    {p.isAvailable ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>
                {p.accountNumber && (
                  <p className="text-xs font-bold text-black">
                    REK: {p.accountNumber} a/n {p.accountName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Actions Requirement #3 */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-[#FFC72C] text-black font-anton text-2xl tracking-wider uppercase neo-border neo-shadow-lg hover:bg-amber-400 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>MENYIMPAN PENGATURAN KE SUPABASE...</span>
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              <span>SIMPAN SEMUA PENGATURAN STOREFRONT CMS</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
