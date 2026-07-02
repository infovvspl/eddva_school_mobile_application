import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  await axios.post(`${BASE}/auth/otp/send`, { phoneNumber: '+919876543210' }).catch(() => {});
  const login = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const token = unwrap(login.data)?.accessToken;
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

  const endpoints = [
    ['GET', '/battles/daily'],
    ['GET', '/battles/my-elo'],
    ['GET', '/battles/my-history'],
    ['GET', '/battles/leaderboard'],
    ['POST', '/battles/create', {}],
    ['GET', '/battles/matchmaking/online'],
    ['GET', '/battles/online'],
    ['GET', '/battles/queue'],
  ];

  for (const [method, path, body] of endpoints) {
    try {
      const res =
        method === 'POST'
          ? await api.post(path, body ?? {})
          : await api.get(path);
      console.log(`\n✓ ${method} ${path}`);
      console.log(JSON.stringify(unwrap(res.data), null, 2).slice(0, 1200));
    } catch (e) {
      console.log(`\n✗ ${method} ${path}`, e.response?.status, e.response?.data?.message || e.message);
    }
  }

  try {
    const created = unwrap((await api.post('/battles/create', {})).data);
    console.log('\n=== create full ===', JSON.stringify(created, null, 2));
    const id = created?.id ?? created?.battleId;
    if (id) {
      const room = unwrap((await api.get(`/battles/${id}`)).data);
      console.log('\n=== getRoom ===', JSON.stringify(room, null, 2));
    }
  } catch (e) {
    console.log('create flow err', e.response?.data);
  }
}

main().catch(console.error);
