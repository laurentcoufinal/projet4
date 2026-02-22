/**
 * Test de fumée (smoke) k6 – vérifie que l'API répond correctement.
 * Usage: k6 run k6/smoke.js
 * Avec backend local: BASE_URL=http://127.0.0.1:8000/api/v1 k6 run k6/smoke.js
 */
import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000/api/v1'

export const options = {
  vus: 2,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
}

export default function () {
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    email: __ENV.LOAD_TEST_EMAIL || 'lolo@gmail.com',
    password: __ENV.LOAD_TEST_PASSWORD || 'laurent31',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })

  const loginOk = check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body && body.token
      } catch {
        return false
      }
    },
  })
  if (!loginOk) {
    sleep(1)
    return
  }

  const token = JSON.parse(loginRes.body).token

  const listRes = http.get(`${BASE_URL}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  check(listRes, {
    'list files status 200': (r) => r.status === 200,
  })

  sleep(0.5)
}
