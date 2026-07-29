# Papan Tugas Kantor

Aplikasi papan tugas (Kanban) sederhana untuk menggantikan koordinasi tugas yang selama ini berantakan di grup WhatsApp. WhatsApp tetap bisa dipakai untuk ngobrol cepat, tapi setiap tugas yang perlu ditindaklanjuti dicatat di sini supaya statusnya jelas dan tidak tenggelam di chat.

## Fitur

- Papan dengan 3 kolom: **Belum Dikerjakan**, **Sedang Dikerjakan**, **Selesai**.
- Tambah tugas dengan judul, deskripsi, penanggung jawab (PIC), deadline, dan prioritas.
- Pindahkan status tugas langsung dari kartu.
- Akses tim dilindungi satu kode akses bersama (tanpa perlu akun individual).
- Data tersimpan persisten lewat Vercel KV (Upstash Redis).

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local
# isi APP_PASSCODE dan SESSION_SECRET di .env.local
npm run dev
```

Buka `http://localhost:3000`, masukkan kode akses yang sudah diisi di `APP_PASSCODE`.

Tanpa `KV_REST_API_URL`/`KV_REST_API_TOKEN`, aplikasi tetap jalan tapi datanya hanya tersimpan di memori (hilang saat server di-restart) — cukup untuk mencoba-coba di lokal.

## Deploy ke Vercel

1. Import repo ini ke [Vercel](https://vercel.com/new).
2. Di **Settings → Environment Variables**, tambahkan:
   - `APP_PASSCODE` — kode akses yang akan dibagikan ke tim kantor.
   - `SESSION_SECRET` — string acak panjang (bebas), untuk menandatangani sesi login.
3. Supaya data tugas tersimpan permanen (tidak hilang tiap deploy), tambahkan integrasi **Redis/Upstash** dari tab **Storage** di dashboard project, lalu hubungkan ke project ini. Vercel otomatis mengisi env var `KV_REST_API_URL` dan `KV_REST_API_TOKEN`.
4. Deploy. Bagikan link Vercel + kode akses (`APP_PASSCODE`) ke teman-teman kantor.

Jika env var storage belum diisi, aplikasi tetap bisa diakses tapi akan menampilkan banner peringatan "mode prototipe" dan data bisa hilang saat redeploy.

## Struktur singkat

- `app/page.tsx` — halaman papan tugas (server component, ambil data awal).
- `app/login/page.tsx` — halaman masuk dengan kode akses.
- `middleware.ts` — melindungi semua halaman/API kecuali `/login` dan `/api/login`.
- `app/api/tasks` — CRUD tugas.
- `lib/tasks.ts` — logika data tugas.
- `lib/kv-client.ts` — wrapper penyimpanan (Vercel KV atau memori sebagai fallback).
- `components/Board.tsx` — UI papan Kanban.
