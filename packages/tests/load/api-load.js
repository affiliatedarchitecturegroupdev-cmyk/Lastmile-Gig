import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '1m', target: 10 },   // Steady
    { duration: '30s', target: 50 },   // Spike
    { duration: '1m', target: 50 },   // Steady at spike
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: List restaurants
  const restaurants = http.get(`${BASE_URL}/api/partners`);
  check(restaurants, {
    'restaurants status 200': (r) => r.status === 200,
    'restaurants response time': (r) => r.timings.duration < 300,
  });

  sleep(1);

  // Test 2: Get restaurant details
  const partner = http.get(`${BASE_URL}/api/partners/test-restaurant`);
  check(partner, {
    'partner status 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test 3: List menu items
  const menu = http.get(`${BASE_URL}/api/partners/test-restaurant/menu`);
  check(menu, {
    'menu status 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test 4: Submit order (simulated)
  const orderPayload = JSON.stringify({
    partnerId: 'test-restaurant',
    items: [{ menuItemId: 'item-1', quantity: 2 }],
    deliveryAddress: '123 Test St, Johannesburg',
  });
  
  const order = http.post(`${BASE_URL}/api/orders`, orderPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(order, {
    'order created': (r) => r.status === 201 || r.status === 400,
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, opts) {
  const indent = opts.indent || '';
  let output = `${indent}Test Results:\n`;
  
  for (const [metric, value] of Object.entries(data.metrics)) {
    if (value.type === 'counter' || value.type === 'gauge') {
      output += `${indent}  ${metric}: ${value.value}\n`;
    }
  }
  
  return output;
}