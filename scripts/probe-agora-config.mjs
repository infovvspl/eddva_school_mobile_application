import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  const endpoints = [
    '/config',
    '/settings/public',
    '/tenants/config',
    '/live-class/config',
    '/auth/me',
  ];
  let r = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const token = unwrap(r.data)?.accessToken;
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

  for (const ep of endpoints) {
    try {
      const res = unwrap((await api.get(ep)).data);
      const text = JSON.stringify(res);
      if (/agora|appId|app_id/i.test(text)) {
        console.log(ep, text.slice(0, 500));
      }
    } catch (e) {
      console.log(ep, e.response?.status);
    }
  }

  const me = unwrap((await api.get('/auth/me')).data);
  console.log('me keys', Object.keys(me || {}));
  console.log('me tenant', JSON.stringify(me?.tenant || me?.institute, null, 2)?.slice(0, 800));
}

main().catch(console.error);
