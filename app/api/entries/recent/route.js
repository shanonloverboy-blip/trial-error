const { readState } = require('../../../../lib/githubStore');

// Public: a teacher can see their own last few submissions (not payroll data).
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pengajar = (searchParams.get('pengajar') || '').trim();
  const limit = Math.min(Number(searchParams.get('limit')) || 5, 20);
  if (!pengajar) return Response.json({ entries: [] });

  try {
    const { state } = await readState();
    const mine = state.entries
      .filter((e) => e.pengajar === pengajar)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
    return Response.json({ entries: mine });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.code === 'NOT_CONFIGURED' ? 500 : 502 });
  }
}
