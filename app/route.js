const HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Log Kelas Harian — Robotic Explorer</title>
<style>
  :root{
    --navy:#122A4D; --blue:#1E56A0; --red:#D64545; --ink:#1B1F27; --paper:#F7F8FA;
    --card:#FFFFFF; --line:#E2E6EC; --muted:#6B7280; --good:#1F8A56; --radius:10px;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Segoe UI', Inter, -apple-system, sans-serif;background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased;}
  .app{max-width:720px;margin:0 auto;padding:16px 16px 64px;}
  header.top{display:flex;align-items:center;justify-content:space-between;padding:14px 4px 18px;}
  header.top h1{font-size:17px;margin:0;font-weight:700;color:var(--navy);letter-spacing:.1px;}
  header.top span{font-size:12px;color:var(--muted);display:block;margin-top:2px;}
  .tabs{display:flex;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:4px;margin-bottom:18px;}
  .tab{flex:1;text-align:center;padding:9px 6px;border-radius:9px;cursor:pointer;font-size:13.5px;font-weight:600;color:var(--muted);transition:.15s;user-select:none;}
  .tab.active{background:var(--navy);color:#fff;}
  .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:18px;margin-bottom:14px;}
  .card h2{font-size:14.5px;margin:0 0 14px;color:var(--navy);font-weight:700;}
  label{display:block;font-size:12.5px;font-weight:600;color:#3A4150;margin:0 0 5px;}
  .req::after{content:" *";color:var(--red);}
  .field{margin-bottom:14px;}
  input[type=text], input[type=number], input[type=date], input[type=time], select, textarea{
    width:100%;padding:10px 11px;border:1px solid var(--line);border-radius:8px;font-size:14.5px;background:#fff;color:var(--ink);font-family:inherit;
  }
  input:focus, select:focus, textarea:focus{outline:2px solid var(--blue);outline-offset:0;border-color:var(--blue);}
  textarea{resize:vertical;min-height:52px;}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .hint{font-size:11.5px;color:var(--muted);margin-top:4px;}
  .err{font-size:12px;color:var(--red);margin-top:4px;display:none;}
  .field.invalid input, .field.invalid select{border-color:var(--red);}
  .field.invalid .err{display:block;}
  .addnew{font-size:12px;color:var(--blue);background:none;border:none;padding:4px 0 0;cursor:pointer;font-weight:600;}
  button.primary{width:100%;padding:13px;background:var(--blue);color:#fff;border:none;border-radius:9px;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;}
  button.primary:active{transform:scale(0.99);}
  button.primary:disabled{opacity:.55;}
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--good);color:#fff;padding:11px 18px;border-radius:9px;font-size:13.5px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.15);opacity:0;pointer-events:none;transition:.25s;max-width:88%;text-align:center;z-index:50;}
  .toast.show{opacity:1;bottom:28px;}
  .toast.err{background:var(--red);}
  .recent{border-top:1px dashed var(--line);margin-top:16px;padding-top:14px;}
  .recent-item{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:7px 0;border-bottom:1px solid #F0F1F4;color:#3A4150;}
  .recent-item:last-child{border-bottom:none;}
  .pill{display:inline-block;padding:2px 8px;border-radius:20px;background:#EEF3FB;color:var(--blue);font-size:11px;font-weight:700;}
  .lock-box{text-align:center;padding:40px 18px;}
  .lock-box input{max-width:160px;margin:14px auto 8px;text-align:center;letter-spacing:4px;font-size:18px;}
  .filters{display:flex;gap:8px;margin-bottom:14px;}
  .filters select{flex:1;}
  table{width:100%;border-collapse:collapse;font-size:12.5px;}
  th{text-align:left;color:var(--muted);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.3px;border-bottom:2px solid var(--line);padding:6px 8px;}
  td{padding:8px 8px;border-bottom:1px solid #F0F1F4;vertical-align:top;}
  tr:last-child td{border-bottom:none;}
  .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
  .tot-row td{font-weight:700;background:#F7F9FC;}
  .scrollx{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
  .stat{background:#F7F9FC;border-radius:9px;padding:12px;}
  .stat .n{font-size:20px;font-weight:800;color:var(--navy);}
  .stat .l{font-size:11.5px;color:var(--muted);margin-top:2px;}
  .toolbar{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
  .btn-sm{padding:8px 12px;border:1px solid var(--line);background:#fff;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;color:var(--navy);}
  .btn-sm:hover{background:#F7F9FC;}
  .del{color:var(--red);cursor:pointer;font-size:11px;font-weight:700;}
  .empty{text-align:center;color:var(--muted);font-size:13px;padding:24px 10px;}
  .flag{color:var(--red);font-size:11px;font-weight:700;}
  .readonly-note{background:#FDECEC;color:var(--red);border-radius:8px;padding:10px 12px;font-size:12.5px;font-weight:600;margin-bottom:14px;display:none;}
  .modal-back{position:fixed;inset:0;background:rgba(18,42,77,.45);display:none;align-items:center;justify-content:center;z-index:100;padding:20px;}
  .modal-back.show{display:flex;}
  .modal{background:#fff;border-radius:12px;padding:20px;width:100%;max-width:340px;}
  .modal h3{margin:0 0 6px;font-size:15px;color:var(--navy);}
  .modal p{margin:0 0 12px;font-size:12.5px;color:var(--muted);}
  .modal .row{display:flex;gap:8px;margin-top:14px;}
  .modal .row button{flex:1;padding:10px;border-radius:8px;font-size:13.5px;font-weight:700;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--navy);}
  .modal .row button.ok{background:var(--blue);color:#fff;border-color:var(--blue);}
  .modal .row button.danger{background:var(--red);color:#fff;border-color:var(--red);}
</style>
</head>
<body>
<div class="app">
  <header class="top">
    <div>
      <h1>Log Kelas Harian</h1>
      <span>Robotic Explorer — Isi setelah setiap kelas selesai</span>
    </div>
  </header>

  <div class="readonly-note" id="readonly-note">Server belum dikonfigurasi (GITHUB_TOKEN / DASHBOARD_PIN belum diisi di Vercel). Hubungi admin.</div>

  <div class="tabs">
    <div class="tab active" data-tab="form">Isi Log</div>
    <div class="tab" data-tab="dash">Dashboard &amp; Gaji</div>
  </div>

  <div id="view-form">
    <div class="card">
      <h2>Data Kelas</h2>
      <div class="field" id="f-tanggal">
        <label class="req">Tanggal</label>
        <input type="date" id="in-tanggal">
        <div class="err">Tanggal wajib diisi.</div>
      </div>
      <div class="field" id="f-pengajar">
        <label class="req">Nama Pengajar</label>
        <select id="in-pengajar"><option value="">— pilih —</option></select>
        <div class="err">Pilih nama pengajar.</div>
        <button type="button" class="addnew" data-add="pengajar">+ Tambah pengajar baru</button>
      </div>
      <div class="field" id="f-sekolah">
        <label class="req">Nama Sekolah</label>
        <select id="in-sekolah"><option value="">— pilih —</option></select>
        <div class="err">Pilih nama sekolah.</div>
        <button type="button" class="addnew" data-add="sekolah">+ Tambah sekolah baru</button>
      </div>
      <div class="field" id="f-kelas">
        <label class="req">Kelas</label>
        <input type="text" id="in-kelas" placeholder="Contoh: TK, 1-2, SMP 7-9">
        <div class="err">Kelas wajib diisi.</div>
      </div>
      <div class="field" id="f-murid">
        <label>Jumlah Murid</label>
        <input type="number" id="in-murid" min="0" placeholder="Contoh: 12">
        <div class="hint">Kosongkan jika tidak dihitung (mis. kelas privat/trial 1 murid tetap isi 1).</div>
      </div>
      <div class="field" id="f-materi">
        <label class="req">Materi Ajar</label>
        <input type="text" id="in-materi" placeholder="Contoh: Racing Car">
        <div class="err">Materi ajar wajib diisi.</div>
      </div>
      <div class="field" id="f-jam">
        <label class="req">Jam Mengajar</label>
        <div class="row2"><input type="time" id="in-jammulai"><input type="time" id="in-jamselesai"></div>
        <div class="hint">Mulai — Selesai</div>
        <div class="err">Isi jam mulai &amp; selesai (selesai harus setelah mulai).</div>
      </div>
      <div class="field" id="f-berangkat">
        <label class="req">Jam Berangkat &amp; Jam Sampai Kantor</label>
        <div class="row2"><input type="time" id="in-berangkat"><input type="time" id="in-sampai"></div>
        <div class="hint">Untuk tracking pengambilan/pengembalian alat ke HQ</div>
        <div class="err">Isi jam berangkat &amp; jam sampai kantor.</div>
      </div>
      <div class="field">
        <label>Catatan (opsional)</label>
        <textarea id="in-catatan" placeholder="Contoh: 2 anak tidak hadir"></textarea>
      </div>
      <button class="primary" id="btn-submit">Simpan Log Kelas</button>
      <div class="recent" id="recent-wrap" style="display:none;">
        <label style="margin-bottom:8px;">Log terakhir kamu</label>
        <div id="recent-list"></div>
      </div>
    </div>
  </div>

  <div id="view-dash" style="display:none;">
    <div class="card" id="lock-card">
      <div class="lock-box">
        <div style="font-size:13px;color:var(--muted);">Dashboard ini berisi data gaji — masukkan PIN admin.</div>
        <input type="text" id="pin-input" inputmode="numeric" placeholder="PIN">
        <div><button class="btn-sm" id="pin-submit" style="margin-top:6px;">Buka Dashboard</button></div>
      </div>
    </div>

    <div id="dash-content" style="display:none;">
      <div class="card">
        <h2>Periode</h2>
        <div class="filters"><select id="filter-start"></select><select id="filter-end"></select></div>
        <div class="filters"><select id="filter-pengajar"><option value="">Semua pengajar</option></select></div>
      </div>

      <div class="card">
        <h2>Ringkasan</h2>
        <div class="summary-grid" id="summary-stats"></div>
        <div class="toolbar">
          <button class="btn-sm" id="export-payroll">Unduh Rekap Gaji (CSV)</button>
          <button class="btn-sm" id="export-raw">Unduh Log Mentah (CSV)</button>
        </div>
        <div class="scrollx">
          <table id="payroll-table">
            <thead><tr><th>Pengajar</th><th class="num">Hari Mengajar</th><th class="num">Sesi</th><th class="num">Gaji</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>Laporan ke Sekolah</h2>
        <div class="hint" style="margin-bottom:10px;">Rekap materi &amp; kehadiran per sekolah — untuk dikirim ke pihak sekolah.</div>
        <div class="filters"><select id="report-sekolah"><option value="">— pilih sekolah —</option></select></div>
        <div class="toolbar"><button class="btn-sm" id="export-school">Unduh Laporan Sekolah (CSV)</button></div>
        <div class="scrollx">
          <table id="school-table">
            <thead><tr><th>Tgl</th><th>Pengajar</th><th>Kelas</th><th class="num">Murid</th><th>Materi Diajarkan</th><th>Jam</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>Log Kelas (Detail)</h2>
        <div class="scrollx">
          <table id="log-table">
            <thead><tr><th>Tgl</th><th>Pengajar</th><th>Sekolah</th><th>Kelas</th><th class="num">Murid</th><th>Materi</th><th>Jam</th><th></th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
<div class="modal-back" id="modal-back"><div class="modal" id="modal-box"></div></div>

<script src="/app.js" defer></script>
</body>
</html>
`;

export async function GET() {
  return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
