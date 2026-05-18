const BASE_URL = 'http://localhost:5000/api';
let token = '';

async function runTests() {
  console.log('🚀 Starting API Route & Logic Verification...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ [FAIL] ${name} - ${err.message}`);
      failed++;
    }
  };

  await test('Health Check (/api/health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'OK') throw new Error('Health check failed');
  });

  await test('Public Notices (/api/notices/public)', async () => {
    const res = await fetch(`${BASE_URL}/notices/public`);
    const data = await res.json();
    if (!Array.isArray(data.notices)) throw new Error('Expected data.notices to be an array');
  });

  await test('Public Events (/api/events/public)', async () => {
    const res = await fetch(`${BASE_URL}/events/public`);
    const data = await res.json();
    if (!Array.isArray(data.events)) throw new Error('Expected data.events to be an array');
  });

  await test('ANO Login (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ano@lcit.edu.in', password: 'prahar@2026' })
    });
    const data = await res.json();
    if (!data.token) throw new Error(data.message || 'No token received');
    token = data.token;
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  await test('Fetch My Profile (/api/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const data = await res.json();
    if (!data.user || data.user.role !== 'ANO') throw new Error('Profile role mismatch or user object missing');
  });

  await test('Fetch Cadets List (/api/cadets)', async () => {
    const res = await fetch(`${BASE_URL}/cadets`, { headers: authHeaders });
    const data = await res.json();
    if (!Array.isArray(data.cadets)) throw new Error('Expected data.cadets to be an array');
  });

  await test('Fetch Protected Notices (/api/notices)', async () => {
    const res = await fetch(`${BASE_URL}/notices`, { headers: authHeaders });
    const data = await res.json();
    if (!Array.isArray(data.notices)) throw new Error('Expected data.notices to be an array');
  });

  console.log(`\n📊 Verification Complete! Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) {
    console.log('⚠️ Some routes failed. Please review the logs.');
  } else {
    console.log('🎉 All essential routes and logic are functioning correctly.');
  }
}

runTests();
