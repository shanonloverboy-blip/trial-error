const { mutate } = require('../../../../lib/githubStore');

export async function DELETE(req, { params }) {
  const pin = req.headers.get('x-dashboard-pin') || '';
  const expected = process.env.DASHBOARD_PIN;
  if (!expected) return Response.json({ error: 'Server not configured: DASHBOARD_PIN is missing.' }, { status: 500 });
  if (pin !== expected) return Response.json({ error: 'PIN salah.' }, { status: 401 });

  const { id } = await params;
  try {
    const next = await mutate((state) => ({
      pengajar: state.pengajar,
      sekolah: state.sekolah,
      entries: state.entries.filter((e) => e.id !== id)
    }), `Hapus log kelas ${id}`);
    return Response.json({ entries: next.entries });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.code === 'NOT_CONFIGURED' ? 500 : 502 });
  }
}
