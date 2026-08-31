const { readState, mutate } = require('../../../lib/githubStore');

function checkPin(req) {
  const pin = req.headers.get('x-dashboard-pin') || '';
  const expected = process.env.DASHBOARD_PIN;
  if (!expected) {
    const err = new Error('Server not configured: DASHBOARD_PIN is missing.');
    err.status = 500;
    throw err;
  }
  if (pin !== expected) {
    const err = new Error('PIN salah.');
    err.status = 401;
    throw err;
  }
}

export async function GET(req) {
  try {
    checkPin(req);
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 401 });
  }
  try {
    const { state } = await readState();
    return Response.json({ entries: state.entries });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.code === 'NOT_CONFIGURED' ? 500 : 502 });
  }
}

const REQUIRED_FIELDS = ['tanggal', 'pengajar', 'sekolah', 'kelas', 'materi', 'jamMulai', 'jamSelesai', 'jamBerangkat', 'jamSampai'];

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  for (const f of REQUIRED_FIELDS) {
    if (!body || !String(body[f] || '').trim()) {
      return Response.json({ error: `Field "${f}" wajib diisi.` }, { status: 400 });
    }
  }
  if (!(body.jamSelesai > body.jamMulai)) {
    return Response.json({ error: 'Jam selesai harus setelah jam mulai.' }, { status: 400 });
  }

  const entry = {
    id: Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    tanggal: String(body.tanggal).trim(),
    pengajar: String(body.pengajar).trim(),
    sekolah: String(body.sekolah).trim(),
    kelas: String(body.kelas).trim(),
    murid: body.murid !== '' && body.murid != null ? Number(body.murid) : null,
    materi: String(body.materi).trim(),
    jamMulai: String(body.jamMulai).trim(),
    jamSelesai: String(body.jamSelesai).trim(),
    jamBerangkat: String(body.jamBerangkat).trim(),
    jamSampai: String(body.jamSampai).trim(),
    catatan: String(body.catatan || '').trim(),
    createdAt: new Date().toISOString()
  };

  try {
    await mutate((state) => ({
      pengajar: state.pengajar,
      sekolah: state.sekolah,
      entries: state.entries.concat([entry])
    }), `Log kelas: ${entry.pengajar} @ ${entry.sekolah} (${entry.tanggal})`);
    return Response.json({ entry });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.code === 'NOT_CONFIGURED' ? 500 : 502 });
  }
}
