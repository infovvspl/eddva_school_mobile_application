import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  await axios.post(`${BASE}/auth/otp/send`, { phoneNumber: '+919876543210' });
  const login = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const token = unwrap(login.data)?.accessToken;
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

  for (const ep of ['/auth/me', '/students/profile', '/students/dashboard']) {
    try {
      const res = unwrap((await api.get(ep)).data);
      const text = JSON.stringify(res);
      if (/agora|appId|bunny|stream/i.test(text)) {
        console.log(ep, text.slice(0, 2000));
      }
    } catch (e) {
      console.log(ep, e.response?.status);
    }
  }
}

main().catch(console.error);
