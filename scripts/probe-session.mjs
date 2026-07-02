import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const LECTURE_ID = process.argv[2] || 'd5be8017-dbff-4336-8f0d-f3fcaafddaa9';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  await axios.post(`${BASE}/auth/otp/send`, { phoneNumber: '+919876543210' }).catch(() => {});
  const login = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const token = unwrap(login.data)?.accessToken;
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

  for (const ep of [`/live-class/${LECTURE_ID}/session`, `/live-class/${LECTURE_ID}/stream-status`]) {
    try {
      const res = unwrap((await api.get(ep)).data);
      console.log(`\n=== ${ep} ===`);
      console.log(JSON.stringify(res, null, 2));
    } catch (e) {
      console.log(`\n=== ${ep} ERROR ===`, e.response?.status, JSON.stringify(e.response?.data));
    }
  }

  try {
    const lec = unwrap((await api.get(`/content/lectures/${LECTURE_ID}`)).data);
    console.log('\n=== /content/lectures ===');
    console.log(JSON.stringify(lec, null, 2));
  } catch (e) {
    console.log('\n=== lecture ERROR ===', e.response?.status, JSON.stringify(e.response?.data));
  }
}

main().catch(e => console.error(e.response?.data || e.message));
