"use client";

import { useMemo, useState } from "react";
import Modal from "./components/Modal";
import { CATALOG, type CatalogItem } from "./data/catalog.ts";
import { TNC_TEXT, GARANSI_TEXT } from "./data/policies";

const SELLER_WA = "6285779002785"; // ganti nomor WA seller (tanpa +)

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function waLinkFor(itemName: string) {
  const text = encodeURIComponent(`Hai kak, aku mau beli ${itemName}`);
  return `https://wa.me/${SELLER_WA}?text=${text}`;
}

// Helper to get logo URL for apps
function getLogoUrl(appName: string): string {
  const name = appName.toLowerCase().trim();

  const domainMap: Record<string, string> = {
    // (pakai domainMap kamu yang sekarang)
    netflix: "netflix.com",
    vidio: "vidio.com",
    loklok: "loklok.tv",
    "rcti+": "rctiplus.com",
    "vision+": "visionplus.id",
    viki: "viki.com",
    reelshort: "reelshort.com",
    "klik film": "klikfilm.com",
    "disney+": "disneyplus.com",
    wetv: "wetv.vip",
    "prime video": "primevideo.com",
    "hbo go & hbo max": "hbomax.com",
    youko: "youku.com",
    bstation: "bilibili.tv",
    iqiyi: "iq.com",
    crunchyroll: "crunchyroll.com",
    viu: "viu.com",
    catchplay: "catchplay.com",
    iflix: "iflix.com",
    "mango tv": "mgtv.com",
    sushiroll: "sushiroll.co",
    genflix: "genflix.co.id",
    dramabox: "dramabox.com",
    shortmax: "shortmax.com",
    "short short": "shortshortapp.com",
    flickreels: "flickreels.com",

    chatgpt: "openai.com",
    duolinggo: "duolingo.com",
    grammarly: "grammarly.com",
    "wps office": "wps.com",
    deepl: "deepl.com",
    quillbot: "quillbot.com",
    "ms 365": "microsoft.com",
    goodnotes: "goodnotes.com",
    "scite ai": "scite.ai",
    "claude ai": "anthropic.com",
    medium: "medium.com",
    "i love pdf": "ilovepdf.com",
    camscanner: "camscanner.com",
    "humata ai": "humata.ai",
    perplexity: "perplexity.ai",
    turnitin: "turnitin.com",
    freepik: "freepik.com",
    scribd: "scribd.com",
    wattpad: "wattpad.com",
    chatpdf: "chatpdf.com",
    blinkist: "blinkist.com",
    "google one": "one.google.com",
    kahoot: "kahoot.com",
    quiziz: "quizizz.com",
    gdrive: "drive.google.com",
    statista: "statista.com",
    notion: "notion.so",
    quizlet: "quizlet.com",
    zoom: "zoom.us",
    "gpt zero": "gptzero.me",

    canva: "canva.com",
    capcut: "capcut.com",
    picsart: "picsart.com",
    lightroom: "adobe.com",
    photoshop: "adobe.com",
    "premiere pro": "adobe.com",
    filmora: "filmora.wondershare.com",
    "after effects": "adobe.com",
    vsco: "vsco.co",
    remini: "remini.ai",
    inshot: "inshot.com",
    kinemaster: "kinemaster.com",
    videoleap: "videoleapapp.com",
    vn: "vlognow.me",

    spotify: "spotify.com",
    "apple music": "music.apple.com",
    "youtube music": "music.youtube.com",
    joox: "joox.com",
    resso: "resso.com",
    soundcloud: "soundcloud.com",
    tidal: "tidal.com",
    deezer: "deezer.com",
  };

  const domain = domainMap[name];
  if (!domain) return "";

  // ICON (PNG) — request cuma ke Google
  return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`;
}


export default function Home() {
  const [tncOpen, setTncOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;

    return CATALOG.map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => it.name.toLowerCase().includes(q)),
    })).filter((sec) => sec.items.length > 0);
  }, [query]);

  const handleSearchToggle = () => {
    const newSearchState = !searchOpen;
    setSearchOpen(newSearchState);
    
    if (newSearchState) {
      // Ketika search dibuka, scroll ke catalog section agar buyer bisa lihat hasil
      setTimeout(() => {
        const firstCatalog = CATALOG[0];
        if (firstCatalog) {
          const catalogEl = document.getElementById(firstCatalog.id);
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 100);
    } else {
      // Ketika search ditutup, clear query
      setQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEEAC9] via-[#FFCDC9] to-[#FD7979]/20">
      {/* NAVBAR - Floating & Minimalist */}
      <nav className="fixed top-4 left-4 right-4 z-50 transition-all duration-500">
        <div 
          className={`mx-auto max-w-6xl rounded-full backdrop-blur-xl bg-white/40 border border-white/60 shadow-2xl transition-all duration-500 ${
            searchOpen ? 'bg-white/95 shadow-[0_8px_32px_rgba(253,121,121,0.3)]' : ''
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Left side - Brand & Links */}
            <div 
              className={`flex items-center gap-3 sm:gap-4 lg:gap-6 transition-all duration-500 ${
                searchOpen ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100'
              }`}
            >
              {/* Brand */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-base sm:text-lg font-bold text-[#FD7979] whitespace-nowrap hover:scale-105 transition-transform duration-300"
              >
                Deepna Store
              </button>

              {/* Desktop Links */}
              <div className="hidden lg:flex items-center gap-4 text-xs font-semibold">
                <button 
                  onClick={() => setTncOpen(true)} 
                  className="text-[#FD7979]/80 hover:text-[#FD7979] transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  TNC & Garansi
                </button>

                {CATALOG.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToId(s.id)}
                    className="text-[#FD7979]/80 hover:text-[#FD7979] transition-all duration-300 hover:scale-105 whitespace-nowrap"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-full p-2 bg-white/60 text-[#FD7979] hover:bg-white/80 transition-all duration-300 hover:scale-110"
                aria-label="Menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="lg:hidden absolute top-full left-4 right-4 mt-2 rounded-3xl backdrop-blur-xl bg-white/95 border border-white/60 shadow-2xl py-3 px-4 space-y-2 animate-fadeIn">
                <button 
                  onClick={() => { setTncOpen(true); setMobileMenuOpen(false); }} 
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#FD7979]/80 hover:text-[#FD7979] hover:bg-[#FD7979]/5 rounded-full transition-all duration-300"
                >
                  TNC & Garansi
                </button>

                {CATALOG.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { scrollToId(s.id); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#FD7979]/80 hover:text-[#FD7979] hover:bg-[#FD7979]/5 rounded-full transition-all duration-300"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Search Area */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
              <div 
                className={`transition-all duration-500 ${
                  searchOpen ? 'flex-1 opacity-100 scale-100' : 'w-0 opacity-0 scale-95'
                }`}
              >
                {searchOpen && (
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari aplikasi..."
                    className="w-full rounded-full bg-white/60 px-4 sm:px-6 py-2.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-500 outline-none border-2 border-transparent focus:border-[#FD7979]/30 transition-all duration-300"
                    autoFocus
                  />
                )}
              </div>

              <button
                onClick={handleSearchToggle}
                className={`flex-shrink-0 rounded-full p-2.5 transition-all duration-300 hover:scale-110 ${
                  searchOpen 
                    ? 'bg-[#FD7979] text-white hover:bg-[#FD7979]/90' 
                    : 'bg-white/60 text-[#FD7979] hover:bg-white/80'
                }`}
                aria-label="Search"
                title={searchOpen ? "Close Search" : "Open Search"}
              >
                {searchOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10.5 18.5C14.6421 18.5 18 15.1421 18 11C18 6.85786 14.6421 3.5 10.5 3.5C6.35786 3.5 3 6.85786 3 11C3 15.1421 6.35786 18.5 10.5 18.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21 21L16.65 16.65"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Full Screen */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FD7979]/10 via-transparent to-[#FFCDC9]/20 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FD7979]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFCDC9]/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

        {/* Wave SVG at bottom */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#FFCDC9"
            fillOpacity="0.7"
            d="M0,160L60,176C120,192,240,224,360,229.3C480,235,600,213,720,192C840,171,960,149,1080,144C1200,139,1320,149,1380,154.7L1440,160L1440,320L0,320Z"
          />
        </svg>

        <svg
          className="absolute inset-x-0 bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#FDACAC"
            fillOpacity="0.5"
            d="M0,192L80,176C160,160,320,128,480,117.3C640,107,800,117,960,133.3C1120,149,1280,171,1360,181.3L1440,192L1440,320L0,320Z"
          />
        </svg>

        {/* Hero Content */}
        <div className="relative z-10 text-center space-y-6 max-w-4xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#FD7979] tracking-tight drop-shadow-lg animate-fade-in">
            Deepna Store
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-[#FD7979]/90 font-medium drop-shadow-md">
            Jual Aplikasi Premium Terpercaya
          </p>
          <p className="text-base sm:text-lg text-[#FD7979]/70 max-w-2xl mx-auto px-4">
            Dapatkan aplikasi premium dengan harga terbaik dan garansi terjamin
          </p>
          
          {/* CTA Button */}
          <div className="pt-6">
            <button
              onClick={() => scrollToId(CATALOG[0]?.id || 'catalog')}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#FD7979] text-white rounded-full font-semibold text-base sm:text-lg shadow-2xl hover:bg-[#FD7979]/90 transition-all duration-300 hover:scale-105 hover:shadow-3xl"
            >
              Lihat Katalog
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* CATALOG SECTIONS */}
      <div className="mx-auto max-w-6xl px-6 pb-20 space-y-16">
        {filteredCatalog.length === 0 && query.trim() ? (
          <div className="pt-20 pb-10 text-center">
            <div className="inline-block p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-[#FD7979]/20 shadow-xl">
              <svg className="mx-auto mb-4 w-16 h-16 text-[#FD7979]/40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M10.5 18.5C14.6421 18.5 18 15.1421 18 11C18 6.85786 14.6421 3.5 10.5 3.5C6.35786 3.5 3 6.85786 3 11C3 15.1421 6.35786 18.5 10.5 18.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3 className="text-2xl font-bold text-[#FD7979] mb-2">Belum ada yang kamu cari</h3>
              <p className="text-[#FD7979]/70">Coba kata kunci lain atau lihat semua katalog kami</p>
              <button
                onClick={() => setQuery("")}
                className="mt-4 px-6 py-2.5 bg-[#FD7979] text-white rounded-full font-semibold text-sm hover:bg-[#FD7979]/90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Lihat Semua Aplikasi
              </button>
            </div>
          </div>
        ) : (
          filteredCatalog.map((section, idx) => (
            <section 
              key={section.id} 
              id={section.id} 
              className="pt-8 scroll-mt-20"
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` 
              }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-1 w-12 bg-gradient-to-r from-[#FD7979] to-[#FFCDC9] rounded-full" />
                <h2 className="text-3xl font-bold text-[#FD7979] tracking-tight">
                  {section.label}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {section.items.map((it, itemIdx) => {
                  const logoUrl = getLogoUrl(it.name);
                  
                  return (
                    <button
                      key={it.name}
                      onClick={() => setActiveItem(it)}
                      className="group relative rounded-2xl bg-white/80 backdrop-blur-sm px-4 py-6 text-center text-sm font-semibold text-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white border border-white/50 hover:border-[#FD7979]/30 flex flex-col items-center gap-3"
                      style={{ 
                        animation: `fadeInUp 0.4s ease-out ${itemIdx * 0.05}s both` 
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FD7979]/0 to-[#FD7979]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Logo */}
                      <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-white/60 p-2 group-hover:bg-white transition-colors duration-300">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={it.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to first letter if logo fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full items-center justify-center text-2xl font-bold text-[#FD7979]"
                          style={{ display: logoUrl ? 'none' : 'flex' }}
                        >
                          {it.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* App Name */}
                      <span className="relative z-10 capitalize leading-tight">{it.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* POPUP: TNC & GARANSI */}
      <Modal open={tncOpen} title="TNC & Garansi" onClose={() => setTncOpen(false)}>
        <div className="space-y-6">
          <div>
            <div className="mb-3 text-base sm:text-lg font-bold text-[#FD7979] flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              TNC
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#FEEAC9]/30 to-[#FFCDC9]/20 p-4 sm:p-5 border border-[#FD7979]/10">
              <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                {TNC_TEXT}
              </pre>
            </div>
          </div>

          <div>
            <div className="mb-3 text-base sm:text-lg font-bold text-[#FD7979] flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Form Garansi
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#FEEAC9]/30 to-[#FFCDC9]/20 p-4 sm:p-5 border border-[#FD7979]/10">
              <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                {GARANSI_TEXT}
              </pre>
            </div>
          </div>
        </div>
      </Modal>

      {/* POPUP: PRICE LIST + BUTTON WA */}
      <Modal
        open={!!activeItem}
        title={activeItem?.name ?? ""}
        onClose={() => setActiveItem(null)}
      >
        <div className="space-y-5">
          {/* Price card with better styling */}
          <div className="rounded-2xl bg-gradient-to-br from-[#FEEAC9]/40 to-[#FFCDC9]/30 p-5 sm:p-6 border border-[#FD7979]/10 shadow-inner">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#FD7979]/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Daftar Harga
            </div>
            <pre className="whitespace-pre-wrap text-sm sm:text-base text-gray-800 leading-relaxed font-sans font-medium">
              {activeItem?.priceText ?? ""}
            </pre>
          </div>

          {/* WhatsApp button with modern design */}
          <a
            href={activeItem ? waLinkFor(activeItem.name) : "#"}
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-6 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Beli via WhatsApp</span>
          </a>
        </div>
      </Modal>
    </div>
  );
}
