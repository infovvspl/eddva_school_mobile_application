import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const LID = 'd5be8017-dbff-4336-8f0d-f3fcaafddaa9';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  await axios.post(`${BASE}/auth/otp/send`, { phoneNumber: '+919876543210' });
  const login = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const token = unwrap(login.data)?.accessToken;
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

  const tok = unwrap(
    (await api.post('/live-class/token', { lectureId: LID, role: 'audience' })).data,
  );
  console.log('token:', JSON.stringify(tok, null, 2));
}

main().catch(e => console.error(e.response?.data || e.message));
