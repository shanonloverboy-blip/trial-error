const OWNER = 'shanonloverboy-blip';
const REPO = 'trial-error';
const BRANCH = 'data';
const PATH = 'data/state.json';

function apiUrl() {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
}

function authHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const err = new Error('Server not configured: GITHUB_TOKEN is missing.');
    err.code = 'NOT_CONFIGURED';
    throw err;
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function emptyState() {
  return {
    entries: [],
    pengajar: ['ADI','ALKA','ATTAR','CERI','DAKA','DIKA','EKA','HARMIN','NABIL','NOVHAN','RIFQI','TOFA','UBAY','WENDY','YUSUF'],
    sekolah: [
      'TK Kinderfield Tebet','TK Kinderfield Duren Sawit','TK Kinderfield Q Big','TK Kinderfield Sunter',
      'SD Kinderfield Duren Sawit','SD Kinderfield Q Big',
      'SDS Santa Ursula','SDS Tunas Bangsa Depok','SDS Tunas Bangsa Citra','SDS Tunas Bangsa Greenville',
      'SDS Tunas Bangsa Cakung','SMP Tunas Bangsa Cakung','SDS Tunas Bangsa Cikarang',
      'TK Tunas Bangsa Serpong','SDS Tunas Bangsa Serpong','SMP Tunas Bangsa Serpong',
      'SMP Tunas Bangsa Greenville','SMP Tunas Bangsa Sunter','SDS Tunas Bangsa Sunter',
      'SD Tunas Bangsa Gunung Sahari','TK A & B Asisi','SD Asisi','SMP Stella Maris',
      'Sunshine','TK Nizamia Andalusia'
    ].sort()
  };
}

async function readState() {
  const res = await fetch(`${apiUrl()}?ref=${BRANCH}`, { headers: authHeaders(), cache: 'no-store' });
  if (res.status === 404) {
    return { state: emptyState(), sha: null };
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  const decoded = Buffer.from(json.content, 'base64').toString('utf8');
  return { state: JSON.parse(decoded), sha: json.sha };
}

async function writeState(nextState, sha, message) {
  const body = {
    message: message || 'Update log kelas state',
    content: Buffer.from(JSON.stringify(nextState, null, 2), 'utf8').toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const res = await fetch(apiUrl(), {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.status === 409) {
    const err = new Error('conflict');
    err.code = 'CONFLICT';
    throw err;
  }
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${errBody}`);
  }
  return res.json();
}

// Read-modify-write with retry on concurrent-write conflicts (two teachers
// submitting at nearly the same moment both racing the same state.json).
async function mutate(mutatorFn, message) {
  const maxAttempts = 6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { state, sha } = await readState();
    const next = mutatorFn(state);
    try {
      await writeState(next, sha, message);
      return next;
    } catch (e) {
      if (e.code === 'CONFLICT' && attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
        continue;
      }
      throw e;
    }
  }
}

module.exports = { readState, writeState, mutate };
