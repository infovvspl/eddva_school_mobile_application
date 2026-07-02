import axios from 'axios';

const BASE = 'https://api.eddva.in/api/v1';
const unwrap = b => (b?.data !== undefined && b?.success !== undefined ? b.data : b);

async function main() {
  let r = await axios.post(`${BASE}/auth/otp/send`, { phoneNumber: '+919876543210' });
  r = await axios.post(`${BASE}/auth/otp/verify`, {
    phoneNumber: '+919876543210',
    otp: '123456',
  });
  const token = unwrap(r.data)?.accessToken;
  const api = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` } });

  const courses = unwrap((await api.get('/students/my-courses')).data);
  const batches = Array.isArray(courses)
    ? courses
    : courses?.batches || courses?.courses || courses?.enrolledBatches || [];
  console.log('courses raw keys', Object.keys(courses || {}));
  console.log('first batch', JSON.stringify(batches[0], null, 2));

  for (const batch of batches.slice(0, 3)) {
    const batchId = batch.batchId || batch.id || batch.batch?.id;
    const course = unwrap((await api.get(`/students/my-courses/${batchId}`)).data);
    for (const subj of course.curriculum || []) {
      for (const ch of subj.chapters || []) {
        for (const t of ch.topics || []) {
          const count = t.lectureCount ?? t.lectures?.total ?? 0;
          if (count <= 0) continue;
          try {
            const td = unwrap(
              (await api.get(`/students/my-courses/${batchId}/topics/${t.id}`)).data,
            );
            for (const lec of td.lectures || []) {
              const stream = unwrap(
                (await api.get(`/live-class/${lec.id}/stream-status`)).data,
              );
              const session = unwrap((await api.get(`/live-class/${lec.id}/session`)).data);
              console.log('\n===', lec.title, lec.id, 'type=', lec.type);
              console.log('stream:', JSON.stringify(stream, null, 2));
              console.log('session:', JSON.stringify(session, null, 2));
              try {
                const tok = unwrap(
                  (
                    await api.post('/live-class/token', {
                      lectureId: lec.id,
                      role: 'audience',
                    })
                  ).data,
                );
                console.log('token:', JSON.stringify(tok, null, 2));
              } catch (e) {
                console.log('token err', e.response?.status, JSON.stringify(e.response?.data));
              }
            }
          } catch {
            /* skip topic */
          }
        }
      }
    }
  }
}

main().catch(e => console.error(e.response?.data || e.message));
