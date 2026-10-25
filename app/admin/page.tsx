"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Lock, 
  User, 
  LogOut, 
  Search, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowLeft,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AdminProduct {
  id: number;
  sectionId: string;
  sectionLabel: string;
  name: string;
  priceText: string;
  sortOrder: number;
  updatedAt: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Login form states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard states
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Editing modal state
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editPriceText, setEditPriceText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check auth token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("deepna_admin_token");
    if (savedToken) {
      setToken(savedToken);
      fetchProducts(savedToken);
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk. Periksa username dan password.");
      }

      localStorage.setItem("deepna_admin_token", data.token);
      setToken(data.token);
      setUsernameInput("");
      setPasswordInput("");
      fetchProducts(data.token);
      showToast("success", "Berhasil masuk sebagai administrator.");
    } catch (err: any) {
      setLoginError(err.message || "Koneksi ke server backend gagal.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("deepna_admin_token");
    setToken(null);
    setProducts([]);
    showToast("success", "Anda telah keluar dari sesi admin.");
  };

  const fetchProducts = async (authToken: string) => {
    setIsLoadingProducts(true);
    setFetchError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        throw new Error("Sesi telah berakhir. Silakan login kembali.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat produk dari database.");
      }

      setProducts(data);
    } catch (err: any) {
      setFetchError(err.message || "Terjadi kesalahan saat memuat produk.");
    } finally {
      setIsLoadingProducts(false);
      setIsCheckingAuth(false);
    }
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setEditPriceText(product.priceText);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditPriceText("");
  };

  const handleSavePrice = async () => {
    if (!editingProduct || !token) return;
    setIsSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceText: editPriceText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui harga produk.");
      }

      // Update state produk di tampilan lokal
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? { ...item, priceText: editPriceText, updatedAt: new Date().toISOString() }
            : item
        )
      );

      closeEditModal();
      showToast("success", `Harga untuk ${editingProduct.name} berhasil disimpan.`);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan perubahan ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  const sectionsList = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (!map.has(p.sectionId)) {
        map.set(p.sectionId, p.sectionLabel);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedSection !== "all") {
      result = result.filter((p) => p.sectionId === selectedSection);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sectionLabel.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedSection, searchQuery]);

  // Loading state awal
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <RotateCcw className="w-4 h-4 animate-spin text-slate-500" />
          Memeriksa sesi login...
        </div>
      </div>
    );
  }

  // Tampilan Login Form
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Toko
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Admin Deepna Store
            </h1>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Panel"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Utama Admin
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium shadow-lg ${
              toastMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Lihat Website Publik"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                Kelola Harga Produk
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchProducts(token)}
              disabled={isLoadingProducts}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Segarkan Data"
            >
              <RotateCcw className={`w-4 h-4 ${isLoadingProducts ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Controls: Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama aplikasi (misal: netflix, canva)..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSection("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSection === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Semua ({products.length})
            </button>
            {sectionsList.map((sec) => {
              const count = products.filter((p) => p.sectionId === sec.id).length;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSection === sec.id
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {sec.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={() => fetchProducts(token)}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Products Grid */}
        {isLoadingProducts && products.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Memuat daftar produk dari database Neon...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-8">
            <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Tidak ada produk yang cocok</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau kategori filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      {product.sectionLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ID: #{product.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 capitalize mb-3">
                    {product.name}
                  </h3>

                  {/* Price Text Preview */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono max-h-36 overflow-y-auto leading-relaxed">
                    {product.priceText}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Update: {new Date(product.updatedAt).toLocaleDateString("id-ID")}
                  </span>
                  <button
                    onClick={() => openEditModal(product)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Harga
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Edit Harga */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Edit Harga: <span className="capitalize">{editingProduct.name}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kategori {editingProduct.sectionLabel}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Teks Rincian Harga & Paket
              </label>
              <textarea
                rows={12}
                value={editPriceText}
                onChange={(e) => setEditPriceText(e.target.value)}
                placeholder="Tuliskan format paket dan nominal harga..."
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 leading-relaxed"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {isSaving ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan ke Database...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
