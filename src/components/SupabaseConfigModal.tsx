import React, { useState } from 'react';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  isSupabaseConnected, 
  generateSupabaseSqlSchema 
} from '../lib/supabase';
import { X, Database, Check, Copy, RefreshCw, Server, Code } from 'lucide-react';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onRefreshData
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState<string>(currentConfig.url);
  const [anonKey, setAnonKey] = useState<string>(currentConfig.anonKey);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showSql, setShowSql] = useState<boolean>(false);
  const [testingStatus, setTestingStatus] = useState<string>('');

  const sqlSchema = generateSupabaseSqlSchema();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingStatus('Menyambungkan ke Supabase...');

    setSupabaseConfig(url, anonKey);

    setTimeout(async () => {
      await onRefreshData();
      if (isSupabaseConnected()) {
        setTestingStatus('Koneksi Supabase Sukses!');
      } else {
        setTestingStatus('Koneksi Gagal / Format URL tidak valid.');
      }
    }, 500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isConnected = isSupabaseConnected();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#F5F0E6] neo-border-4 border-black neo-shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col font-space">
        {/* Header */}
        <div className="bg-[#0A39A6] text-white p-4 neo-border-b-3 border-black flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FFC72C]" />
            <h3 className="font-anton text-2xl text-[#FFC72C] tracking-wide uppercase">
              KONFIGURASI SUPABASE DATABASE ILYASVIEL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 text-white p-1.5 neo-border font-black hover:bg-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Status Badge */}
          <div
            className={`p-3 neo-border font-black text-xs flex items-center justify-between ${
              isConnected ? 'bg-emerald-300 text-black' : 'bg-[#FFC72C] text-black'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>
                STATUS DATABASE: {isConnected ? 'TERHUBUNG KE SUPABASE CLOUD' : 'MODE LOCAL FALLBACK (MOCK)'}
              </span>
            </div>
            <span className="bg-black text-white px-2 py-0.5 text-[10px]">
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <p className="text-xs font-bold text-gray-700">
            Aplikasi POS Ilyasviel Apparel ini terintegrasi penuh ke database Supabase (tabel <code className="bg-black text-white px-1">products</code>, <code className="bg-black text-white px-1">orders</code>, <code className="bg-black text-white px-1">order_items</code>, dan <code className="bg-black text-white px-1">store_settings</code>).
          </p>

          {/* Credentials Form Requirement #4 */}
          <form onSubmit={handleSave} className="space-y-4 bg-white p-4 neo-border neo-shadow-sm">
            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                VITE_SUPABASE_URL:
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-space font-bold text-xs neo-border focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-black block mb-1">
                VITE_SUPABASE_ANON_KEY:
              </label>
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-[#F5F0E6] text-black font-space font-bold text-xs neo-border focus:outline-none"
              />
            </div>

            {testingStatus && (
              <p className="text-xs font-black text-[#0A39A6] uppercase">{testingStatus}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0A39A6] text-[#FFC72C] font-anton text-lg tracking-wider uppercase neo-border neo-shadow hover:bg-blue-900"
            >
              SIMPAN & TES KONEKSI SUPABASE
            </button>
          </form>

          {/* SQL Generator Toggle */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="w-full py-2 bg-black text-white font-black text-xs uppercase neo-border flex items-center justify-center gap-2 hover:bg-gray-800"
            >
              <Code className="w-4 h-4 text-[#FFC72C]" />
              {showSql ? 'SEMBUNYIKAN SQL DDL SCRIPT' : 'LIHAT & SALIN SCRIPT DDL SUPABASE'}
            </button>

            {showSql && (
              <div className="bg-gray-900 text-green-400 p-3 neo-border text-xs font-mono overflow-x-auto relative space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white uppercase text-[10px]">
                    SQL SCHEMA FOR SUPABASE SQL EDITOR
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="bg-[#FFC72C] text-black font-black text-[10px] px-2 py-1 neo-border flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {isCopied ? 'COPIED!' : 'COPY SQL'}
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed max-h-60 overflow-y-auto">
                  {sqlSchema}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F5F0E6] neo-border-t-3 border-black text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase neo-border hover:bg-gray-200"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
