import fs from 'fs';

const BASE_URL = 'https://dev-api.eddva.in/api/v1';

async function testApis() {
  console.log('Logging in to get token...');
  let token = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/school/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pratapdas@gmail.com', password: 'Pratap@2003' })
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      token = loginData.token;
      console.log('Token acquired.');
    } else {
      console.error('Failed to get token:', loginData);
      return;
    }
  } catch (e) {
    console.error('Login error:', e);
    return;
  }

  const endpoints = [
    '/school/students/dashboard',
    '/school/timetables/student/me',
    '/school/students/profile/me',
    '/school/attendance',
    '/school/reports/my-analytics',
    '/school/career/explore',
    '/school/career/quiz/status',
    '/school/assignments',
    '/school/assessments',
    '/school/classes/recordings',
    '/school/materials',
    '/school/doubts',
    '/school/calendar/events',
    '/school/notices/platform',
    '/school/notifications',
    '/school/gamification/quiz-rush/leaderboard',
    '/school/study-plans/today',
    '/school/study-plans/backlogs',
    '/school/study-plans/roadmap'
  ];

  const results = [];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.text();
      results.push({ endpoint: ep, status: res.status, data: data.substring(0, 100) });
      console.log(`[${res.status}] ${ep}`);
    } catch (e) {
      results.push({ endpoint: ep, status: 'Error', data: e.message });
      console.log(`[ERROR] ${ep}`);
    }
  }

  fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
  console.log('Results written to test_results.json');
}

testApis();
