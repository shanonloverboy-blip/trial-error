const { readState, mutate } = require('../../../lib/githubStore');

export async function GET() {
  try {
    const { state } = await readState();
    return Response.json({ pengajar: state.pengajar, sekolah: state.sekolah });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.code === 'NOT_CONFIGURED' ? 500 : 502 });
  }
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { field, value } = body || {};
  if (field !== 'pengajar' && field !== 'sekolah') {
    return Response.json({ error: 'field must be "pengajar" or "sekolah"' }, { status: 400 });
  }
  const clean = String(value || '').trim();
  if (!clean) return Response.json({ error: 'value is required' }, { status: 400 });

  try {
    const next = await mutate((state) => {
      const copy = { entries: state.entries, pengajar: state.pengajar.slice(), sekolah: state.sekolah.slice() };
      const list = copy[field];
      if (list.indexOf(clean) === -1) { list.push(clean); list.sort(); }
      return copy;
    }, `Tambah ${field}: ${clean}`);
    return Response.json({ pengajar: next.pengajar, sekolah: next.sekolah });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.code === 'NOT_CONFIGURED' ? 500 : 502 });
  }
}
