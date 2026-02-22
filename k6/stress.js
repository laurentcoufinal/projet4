/**
 * Test de stress k6 – monée en charge progressive.
 * Usage: k6 run k6/stress.js
 * Augmente le nombre de VUs pour voir à partir de quand l’API se dégrade.
 */
import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000/api/v1'

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '30s', target: 15 },
    { duration: '30s', target: 30 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<5000'],
  },
}

export default function () {
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    email: __ENV.LOAD_TEST_EMAIL || 'lolo@gmail.com',
    password: __ENV.LOAD_TEST_PASSWORD || 'laurent31',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!check(loginRes, { 'login ok': (r) => r.status === 200 })) {
    sleep(1)
    return
  }

  const token = JSON.parse(loginRes.body).token
  const listRes = http.get(`${BASE_URL}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  check(listRes, {
    'list files ok': (r) => r.status === 200,
  })

  sleep(0.5 + Math.random() * 1)
}
