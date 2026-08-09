import React, { useState } from 'react';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  isSupabaseConnected, 
  generateSupabaseSqlSchema 
} from '../lib/supabase';
import { Database, Copy, Server, Code, Check, ShieldCheck, RefreshCw, Key, HardDrive } from 'lucide-react';

interface SettingsViewProps {
  onRefreshData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshData }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState<string>(currentConfig.url);
  const [anonKey, setAnonKey] = useState<string>(currentConfig.anonKey);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showSql, setShowSql] = useState<boolean>(false);
  const [testingStatus, setTestingStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const sqlSchema = generateSupabaseSqlSchema();
  const isConnected = isSupabaseConnected();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTestingStatus('MENYAMBUNGKAN KE SUPABASE CLOUD...');

    setSupabaseConfig(url, anonKey);

    setTimeout(async () => {
      try {
        await onRefreshData();
        if (isSupabaseConnected()) {
          setTestingStatus('KONEKSI SUPABASE BERHASIL TERHUBUNG!');
        } else {
          setTestingStatus('KONEKSI GAGAL: FORMAT URL / KEY TIDAK VALID.');
        }
      } catch (err) {
        setTestingStatus('KONEKSI GAGAL ATAU MENGGUNAKAN LOCAL FALLBACK.');
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F5F0E6] font-space space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0A39A6] text-white p-5 neo-border-4 border-black neo-shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-[#FFC72C] text-black text-xs font-black px-2.5 py-0.5 uppercase neo-border">
            SYSTEM & DATABASE CONFIGURATION
          </span>
          <h2 className="font-anton text-3xl text-[#FFC72C] tracking-wide uppercase leading-tight mt-1">
            PENGATURAN SUPABASE DATABASE & KONEKSI CLOUD
          </h2>
          <p className="text-xs font-bold text-blue-200 mt-0.5">
            Kelola URL API, Anon Key, dan skema tabel Supabase Cloud untuk sinkronisasi POS Ilyasviel Apparel.
          </p>
        </div>

        <div className={`px-4 py-2 neo-border-3 border-black font-space text-xs font-black uppercase neo-shadow flex items-center gap-2 ${
          isConnected ? 'bg-[#00C853] text-white' : 'bg-[#FFC72C] text-black'
        }`}>
          <Server className="w-5 h-5" />
          <div>
            <span className="block text-[10px] leading-tight opacity-90">STATUS DATABASE:</span>
            <span className="font-anton text-sm tracking-wider">
              {isConnected ? 'SUPABASE CONNECTED' : 'LOCAL FALLBACK (MOCK)'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Credentials Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-5">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Database className="w-6 h-6 text-[#0A39A6]" />
              <h3 className="font-anton text-xl uppercase text-black">
                1. KREDENSIAL SUPABASE API
              </h3>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#0A39A6]" />
                VITE_SUPABASE_URL:
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-mono font-bold text-xs neo-border focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
              />
              <span className="text-[10px] font-bold text-gray-500 block mt-1">
                Project URL dapat ditemukan di Settings &gt; API pada dashboard Supabase.
              </span>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0A39A6]" />
                VITE_SUPABASE_ANON_KEY:
              </label>
              <textarea
                rows={3}
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-mono font-bold text-xs neo-border focus:outline-none focus:ring-2 focus:ring-[#0A39A6]"
              />
              <span className="text-[10px] font-bold text-gray-500 block mt-1">
                Kunci anon public (JWT Token) untuk otorisasi query client API.
              </span>
            </div>

            {testingStatus && (
              <div className={`p-3 neo-border font-black text-xs uppercase flex items-center gap-2 ${
                isConnected ? 'bg-[#00C853] text-white' : 'bg-[#FFC72C] text-black'
              }`}>
                <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{testingStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-[#0A39A6] text-[#FFC72C] font-anton text-xl tracking-wider uppercase neo-border neo-shadow hover:bg-blue-900 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#FFC72C] border-t-transparent rounded-full animate-spin" />
                  <span>MENYAMBUNGKAN KONEKSI...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-[#FFC72C]" />
                  <span>SIMPAN & UJI KONEKSI SUPABASE</span>
                </>
              )}
            </button>
          </form>

          {/* DDL SQL Script Generator */}
          <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-3">
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#0A39A6]" />
                <h3 className="font-anton text-lg uppercase text-black">
                  2. SCRIPT DDL SUPABASE SQL EDITOR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="px-3 py-1 bg-[#FFC72C] text-black font-black text-xs uppercase neo-border hover:bg-amber-400"
              >
                {showSql ? 'SEMBUNYIKAN SQL' : 'LIHAT SQL SCRIPT'}
              </button>
            </div>

            <p className="text-xs font-bold text-gray-600">
              Salin dan jalankan script SQL ini di SQL Editor dashboard Supabase untuk membuat tabel <code className="bg-black text-white px-1">products</code>, <code className="bg-black text-white px-1">orders</code>, <code className="bg-black text-white px-1">order_items</code>, dan <code className="bg-black text-white px-1">store_settings</code>.
            </p>

            {showSql && (
              <div className="bg-gray-900 text-green-400 p-4 neo-border text-xs font-mono relative space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white uppercase text-[10px]">
                    SQL SCHEMA FOR ILYASVIEL POS
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="bg-[#FFC72C] text-black font-black text-xs px-2.5 py-1 neo-border flex items-center gap-1 hover:bg-amber-400"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {isCopied ? 'TERCOPIED!' : 'COPY SQL'}
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed max-h-72 overflow-y-auto font-mono">
                  {sqlSchema}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Database Mapping Info & Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 neo-border-3 border-black neo-shadow space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2">
              <HardDrive className="w-5 h-5 text-[#0A39A6]" />
              <h3 className="font-anton text-lg uppercase text-black">
                TABEL DATABASE SUPABASE
              </h3>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="bg-[#F5F0E6] p-3 neo-border">
                <div className="font-anton text-sm text-[#0A39A6] uppercase">1. TABEL PRODUCTS</div>
                <p className="text-gray-600 mt-0.5">
                  Menyimpan katalog baju, nama artikel, kategori, harga, spesifikasi bahan, varian stok (S/M/L/XL), dan gambar.
                </p>
              </div>

              <div className="bg-[#F5F0E6] p-3 neo-border">
                <div className="font-anton text-sm text-[#0A39A6] uppercase">2. TABEL ORDERS & ORDER_ITEMS</div>
                <p className="text-gray-600 mt-0.5">
                  Menyimpan riwayat transaksi POS offline dan pesanan web storefront, status lunas, nominal pembayaran, dan nomor resi.
                </p>
              </div>

              <div className="bg-[#F5F0E6] p-3 neo-border">
                <div className="font-anton text-sm text-[#0A39A6] uppercase">3. TABEL STORE_SETTINGS</div>
                <p className="text-gray-600 mt-0.5">
                  Menyimpan konfigurasi CMS storefront, banner promo hero, tagline ("TOO YOUNG TO STAY ORDINARY"), teks CTA, dan opsi kurir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
