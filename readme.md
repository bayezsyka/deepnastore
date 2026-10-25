<div align="center">
  <a href="https://deepnastore.vercel.app/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/vercel/next.js/canary/packages/create-next-app/templates/default/README-template/public/next.svg" alt="Next.js" height="64" />
  </a>

  # Deepna Store

  **Etalase online untuk jual aplikasi premium** — pelanggan bisa cari aplikasi, lihat daftar harga, lalu langsung checkout lewat WhatsApp.

  <p>
    <a href="https://deepnastore.vercel.app/" target="_blank" rel="noreferrer"><strong>🔗 Live Demo</strong></a>
    ·
    <a href="#fitur-utama"><strong>Fitur</strong></a>
    ·
    <a href="#cara-pakai-untuk-pengunjung"><strong>Cara Pakai</strong></a>
    ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a>
  </p>

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-4-38BDF8" />
    <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000" />
  </p>
</div>

---

## Preview

> Tampilan website (thumbnail otomatis). Kalau gambar tidak muncul, langsung buka **Live Demo**.

![Deepna Store Preview](https://image.thum.io/get/width/1200/https://deepnastore.vercel.app/)

---

## Tentang Project

**Deepna Store** adalah website katalog yang menampilkan berbagai **aplikasi premium** (berdasarkan kategori), lengkap dengan **daftar harga** dan tombol **“Beli via WhatsApp”**.

Tujuannya sederhana:
- Pengunjung **nggak perlu chat dulu** hanya untuk tanya harga.
- Pengunjung bisa **scroll**, **cari aplikasi**, lalu **klik** untuk lihat price list.
- Kalau cocok, tinggal **checkout via WhatsApp** dengan pesan otomatis.

> Live demo: https://deepnastore.vercel.app/

---

## Fitur Utama

### 1) Katalog Terstruktur per Kategori
Aplikasi dikelompokkan menjadi beberapa bagian (contoh: **Streaming**, **Education**, **Editing**, **Music**) supaya pengunjung cepat menemukan yang dibutuhkan.

### 2) Navigasi Cepat (Floating Navbar)
Navbar mengambang di atas layar:
- Tombol cepat ke kategori tertentu (biar nggak capek scroll)
- Menu versi mobile (hamburger menu) untuk layar kecil

### 3) Pencarian Cepat (Search)
Ada fitur **search** untuk mencari nama aplikasi.
- Hasil langsung memfilter katalog
- Ada tampilan “tidak ditemukan” kalau hasil kosong

### 4) Detail Harga via Pop-up
Klik salah satu aplikasi → muncul pop-up yang berisi:
- **Daftar harga / paket** (format bebas, bisa panjang & detail)
- Konten pop-up bisa di-scroll, jadi tetap nyaman dibaca

### 5) Checkout Sekali Klik ke WhatsApp
Di pop-up detail aplikasi ada tombol **“Beli via WhatsApp”**:
- Otomatis membuka WhatsApp
- Pesan sudah terisi (misal: “Hai kak, aku mau beli …”)

### 6) Halaman TNC & Garansi (Pop-up)
Ada pop-up khusus untuk:
- **TNC** (aturan toko)
- **Format Garansi** (template isian saat klaim)

### 7) Logo Aplikasi Otomatis + Fallback
Kartu aplikasi menampilkan ikon/logo otomatis (mengambil favicon dari domain terkait).
Kalau gagal load, akan tampil **huruf pertama** sebagai pengganti.

### 8) UI Modern & Responsif
- Tampilan enak di HP maupun laptop
- Animasi halus, gradient background, dan layout rapi
- Smooth scrolling ke section katalog

---

## Cara Pakai untuk Pengunjung

1. Buka website: https://deepnastore.vercel.app/
2. Klik **“Lihat Katalog”** atau scroll ke kategori.
3. (Opsional) Tekan ikon **Search** lalu ketik nama aplikasi.
4. Klik aplikasi yang ingin dibeli.
5. Baca **daftar harga** dan pilih paket.
6. Klik **“Beli via WhatsApp”** untuk order.
7. Jika perlu, buka **TNC & Garansi** untuk aturan dan format klaim.

---

## Cara Update Konten (untuk Admin / Pemilik)

Tenang, bagian ini dibuat **sesederhana mungkin**.

Yang biasanya diubah:
- **Nomor WhatsApp penjual**
- **Daftar aplikasi & harga**
- **TNC dan format garansi**

### Ubah nomor WhatsApp
Edit bagian `SELLER_WA` di file:
- `app/page.tsx`

Contoh:
```ts
const SELLER_WA = "628xxxxxxxxxxx"; // tanpa tanda +
```

### Ubah data katalog & harga
Edit file:
- `app/data/catalog.ts`

Kamu bisa:
- Menambah/menghapus aplikasi
- Mengubah teks daftar harga (akan tampil persis seperti yang kamu tulis)

### Ubah TNC & format garansi
Edit file:
- `app/data/policies.ts`

---

## Tech Stack

Project ini dibuat dengan:
- **Next.js** (App Router) untuk framework web
- **React** untuk komponen UI
- **TypeScript** untuk penulisan kode yang lebih rapi & aman
- **Tailwind CSS** untuk styling cepat dan konsisten
- **next/font** (Geist) untuk font yang sudah dioptimasi
- **Vercel** untuk hosting & deployment

---

## Menjalankan di Lokal (Opsional)

Kalau kamu ingin menjalankan project ini di laptop/PC:

1. Install **Node.js** versi modern.
2. Install dependency:

```bash
npm install
```

3. Jalankan mode development:

```bash
npm run dev
```

4. Buka di browser:

```text
http://localhost:3000
```

---

## Struktur Singkat Project

```text
app/
  page.tsx              # Halaman utama (katalog, search, WA link, modal)
  components/Modal.tsx  # Komponen pop-up (modal)
  data/catalog.ts       # Data katalog + price list
  data/policies.ts      # TNC & format garansi
  globals.css           # Style global + animasi
public/                 # Aset statis
```

---

## Catatan Penting

- **Nama/brand aplikasi** yang ditampilkan (mis. Netflix, Spotify, dll.) adalah milik masing-masing pemilik merek.
- Logo aplikasi diambil dari favicon domain terkait untuk kebutuhan tampilan katalog.

---

## Lisensi

Bebas dipakai untuk kebutuhan pribadi/bisnis kamu.
Kalau mau lebih formal, tambahkan file `LICENSE` (misalnya MIT).

---

<div align="center">
  Dibuat untuk pengalaman belanja yang cepat, jelas, dan enak dilihat.
</div>
