/**
 * Test de charge k6 – API DataShare (login + liste fichiers).
 * Usage: k6 run k6/load.js
 * Options: BASE_URL, LOAD_TEST_EMAIL, LOAD_TEST_PASSWORD, VUS, DURATION
 * Exemple 20 VU pendant 1 min: VUS=20 DURATION=1m k6 run k6/load.js
 */
import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000/api/v1'
const VUS = parseInt(__ENV.VUS || '10', 10)
const DURATION = __ENV.DURATION || '30s'

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
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

  sleep(0.2 + Math.random() * 0.5)
}
