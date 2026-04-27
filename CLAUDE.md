# CLAUDE.md — Kantong Project

> Dokumen ini adalah sumber kebenaran tunggal untuk project **Kantong**.
> Baca seluruh dokumen ini sebelum menulis satu baris kode pun.

---

## 1. Ringkasan Project

**Kantong** adalah aplikasi pencatatan keuangan pribadi berbasis web yang memungkinkan pengguna mencatat pemasukan dan pengeluaran, mengatur spending cap per kategori, dan menerima peringatan cerdas berbasis prediksi burn rate mingguan.

**Fitur pembeda utama:** Burn Rate Engine — algoritma yang memproyeksikan total pengeluaran hingga akhir bulan berdasarkan pola pengeluaran mingguan yang sudah berjalan, lalu memicu alert bertingkat jika proyeksi mendekati atau melampaui spending cap yang ditetapkan user.

**Target user:** Satu pengguna (personal use), bukan multi-tenant publik.

---

## 2. Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Frontend | React + Vite | React 18, Vite 5 |
| State management | Zustand | Latest stable |
| Server state & cache | TanStack Query (React Query) | v5 |
| Styling | Tailwind CSS | v3 |
| Charting | Recharts | Latest stable |
| Backend | Node.js + Express | Node 20 LTS |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth | — |
| Bahasa | TypeScript | Seluruh codebase |
| Currency | IDR (Rupiah) | Format: `Rp 1.500.000` |

---

## 3. Struktur Folder

```
kantong/
├── client/                         # React + Vite frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ui/                 # Komponen dasar (Button, Input, Card, Badge, Modal)
│       │   ├── layout/             # Sidebar, Topbar, PageShell
│       │   ├── transactions/       # TransactionList, TransactionForm, TransactionCard
│       │   ├── categories/         # CategoryCard, CategoryForm, SpendingCapInput
│       │   ├── alerts/             # AlertBanner, AlertCard, AlertBadge
│       │   └── charts/             # SpendingChart, BurnRateChart, CategoryPieChart
│       ├── pages/
│       │   ├── Dashboard.tsx       # Halaman utama: summary + alerts + quick add
│       │   ├── Transactions.tsx    # List transaksi + filter + search
│       │   ├── Categories.tsx      # Manage kategori + spending cap
│       │   └── Reports.tsx         # Grafik & laporan bulanan
│       ├── store/
│       │   ├── useAuthStore.ts     # State autentikasi (user session)
│       │   └── useAlertStore.ts    # State in-app alerts (unread count, list)
│       ├── hooks/
│       │   ├── useTransactions.ts  # CRUD transaksi via React Query
│       │   ├── useCategories.ts    # CRUD kategori via React Query
│       │   └── useBurnRate.ts      # Fetch & subscribe hasil Burn Rate Engine
│       ├── lib/
│       │   ├── supabase.ts         # Supabase client singleton
│       │   ├── api.ts              # Axios instance dengan base URL + auth header
│       │   └── formatCurrency.ts  # IDR formatter (Intl.NumberFormat)
│       └── types/
│           └── index.ts            # Shared TypeScript types & interfaces
│
├── server/                         # Node.js + Express backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Entry point, middleware setup, route mounting
│       ├── routes/
│       │   ├── transactions.ts
│       │   ├── categories.ts
│       │   └── alerts.ts
│       ├── controllers/
│       │   ├── transactionController.ts
│       │   ├── categoryController.ts
│       │   └── alertController.ts
│       ├── middleware/
│       │   └── auth.ts             # Verifikasi Supabase JWT
│       ├── lib/
│       │   ├── supabase.ts         # Supabase admin client (service_role key)
│       │   └── burnRateEngine.ts   # CORE ALGORITHM — lihat bagian 7
│       └── types/
│           └── index.ts
│
└── CLAUDE.md                       # File ini
```

---

## 4. Environment Variables

### `client/.env`
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3001/api
```

### `server/.env`
```env
PORT=3001
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_ORIGIN=http://localhost:5173
```

**Aturan penting:**
- Jangan pernah commit file `.env` ke git.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh ada di server — tidak boleh pernah dikirim ke client.
- Gunakan `VITE_` prefix untuk semua env variable yang perlu diakses di frontend.

---

## 5. Database Schema (PostgreSQL via Supabase)

### Tabel `categories`
```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'tag',        -- nama icon dari Lucide
  color       TEXT NOT NULL DEFAULT '#6366f1',    -- hex color untuk UI
  spending_cap BIGINT NOT NULL DEFAULT 0,          -- dalam Rupiah (IDR), 0 = tidak ada cap
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tabel `transactions`
```sql
CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount      BIGINT NOT NULL CHECK (amount > 0),  -- dalam Rupiah, selalu positif
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tabel `alerts`
```sql
CREATE TABLE alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id      UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month            SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year             SMALLINT NOT NULL,
  level            TEXT NOT NULL CHECK (level IN ('WATCH', 'WARNING', 'DANGER')),
  projected_amount BIGINT NOT NULL,   -- proyeksi pengeluaran akhir bulan (IDR)
  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, month, year, level)  -- satu level per kategori per bulan
);
```

### Row Level Security (RLS)
Aktifkan RLS pada semua tabel dan tambahkan policy berikut untuk setiap tabel:
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policy template (ulangi untuk tiap tabel):
CREATE POLICY "Users can only access own data"
ON <table_name>
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Konvensi penyimpanan:**
- Semua nilai uang disimpan dalam **integer IDR** (Rupiah bulat, tanpa desimal).
- Jangan pernah simpan nilai uang sebagai float/decimal untuk menghindari floating point error.

---

## 6. TypeScript Types

Definisikan di `client/src/types/index.ts` dan `server/src/types/index.ts`:

```typescript
export type AlertLevel = 'WATCH' | 'WARNING' | 'DANGER';
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  spending_cap: number;   // IDR, 0 = tidak ada cap
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;          // IDR, selalu positif
  type: TransactionType;
  description: string | null;
  date: string;            // ISO date string: 'YYYY-MM-DD'
  created_at: string;
  category?: Category;     // optional join
}

export interface Alert {
  id: string;
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  level: AlertLevel;
  projected_amount: number; // IDR
  is_read: boolean;
  created_at: string;
  category?: Category;      // optional join
}

export interface BurnRateResult {
  category_id: string;
  category_name: string;
  spending_cap: number;
  spent_so_far: number;
  weekly_average: number;
  projected_total: number;
  remaining_budget: number;
  weeks_elapsed: number;
  weeks_remaining: number;
  alert_level: AlertLevel | null;  // null = aman, tidak perlu alert
  percentage_used: number;         // spent_so_far / spending_cap * 100
  percentage_projected: number;    // projected_total / spending_cap * 100
}
```

---

## 7. Burn Rate Engine (Core Algorithm)

**File:** `server/src/lib/burnRateEngine.ts`

Ini adalah fitur utama dan paling kritis. Implementasikan dengan tepat sesuai spesifikasi berikut.

### Logika Kalkulasi

```typescript
/**
 * Menghitung burn rate dan proyeksi pengeluaran per kategori untuk bulan berjalan.
 *
 * Definisi "minggu" dalam konteks ini:
 * - Bukan calendar week (Senin-Minggu).
 * - Minggu dihitung dari tanggal 1 bulan berjalan.
 * - Contoh: tanggal 1-7 = minggu ke-1, 8-14 = minggu ke-2, dst.
 *
 * Formula:
 *   weeks_elapsed    = ceil(hari_berjalan / 7), minimum 1
 *   weeks_in_month   = ceil(total_hari_bulan / 7)  → biasanya 4 atau 5
 *   weeks_remaining  = weeks_in_month - weeks_elapsed
 *   weekly_average   = spent_so_far / weeks_elapsed
 *   projected_total  = spent_so_far + (weekly_average * weeks_remaining)
 *
 * Alert level:
 *   projected_total >= spending_cap * 1.0  → DANGER
 *   projected_total >= spending_cap * 0.85 → WARNING
 *   projected_total >= spending_cap * 0.70 → WATCH
 *   else                                   → null (aman)
 *
 * Kategori yang spending_cap = 0 (tidak di-set) DILEWATI dari kalkulasi alert.
 * Kategori yang sudah melampaui spending_cap secara aktual (bukan proyeksi)
 * langsung mendapat level DANGER tanpa menunggu proyeksi.
 */
```

### Trigger Kalkulasi

Engine dipanggil dalam tiga kondisi:
1. Saat user membuka dashboard (on-demand via `GET /api/alerts/burn-rate`).
2. Saat user menambah atau mengedit transaksi expense (real-time re-calculation).
3. Secara periodik via cron job setiap awal minggu (opsional, implementasi di fase lanjutan).

### Hasil Alert

Setelah kalkulasi, bandingkan hasil dengan alert yang sudah ada di tabel `alerts`:
- Jika level baru lebih tinggi dari level yang tersimpan → insert/update alert baru.
- Jika level baru sama → tidak perlu insert ulang (gunakan `UNIQUE` constraint).
- Jangan hapus alert lama yang sudah dibaca user — hanya tandai yang baru sebagai `is_read = false`.

---

## 8. API Endpoints

Semua endpoint memerlukan header `Authorization: Bearer <supabase_jwt_token>`.

### Transactions
```
GET    /api/transactions              Query: ?month=&year=&category_id=&type=
POST   /api/transactions              Body: { category_id, amount, type, description, date }
PUT    /api/transactions/:id          Body: { amount?, description?, date?, category_id? }
DELETE /api/transactions/:id
```

### Categories
```
GET    /api/categories                Hanya kategori milik user yang login
POST   /api/categories                Body: { name, icon, color, spending_cap }
PUT    /api/categories/:id            Body: { name?, icon?, color?, spending_cap?, is_active? }
DELETE /api/categories/:id            Soft delete: set is_active = false
```

### Alerts
```
GET    /api/alerts                    Query: ?is_read=false  →  alert belum dibaca
GET    /api/alerts/burn-rate          Jalankan kalkulasi on-demand, return BurnRateResult[]
PUT    /api/alerts/:id/read           Tandai satu alert sebagai sudah dibaca
PUT    /api/alerts/read-all           Tandai semua alert bulan ini sebagai sudah dibaca
```

---

## 9. Konvensi Kode

### Umum
- Gunakan TypeScript secara ketat (`strict: true` di tsconfig). Tidak ada `any` kecuali terpaksa, dan harus diberi komentar alasannya.
- Nama file: `camelCase.ts` untuk utility/lib, `PascalCase.tsx` untuk React component.
- Nama variabel dan fungsi: `camelCase`.
- Nama tipe/interface: `PascalCase`.
- Komentar kode: gunakan Bahasa Indonesia untuk komentar bisnis, Bahasa Inggris untuk komentar teknis.

### React & Frontend
- Gunakan functional component dan hooks. Tidak ada class component.
- Setiap komponen yang melakukan fetch data harus menggunakan hook dari folder `hooks/` — tidak ada fetch langsung di dalam komponen page.
- Format IDR selalu menggunakan fungsi dari `lib/formatCurrency.ts`:
  ```typescript
  // Contoh output: "Rp 1.500.000"
  export function formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  ```
- Warna untuk alert level (gunakan konsisten di seluruh UI):
  - `WATCH`   → kuning/amber  (`text-amber-600`, `bg-amber-50`)
  - `WARNING` → oranye        (`text-orange-600`, `bg-orange-50`)
  - `DANGER`  → merah         (`text-red-600`, `bg-red-50`)

### Backend
- Semua controller harus menggunakan try/catch dan mengembalikan error yang konsisten:
  ```typescript
  // Format error response yang standar
  res.status(400).json({ error: 'Pesan error yang jelas', code: 'ERROR_CODE' });
  ```
- Validasi input di level controller sebelum menyentuh database.
- Gunakan Supabase admin client (`service_role`) hanya di server — tidak pernah di client.
- Setiap query ke database harus menyertakan filter `user_id` yang didapat dari JWT, meskipun RLS sudah aktif (defense in depth).

---

## 10. Penanganan Error Umum

| Skenario | Perilaku yang Diharapkan |
|---|---|
| JWT expired/invalid | Server return 401, client redirect ke halaman login |
| Category tidak punya spending_cap (= 0) | Skip dari burn rate calculation, jangan tampilkan alert |
| Tidak ada transaksi bulan ini | `weekly_average = 0`, `projected_total = 0`, tidak ada alert |
| Minggu pertama bulan (hari 1-7) | `weeks_elapsed = 1`, kalkulasi tetap berjalan normal |
| Amount bernilai 0 atau negatif | Tolak di level validasi, return error 400 |
| Delete kategori yang punya transaksi | Soft delete saja (`is_active = false`), transaksi tetap ada dengan `category_id` yang masih valid |

---

## 11. Urutan Pengerjaan (Development Phases)

Kerjakan secara berurutan. Jangan loncat ke fase berikutnya sebelum fase sebelumnya selesai dan berfungsi.

### Phase 1 — Foundation
1. Setup monorepo: `client/` (Vite + React + TS + Tailwind) dan `server/` (Node + Express + TS)
2. Konfigurasi Supabase: buat tabel, aktifkan RLS, setup policies
3. Implementasi autentikasi: register, login, logout, protected routes
4. CRUD kategori (tanpa spending cap dulu)
5. CRUD transaksi (income & expense)

### Phase 2 — Core Feature
1. Tambahkan field `spending_cap` ke kategori + UI untuk mengaturnya
2. Implementasi `burnRateEngine.ts` sesuai spesifikasi di bagian 7
3. Endpoint `GET /api/alerts/burn-rate`
4. Komponen `AlertBanner` di dashboard yang menampilkan alert aktif
5. Trigger re-kalkulasi otomatis setiap kali transaksi expense ditambah/diedit

### Phase 3 — Polish
1. Dashboard summary cards (total income, total expense, sisa budget bulan ini)
2. Progress bar per kategori (spent vs spending cap)
3. Grafik pengeluaran bulanan dengan Recharts
4. Filter & search di halaman Transactions
5. Halaman Reports (breakdown per kategori, tren bulanan)
6. Mark alert sebagai sudah dibaca
7. Responsive design untuk mobile browser

---

## 12. Hal yang Tidak Boleh Dilakukan

- **Jangan** simpan nilai uang sebagai `float` atau `decimal` — gunakan `integer` (Rupiah bulat).
- **Jangan** expose `SUPABASE_SERVICE_ROLE_KEY` ke frontend dalam kondisi apapun.
- **Jangan** buat komponen page yang fetch data langsung — selalu lewat custom hook.
- **Jangan** hardcode user_id di query — selalu ambil dari JWT yang sudah diverifikasi.
- **Jangan** hapus transaksi atau kategori secara fisik jika masih ada relasi — gunakan soft delete.
- **Jangan** mulai Phase 3 sebelum Burn Rate Engine di Phase 2 sudah teruji benar.

---

*Terakhir diperbarui: April 2026*
*Versi: 1.0.0*
