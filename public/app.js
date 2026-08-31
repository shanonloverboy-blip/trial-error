var pengajarList = [];
var sekolahList = [];
var dashboardPin = null;

function esc(s){ var d = document.createElement('div'); d.textContent = (s == null ? '' : String(s)); return d.innerHTML; }

function showToast(msg, isErr){
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.toggle('err', !!isErr);
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 2400);
}

function fillSelect(sel, list, placeholder){
  sel.innerHTML = '<option value="">' + esc(placeholder) + '</option>' +
    list.map(function(v){ return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join('');
}

function showPromptModal(title, cb){
  var box = document.getElementById('modal-box');
  box.innerHTML = '<h3>' + esc(title) + '</h3>' +
    '<input type="text" id="modal-input" style="width:100%;padding:10px 11px;border:1px solid #E2E6EC;border-radius:8px;font-size:14.5px;">' +
    '<div class="row"><button id="modal-cancel">Batal</button><button class="ok" id="modal-ok">Tambah</button></div>';
  document.getElementById('modal-back').classList.add('show');
  var input = document.getElementById('modal-input');
  setTimeout(function(){ input.focus(); }, 30);
  function done(val){ document.getElementById('modal-back').classList.remove('show'); cb(val); }
  document.getElementById('modal-cancel').onclick = function(){ done(null); };
  document.getElementById('modal-ok').onclick = function(){ done(input.value); };
  input.onkeydown = function(e){ if(e.key === 'Enter'){ done(input.value); } if(e.key === 'Escape'){ done(null); } };
}

function showConfirmModal(msg, cb){
  var box = document.getElementById('modal-box');
  box.innerHTML = '<h3>Konfirmasi</h3><p>' + esc(msg) + '</p>' +
    '<div class="row"><button id="modal-cancel">Batal</button><button class="danger" id="modal-ok">Hapus</button></div>';
  document.getElementById('modal-back').classList.add('show');
  function done(val){ document.getElementById('modal-back').classList.remove('show'); cb(val); }
  document.getElementById('modal-cancel').onclick = function(){ done(false); };
  document.getElementById('modal-ok').onclick = function(){ done(true); };
}

// ---------- API helpers ----------
function api(path, opts){
  opts = opts || {};
  var headers = opts.headers || {};
  if(opts.body) headers['Content-Type'] = 'application/json';
  if(dashboardPin) headers['x-dashboard-pin'] = dashboardPin;
  return fetch(path, {
    method: opts.method || 'GET',
    headers: headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  }).then(function(res){
    return res.json().then(function(data){
      if(!res.ok){ var e = new Error(data.error || ('HTTP ' + res.status)); e.status = res.status; throw e; }
      return data;
    });
  });
}

function loadLists(){
  return api('/api/lists').then(function(data){
    pengajarList = data.pengajar || [];
    sekolahList = data.sekolah || [];
    fillSelect(document.getElementById('in-pengajar'), pengajarList, '— pilih —');
    fillSelect(document.getElementById('in-sekolah'), sekolahList, '— pilih —');
  }).catch(function(e){
    document.getElementById('readonly-note').style.display = 'block';
    document.getElementById('readonly-note').textContent = 'Gagal memuat data: ' + e.message;
  });
}

function addNewOption(type){
  var label = type === 'pengajar' ? 'nama pengajar baru' : 'nama sekolah baru';
  showPromptModal('Tambah ' + label, function(val){
    if(!val || !val.trim()) return;
    var clean = val.trim();
    api('/api/lists', { method: 'POST', body: { field: type, value: clean } }).then(function(data){
      pengajarList = data.pengajar; sekolahList = data.sekolah;
      var elId = type === 'pengajar' ? 'in-pengajar' : 'in-sekolah';
      fillSelect(document.getElementById(elId), type === 'pengajar' ? pengajarList : sekolahList, '— pilih —');
      document.getElementById(elId).value = clean;
      if(type === 'pengajar') renderRecent(clean);
    }).catch(function(e){ showToast('Gagal menambah: ' + e.message, true); });
  });
}

// ---------- Form ----------
function validateForm(){
  var ok = true;
  function req(id, cond){
    var wrap = document.getElementById(id);
    if(!cond){ wrap.classList.add('invalid'); ok = false; } else { wrap.classList.remove('invalid'); }
  }
  var tanggal = document.getElementById('in-tanggal').value;
  var pengajar = document.getElementById('in-pengajar').value;
  var sekolah = document.getElementById('in-sekolah').value;
  var kelas = document.getElementById('in-kelas').value.trim();
  var materi = document.getElementById('in-materi').value.trim();
  var jm = document.getElementById('in-jammulai').value;
  var js = document.getElementById('in-jamselesai').value;
  var jb = document.getElementById('in-berangkat').value;
  var jsampai = document.getElementById('in-sampai').value;

  req('f-tanggal', !!tanggal);
  req('f-pengajar', !!pengajar);
  req('f-sekolah', !!sekolah);
  req('f-kelas', !!kelas);
  req('f-materi', !!materi);
  req('f-jam', !!jm && !!js && js > jm);
  req('f-berangkat', !!jb && !!jsampai);
  return ok;
}

function submitForm(){
  if(!validateForm()){ showToast('Cek kembali kolom yang masih kosong / salah.', true); return; }
  var btn = document.getElementById('btn-submit');
  btn.disabled = true; btn.textContent = 'Menyimpan...';

  var payload = {
    tanggal: document.getElementById('in-tanggal').value,
    pengajar: document.getElementById('in-pengajar').value,
    sekolah: document.getElementById('in-sekolah').value,
    kelas: document.getElementById('in-kelas').value.trim(),
    murid: document.getElementById('in-murid').value ? Number(document.getElementById('in-murid').value) : null,
    materi: document.getElementById('in-materi').value.trim(),
    jamMulai: document.getElementById('in-jammulai').value,
    jamSelesai: document.getElementById('in-jamselesai').value,
    jamBerangkat: document.getElementById('in-berangkat').value,
    jamSampai: document.getElementById('in-sampai').value,
    catatan: document.getElementById('in-catatan').value.trim()
  };

  api('/api/entries', { method: 'POST', body: payload }).then(function(){
    showToast('Log kelas tersimpan ✓');
    var keepPengajar = payload.pengajar;
    document.getElementById('in-tanggal').value = '';
    document.getElementById('in-kelas').value = '';
    document.getElementById('in-murid').value = '';
    document.getElementById('in-materi').value = '';
    document.getElementById('in-jammulai').value = '';
    document.getElementById('in-jamselesai').value = '';
    document.getElementById('in-berangkat').value = '';
    document.getElementById('in-sampai').value = '';
    document.getElementById('in-catatan').value = '';
    renderRecent(keepPengajar);
  }).catch(function(e){
    showToast('Gagal menyimpan: ' + e.message, true);
  }).then(function(){
    btn.disabled = false; btn.textContent = 'Simpan Log Kelas';
  });
}

function renderRecent(pengajarName){
  var wrap = document.getElementById('recent-wrap');
  var list = document.getElementById('recent-list');
  if(!pengajarName){ wrap.style.display = 'none'; return; }
  api('/api/entries/recent?pengajar=' + encodeURIComponent(pengajarName) + '&limit=5').then(function(data){
    var mine = data.entries || [];
    if(mine.length === 0){ wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    list.innerHTML = mine.map(function(e){
      return '<div class="recent-item"><span>' + esc(e.tanggal) + ' · ' + esc(e.sekolah) + ' · ' + esc(e.kelas) + '</span>' +
        '<span class="pill">' + esc(e.jamMulai) + '-' + esc(e.jamSelesai) + '</span></div>';
    }).join('');
  }).catch(function(){ wrap.style.display = 'none'; });
}

// ---------- Dashboard / Payroll ----------
var dashEntries = [];

function computePayroll(entries){
  var byKey = {};
  entries.forEach(function(e){
    var k = e.pengajar + '|' + e.tanggal;
    if(!byKey[k]) byKey[k] = [];
    byKey[k].push(e);
  });
  var perTeacher = {};
  Object.keys(byKey).forEach(function(k){
    var pengajar = k.split('|')[0];
    var sesi = byKey[k].length;
    var gaji = sesi >= 2 ? 175000 : 125000;
    if(!perTeacher[pengajar]) perTeacher[pengajar] = { hari: 0, sesi: 0, gaji: 0 };
    perTeacher[pengajar].hari += 1;
    perTeacher[pengajar].sesi += sesi;
    perTeacher[pengajar].gaji += gaji;
  });
  return perTeacher;
}

function monthOptions(entries){
  var set = {};
  entries.forEach(function(e){ if(e.tanggal) set[e.tanggal.slice(0, 7)] = true; });
  var arr = Object.keys(set).sort();
  if(arr.length === 0){ arr.push(new Date().toISOString().slice(0, 7)); }
  return arr;
}

function fmtIDR(n){ return 'Rp' + n.toLocaleString('id-ID'); }

function unlockDashboard(){
  var pinVal = document.getElementById('pin-input').value;
  api('/api/entries', { headers: { 'x-dashboard-pin': pinVal } }).then(function(){
    dashboardPin = pinVal;
    document.getElementById('lock-card').style.display = 'none';
    document.getElementById('dash-content').style.display = 'block';
    renderDashboard();
  }).catch(function(e){
    showToast(e.status === 401 ? 'PIN salah.' : ('Gagal: ' + e.message), true);
  });
}

function renderDashboard(){
  api('/api/entries').then(function(data){
    dashEntries = data.entries || [];
    var months = monthOptions(dashEntries);
    var startSel = document.getElementById('filter-start');
    var endSel = document.getElementById('filter-end');
    fillSelect(startSel, months, '');
    fillSelect(endSel, months, '');
    startSel.value = months[0];
    endSel.value = months[months.length - 1];
    var so = startSel.querySelector('option[value=""]'); if(so) so.remove();
    var eo = endSel.querySelector('option[value=""]'); if(eo) eo.remove();

    var teacherSel = document.getElementById('filter-pengajar');
    fillSelect(teacherSel, pengajarList, 'Semua pengajar');

    var schoolSel = document.getElementById('report-sekolah');
    fillSelect(schoolSel, sekolahList, '— pilih sekolah —');

    [startSel, endSel, teacherSel].forEach(function(s){ s.onchange = function(){ refreshDashboardTables(); renderSchoolReport(); }; });
    schoolSel.onchange = renderSchoolReport;
    refreshDashboardTables();
    renderSchoolReport();
  }).catch(function(e){ showToast('Gagal memuat dashboard: ' + e.message, true); });
}

function currentPeriodEntries(){
  var start = document.getElementById('filter-start').value;
  var end = document.getElementById('filter-end').value;
  return dashEntries.filter(function(e){
    if(!e.tanggal) return false;
    var m = e.tanggal.slice(0, 7);
    return m >= start && m <= end;
  });
}

function currentFilteredEntries(){
  var teacherFilter = document.getElementById('filter-pengajar').value;
  return currentPeriodEntries().filter(function(e){ return !teacherFilter || e.pengajar === teacherFilter; });
}

function refreshDashboardTables(){
  var filtered = currentFilteredEntries();
  var totalSesi = filtered.length;
  var perTeacher = computePayroll(filtered);
  var totalGaji = Object.keys(perTeacher).reduce(function(s, k){ return s + perTeacher[k].gaji; }, 0);
  var totalHari = Object.keys(perTeacher).reduce(function(s, k){ return s + perTeacher[k].hari; }, 0);
  document.getElementById('summary-stats').innerHTML =
    '<div class="stat"><div class="n">' + totalSesi + '</div><div class="l">Total sesi kelas</div></div>' +
    '<div class="stat"><div class="n">' + fmtIDR(totalGaji) + '</div><div class="l">Total gaji periode ini</div></div>' +
    '<div class="stat"><div class="n">' + totalHari + '</div><div class="l">Total hari-mengajar (semua pengajar)</div></div>' +
    '<div class="stat"><div class="n">' + Object.keys(perTeacher).length + '</div><div class="l">Jumlah pengajar aktif</div></div>';

  var tbody = document.querySelector('#payroll-table tbody');
  var rows = Object.keys(perTeacher).sort();
  if(rows.length === 0){
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Belum ada data pada periode ini.</td></tr>';
  } else {
    tbody.innerHTML = rows.map(function(name){
      var d = perTeacher[name];
      return '<tr><td>' + esc(name) + '</td><td class="num">' + d.hari + '</td><td class="num">' + d.sesi + '</td><td class="num">' + fmtIDR(d.gaji) + '</td></tr>';
    }).join('') + '<tr class="tot-row"><td>Total</td><td class="num">' + totalHari + '</td><td class="num">' + totalSesi + '</td><td class="num">' + fmtIDR(totalGaji) + '</td></tr>';
  }

  var logBody = document.querySelector('#log-table tbody');
  var sorted = filtered.slice().sort(function(a, b){ return (b.tanggal + b.jamMulai).localeCompare(a.tanggal + a.jamMulai); });
  if(sorted.length === 0){
    logBody.innerHTML = '<tr><td colspan="8" class="empty">Tidak ada log.</td></tr>';
  } else {
    logBody.innerHTML = sorted.map(function(e){
      return '<tr><td>' + esc(e.tanggal) + '</td><td>' + esc(e.pengajar) + '</td><td>' + esc(e.sekolah) + '</td><td>' + esc(e.kelas) + '</td>' +
        '<td class="num">' + (e.murid == null ? '-' : e.murid) + '</td>' +
        '<td>' + esc(e.materi) + (e.catatan ? '<div class="flag">' + esc(e.catatan) + '</div>' : '') + '</td>' +
        '<td>' + esc(e.jamMulai) + '-' + esc(e.jamSelesai) + '</td>' +
        '<td><span class="del" data-del="' + esc(e.id) + '">Hapus</span></td></tr>';
    }).join('');
    logBody.querySelectorAll('[data-del]').forEach(function(el){
      el.onclick = function(){
        showConfirmModal('Hapus baris log ini?', function(yes){
          if(!yes) return;
          api('/api/entries/' + encodeURIComponent(el.dataset.del), { method: 'DELETE' }).then(function(data){
            dashEntries = data.entries;
            refreshDashboardTables();
            renderSchoolReport();
          }).catch(function(e){ showToast('Gagal menghapus: ' + e.message, true); });
        });
      };
    });
  }
}

function renderSchoolReport(){
  var sekolah = document.getElementById('report-sekolah').value;
  var tbody = document.querySelector('#school-table tbody');
  if(!sekolah){ tbody.innerHTML = '<tr><td colspan="6" class="empty">Pilih sekolah untuk melihat laporan.</td></tr>'; return; }
  var rows = currentPeriodEntries().filter(function(e){ return e.sekolah === sekolah; })
    .sort(function(a, b){ return (a.tanggal + a.jamMulai).localeCompare(b.tanggal + b.jamMulai); });
  if(rows.length === 0){ tbody.innerHTML = '<tr><td colspan="6" class="empty">Belum ada log untuk sekolah ini pada periode ini.</td></tr>'; return; }
  tbody.innerHTML = rows.map(function(e){
    return '<tr><td>' + esc(e.tanggal) + '</td><td>' + esc(e.pengajar) + '</td><td>' + esc(e.kelas) + '</td>' +
      '<td class="num">' + (e.murid == null ? '-' : e.murid) + '</td>' +
      '<td>' + esc(e.materi) + '</td><td>' + esc(e.jamMulai) + '-' + esc(e.jamSelesai) + '</td></tr>';
  }).join('');
}

function toCSV(rows, headers){
  function encf(v){ return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  return [headers.map(encf).join(',')].concat(
    rows.map(function(r){ return headers.map(function(h){ return encf(r[h]); }).join(','); })
  ).join('\n');
}

function downloadCSV(csv, filename){
  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Init ----------
function init(){
  loadLists();
  document.getElementById('in-tanggal').valueAsDate = new Date();

  document.querySelectorAll('.tab').forEach(function(tab){
    tab.onclick = function(){
      document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var isForm = tab.dataset.tab === 'form';
      document.getElementById('view-form').style.display = isForm ? 'block' : 'none';
      document.getElementById('view-dash').style.display = isForm ? 'none' : 'block';
    };
  });

  document.querySelectorAll('[data-add]').forEach(function(btn){
    btn.onclick = function(){ addNewOption(btn.dataset.add); };
  });

  document.getElementById('in-pengajar').onchange = function(e){ renderRecent(e.target.value); };
  document.getElementById('btn-submit').onclick = submitForm;

  document.getElementById('pin-submit').onclick = unlockDashboard;
  document.getElementById('pin-input').onkeydown = function(e){ if(e.key === 'Enter') unlockDashboard(); };

  document.getElementById('export-payroll').onclick = function(){
    var filtered = currentFilteredEntries();
    var perTeacher = computePayroll(filtered);
    var rows = Object.keys(perTeacher).sort().map(function(name){
      return { Pengajar: name, Hari_Mengajar: perTeacher[name].hari, Total_Sesi: perTeacher[name].sesi, Gaji_IDR: perTeacher[name].gaji };
    });
    var start = document.getElementById('filter-start').value;
    var end = document.getElementById('filter-end').value;
    downloadCSV(toCSV(rows, ['Pengajar', 'Hari_Mengajar', 'Total_Sesi', 'Gaji_IDR']), 'rekap_gaji_' + start + '_' + end + '.csv');
  };

  document.getElementById('export-raw').onclick = function(){
    var filtered = currentFilteredEntries();
    var rows = filtered.map(function(e){
      return {
        Tanggal: e.tanggal, Pengajar: e.pengajar, Sekolah: e.sekolah, Kelas: e.kelas, Jumlah_Murid: e.murid,
        Materi_Ajar: e.materi, Jam_Mulai: e.jamMulai, Jam_Selesai: e.jamSelesai,
        Jam_Berangkat: e.jamBerangkat, Jam_Sampai_Kantor: e.jamSampai, Catatan: e.catatan
      };
    });
    var start = document.getElementById('filter-start').value;
    var end = document.getElementById('filter-end').value;
    downloadCSV(toCSV(rows, ['Tanggal', 'Pengajar', 'Sekolah', 'Kelas', 'Jumlah_Murid', 'Materi_Ajar', 'Jam_Mulai', 'Jam_Selesai', 'Jam_Berangkat', 'Jam_Sampai_Kantor', 'Catatan']),
      'log_mentah_' + start + '_' + end + '.csv');
  };

  document.getElementById('export-school').onclick = function(){
    var sekolah = document.getElementById('report-sekolah').value;
    if(!sekolah){ showToast('Pilih sekolah dulu.', true); return; }
    var rows = currentPeriodEntries().filter(function(e){ return e.sekolah === sekolah; })
      .sort(function(a, b){ return (a.tanggal + a.jamMulai).localeCompare(b.tanggal + b.jamMulai); })
      .map(function(e){
        return { Tanggal: e.tanggal, Pengajar: e.pengajar, Kelas: e.kelas, Jumlah_Murid: e.murid, Materi_Diajarkan: e.materi, Jam: e.jamMulai + '-' + e.jamSelesai };
      });
    var start = document.getElementById('filter-start').value;
    var end = document.getElementById('filter-end').value;
    downloadCSV(toCSV(rows, ['Tanggal', 'Pengajar', 'Kelas', 'Jumlah_Murid', 'Materi_Diajarkan', 'Jam']),
      'laporan_' + sekolah.replace(/[^a-z0-9]+/gi, '_') + '_' + start + '_' + end + '.csv');
  };
}

init();
