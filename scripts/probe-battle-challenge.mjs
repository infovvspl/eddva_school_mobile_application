import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  await axios.post(`${BASE}/auth/otp/send`, { phoneNumber: '+919876543210' }).catch(() => {});
  const login = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const api = axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${unwrap(login.data).accessToken}` },
  });
  const target = '5532d95d-5d1a-4f4b-ae18-7cc978db026f';
  const created = unwrap((await api.post('/battles/create', { mode: 'challenge_friend' })).data);
  const id = created.battleId;
  const tries = [
    ['POST', `/battles/${id}/challenge`, { studentId: target }],
    ['POST', `/battles/${id}/invite`, { studentId: target }],
    ['POST', `/battles/challenge`, { battleId: id, studentId: target }],
    ['POST', `/battles/challenge`, { roomCode: created.roomCode, studentId: target }],
    ['GET', '/battles/online'],
    ['GET', '/battles/live'],
  ];
  for (const [method, path, body] of tries) {
    try {
      const res =
        method === 'POST' ? await api.post(path, body ?? {}) : await api.get(path);
      console.log('OK', method, path, JSON.stringify(unwrap(res.data)).slice(0, 500));
    } catch (e) {
      console.log('ERR', method, path, e.response?.status, e.response?.data?.message);
    }
  }
  await api.delete(`/battles/${id}`).catch(() => {});
}

main().catch(console.error);
