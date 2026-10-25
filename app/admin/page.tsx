"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Lock, 
  User, 
  LogOut, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowLeft, 
  RefreshCw, 
  Folder, 
  Layers, 
  KeyRound, 
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AdminProduct {
  id: number;
  sectionId: string;
  sectionLabel: string;
  name: string;
  logoUrl: string;
  priceText: string;
  sortOrder: number;
  updatedAt: string;
}

interface AdminSection {
  id: string;
  label: string;
  sortOrder: number;
  itemCount: number;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("username");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Active Tab: 'products' | 'categories' | 'account'
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "account">("products");

  // Login form states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");

  // Product Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState({
    sectionId: "",
    name: "",
    logoUrl: "",
    priceText: "",
    sortOrder: 0,
  });

  // Section Modals
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null);
  const [sectionForm, setSectionForm] = useState({
    id: "",
    label: "",
    sortOrder: 0,
  });

  // Account Settings Form
  const [accountForm, setAccountForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [accountStatus, setAccountStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  // Global UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "section"; id: string | number; title: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check auth token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("deepna_admin_token");
    const savedUser = localStorage.getItem("deepna_admin_user");
    if (savedUser) setCurrentUsername(savedUser);

    if (savedToken) {
      setToken(savedToken);
      loadAllData(savedToken);
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const loadAllData = async (authToken: string) => {
    setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [prodsRes, secsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/products`, { headers }),
        fetch(`${API_BASE}/api/admin/sections`, { headers }),
      ]);

      if (prodsRes.status === 401 || secsRes.status === 401) {
        handleLogout();
        showToast("error", "Sesi telah berakhir. Silakan login kembali.");
        return;
      }

      if (prodsRes.ok && secsRes.ok) {
        const prodsData = await prodsRes.json();
        const secsData = await secsRes.json();
        setProducts(prodsData);
        setSections(secsData);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      showToast("error", "Gagal menghubungkan ke backend API.");
    } finally {
      setIsLoadingData(false);
      setIsCheckingAuth(false);
    }
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
      localStorage.setItem("deepna_admin_user", data.username || usernameInput);
      setToken(data.token);
      setCurrentUsername(data.username || usernameInput);
      setUsernameInput("");
      setPasswordInput("");
      loadAllData(data.token);
      showToast("success", "Berhasil masuk ke panel admin.");
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
    setSections([]);
  };

  // ==========================================
  // HANDLERS: APLIKASI PREMIUM (PRODUCTS)
  // ==========================================
  const openAddProductModal = () => {
    const defaultSec = sections.length > 0 ? sections[0].id : "";
    setProductForm({
      sectionId: defaultSec,
      name: "",
      logoUrl: "",
      priceText: "",
      sortOrder: products.length,
    });
    setIsAddProductOpen(true);
  };

  const openEditProductModal = (prod: AdminProduct) => {
    setEditingProduct(prod);
    setProductForm({
      sectionId: prod.sectionId,
      name: prod.name,
      logoUrl: prod.logoUrl || "",
      priceText: prod.priceText,
      sortOrder: prod.sortOrder,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!productForm.name.trim() || !productForm.sectionId) {
      showToast("error", "Nama aplikasi dan kategori wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!editingProduct;
      const url = isEdit
        ? `${API_BASE}/api/admin/products/${editingProduct.id}`
        : `${API_BASE}/api/admin/products`;

      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan aplikasi.");

      showToast("success", isEdit ? "Aplikasi berhasil diperbarui." : "Aplikasi baru berhasil ditambahkan.");
      setIsAddProductOpen(false);
      setEditingProduct(null);
      loadAllData(token);
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus aplikasi.");

      showToast("success", "Aplikasi berhasil dihapus.");
      setDeleteConfirm(null);
      loadAllData(token);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus aplikasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // HANDLERS: KATEGORI (SECTIONS)
  // ==========================================
  const openAddSectionModal = () => {
    setSectionForm({
      id: "",
      label: "",
      sortOrder: sections.length,
    });
    setIsAddSectionOpen(true);
  };

  const openEditSectionModal = (sec: AdminSection) => {
    setEditingSection(sec);
    setSectionForm({
      id: sec.id,
      label: sec.label,
      sortOrder: sec.sortOrder,
    });
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!sectionForm.label.trim()) {
      showToast("error", "Nama label kategori wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!editingSection;
      const url = isEdit
        ? `${API_BASE}/api/admin/sections/${editingSection.id}`
        : `${API_BASE}/api/admin/sections`;

      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sectionForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kategori.");

      showToast("success", isEdit ? "Kategori berhasil diperbarui." : "Kategori baru berhasil ditambahkan.");
      setIsAddSectionOpen(false);
      setEditingSection(null);
      loadAllData(token);
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan saat menyimpan kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus kategori.");

      showToast("success", "Kategori berhasil dihapus.");
      setDeleteConfirm(null);
      loadAllData(token);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // HANDLERS: AKUN ADMIN (USERNAME & PASSWORD)
  // ==========================================
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountStatus(null);

    if (!accountForm.currentPassword) {
      setAccountStatus({ type: "error", text: "Password saat ini wajib diisi untuk verifikasi." });
      return;
    }

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setAccountStatus({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }

    setIsUpdatingAccount(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: accountForm.currentPassword,
          newUsername: accountForm.newUsername || undefined,
          newPassword: accountForm.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil admin.");

      if (data.token) {
        localStorage.setItem("deepna_admin_token", data.token);
        setToken(data.token);
      }
      if (data.username) {
        localStorage.setItem("deepna_admin_user", data.username);
        setCurrentUsername(data.username);
      }

      setAccountStatus({ type: "success", text: "Username / Password berhasil diperbarui!" });
      setAccountForm({
        currentPassword: "",
        newUsername: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("success", "Profil akun berhasil diperbarui.");
    } catch (err: any) {
      setAccountStatus({ type: "error", text: err.message || "Gagal memperbarui profil akun." });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = selectedSectionFilter === "all" || p.sectionId === selectedSectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [products, searchQuery, selectedSectionFilter]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#0C253B]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Memeriksa sesi login...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LOGIN SCREEN
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#0C253B]/70 hover:text-[#0C253B] mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Toko
          </Link>
          <div className="w-12 h-12 bg-[#0C253B] text-white flex items-center justify-center rounded-xl mb-4 font-bold text-xl">
            D
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0C253B]">
            Deepna Store Admin
          </h1>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-sm border border-[#0C253B]/10 rounded-2xl sm:px-10">
            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0C253B] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username"
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C253B] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0C253B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password"
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C253B] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0C253B] hover:bg-[#081A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C253B] transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? "Memverifikasi..." : "Masuk ke Panel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#0C253B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${
            toastMessage.type === "success"
              ? "bg-[#0C253B] text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#97AD82]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-200" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#0C253B] transition-colors"
                title="Buka Toko"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lihat Toko</span>
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <h1 className="text-base font-bold tracking-tight text-[#0C253B]">
                Deepna Store Panel
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 hidden sm:inline-block">
                User: <strong className="text-[#0C253B]">{currentUsername}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-t border-gray-100 py-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "products"
                  ? "bg-[#0C253B] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Aplikasi Premium ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "categories"
                  ? "bg-[#0C253B] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Kategori ({sections.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "account"
                  ? "bg-[#0C253B] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Akun & Password</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* TAB 1: APLIKASI PREMIUM (CRUD + LOGO)                     */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search Input */}
                <div className="relative min-w-[220px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama aplikasi..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C253B]"
                  />
                </div>

                {/* Section Filter */}
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#0C253B] font-medium focus:bg-white focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => loadAllData(token)}
                  title="Muat ulang data"
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingData ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Add Product Button */}
              <button
                onClick={openAddProductModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0C253B] hover:bg-[#081A2A] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Aplikasi</span>
              </button>
            </div>

            {/* Product Cards Grid */}
            {isLoadingData ? (
              <div className="py-20 text-center text-sm text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0C253B]" />
                <span>Memuat data aplikasi...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-500">
                  Tidak ada aplikasi ditemukan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const displayLogo = p.logoUrl || `https://unavatar.io/${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com?fallback=false`;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between hover:border-[#0C253B]/30 transition-all shadow-sm"
                    >
                      <div>
                        {/* Header card: Logo + Info */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={displayLogo}
                                alt={p.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<span class="text-lg font-bold text-[#0C253B]">${p.name.charAt(0).toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-[#0C253B] capitalize leading-snug">
                                {p.name}
                              </h3>
                              <span className="text-[11px] font-semibold text-[#97AD82] bg-[#97AD82]/10 px-2 py-0.5 rounded-md">
                                {p.sectionLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditProductModal(p)}
                              title="Edit Aplikasi"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#0C253B]"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "product",
                                  id: p.id,
                                  title: p.name,
                                })
                              }
                              title="Hapus Aplikasi"
                              className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price Preview */}
                        <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100 mb-4 max-h-36 overflow-y-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                            {p.priceText}
                          </pre>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                        <span>Urutan: #{p.sortOrder}</span>
                        <span>ID #{p.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KATEGORI (SECTIONS CRUD)                           */}
        {/* ========================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
              <h2 className="text-sm font-bold text-[#0C253B]">
                Daftar Kategori Aplikasi
              </h2>
              <button
                onClick={openAddSectionModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0C253B] hover:bg-[#081A2A] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Urutan</th>
                      <th className="py-3.5 px-4">ID / Slug</th>
                      <th className="py-3.5 px-4">Nama Label Kategori</th>
                      <th className="py-3.5 px-4">Jumlah Aplikasi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sections.map((sec) => (
                      <tr key={sec.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-semibold text-gray-400">
                          #{sec.sortOrder}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                          {sec.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#0C253B] text-sm">
                          {sec.label}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">
                          {sec.itemCount} aplikasi
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditSectionModal(sec)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              title="Edit Kategori"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "section",
                                  id: sec.id,
                                  title: sec.label,
                                })
                              }
                              className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AKUN & KEAMANAN (UPDATE USERNAME & PASSWORD)       */}
        {/* ========================================================= */}
        {activeTab === "account" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#0C253B] mb-2">
                Perbarui Username & Password
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Username aktif saat ini: <strong className="text-[#0C253B]">{currentUsername}</strong>
              </p>

              {accountStatus && (
                <div
                  className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-3 border ${
                    accountStatus.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {accountStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                  )}
                  <span>{accountStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                    Password Saat Ini (Wajib)
                  </label>
                  <input
                    type="password"
                    required
                    value={accountForm.currentPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, currentPassword: e.target.value })
                    }
                    placeholder="Masukkan password saat ini"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C253B]"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                    Username Baru (Opsional)
                  </label>
                  <input
                    type="text"
                    value={accountForm.newUsername}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, newUsername: e.target.value })
                    }
                    placeholder={currentUsername}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C253B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                    Password Baru (Opsional)
                  </label>
                  <input
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, newPassword: e.target.value })
                    }
                    placeholder="Kosongkan bila tidak ingin mengganti"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C253B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, confirmPassword: e.target.value })
                    }
                    placeholder="Ulangi password baru"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C253B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingAccount}
                  className="w-full mt-4 py-3 bg-[#0C253B] hover:bg-[#081A2A] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isUpdatingAccount ? "Menyimpan Perubahan..." : "Perbarui Akun"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT APLIKASI + LOGO                      */}
      {/* ========================================================= */}
      {(isAddProductOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0C253B]">
                {editingProduct ? "Edit Aplikasi Premium" : "Tambah Aplikasi Premium Baru"}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  Kategori
                </label>
                <select
                  required
                  value={productForm.sectionId}
                  onChange={(e) =>
                    setProductForm({ ...productForm, sectionId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="Contoh: Netflix, Canva Pro, Duolingo"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {/* Logo URL with Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  URL Logo Gambar (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {productForm.logoUrl ? (
                      <img
                        src={productForm.logoUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={productForm.logoUrl}
                    onChange={(e) =>
                      setProductForm({ ...productForm, logoUrl: e.target.value })
                    }
                    placeholder="https://... (kosongkan untuk deteksi otomatis)"
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  Urutan Tampilan (Sort Order)
                </label>
                <input
                  type="number"
                  value={productForm.sortOrder}
                  onChange={(e) =>
                    setProductForm({ ...productForm, sortOrder: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  Rincian Paket & Harga
                </label>
                <textarea
                  rows={6}
                  required
                  value={productForm.priceText}
                  onChange={(e) =>
                    setProductForm({ ...productForm, priceText: e.target.value })
                  }
                  placeholder="Contoh:&#10;1 Bulan: 35.000&#10;3 Bulan: 90.000"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0C253B] hover:bg-[#081A2A] text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Aplikasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT KATEGORI                             */}
      {/* ========================================================= */}
      {(isAddSectionOpen || editingSection) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0C253B]">
                {editingSection ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => {
                  setIsAddSectionOpen(false);
                  setEditingSection(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  Nama Label Kategori
                </label>
                <input
                  type="text"
                  required
                  value={sectionForm.label}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, label: e.target.value })
                  }
                  placeholder="Contoh: Design & Tools"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {!editingSection && (
                <div>
                  <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                    ID / Slug (Opsional)
                  </label>
                  <input
                    type="text"
                    value={sectionForm.id}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, id: e.target.value })
                    }
                    placeholder="Contoh: design-tools (otomatis terisi jika kosong)"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0C253B] mb-1">
                  Urutan Tampilan (Sort Order)
                </label>
                <input
                  type="number"
                  value={sectionForm.sortOrder}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, sortOrder: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSectionOpen(false);
                    setEditingSection(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0C253B] hover:bg-[#081A2A] text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DIALOG KONFIRMASI HAPUS                                   */}
      {/* ========================================================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-gray-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0C253B] mb-2">
              Hapus {deleteConfirm.type === "product" ? "Aplikasi" : "Kategori"}?
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus <strong>"{deleteConfirm.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (deleteConfirm.type === "product") {
                    handleDeleteProduct(deleteConfirm.id as number);
                  } else {
                    handleDeleteSection(deleteConfirm.id as string);
                  }
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
