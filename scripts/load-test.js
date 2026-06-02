// Run with: k6 run scripts/load-test.js
// Install k6 from: https://k6.io/docs/getting-started/installation/
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latencyTrend = new Trend('latency');

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    latency: ['p(99)<2000'],
    http_req_duration: ['p(95)<1000'],
  },
};

const API_BASE = __ENV.API_BASE || 'http://localhost:5000';

export default function () {
  const endpoints = ['/health/live', '/health/ready', '/health/metrics'];
  const url = `${API_BASE}${endpoints[Math.floor(Math.random() * endpoints.length)]}`;

  const start = Date.now();
  const res = http.get(url);
  const duration = Date.now() - start;

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': () => duration < 2000,
  });

  errorRate.add(res.status !== 200);
  latencyTrend.add(duration);

  sleep(1);
}
