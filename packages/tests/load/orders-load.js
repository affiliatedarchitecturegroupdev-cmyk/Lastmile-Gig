import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp to 100 VUs
    { duration: '3m', target: 100 }, // Hold
    { duration: '30s', target: 200 }, // Spike
    { duration: '1m', target: 200 }, // Hold spike
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const orderPayload = JSON.stringify({
    partnerId: `partner-${Math.floor(Math.random() * 10)}`,
    customerId: `customer-${Math.floor(Math.random() * 100)}`,
    items: [
      { menuItemId: `item-${Math.floor(Math.random() * 50)}`, quantity: Math.floor(Math.random() * 3) + 1 }
    ],
    deliveryAddress: '123 Test St, Johannesburg',
  });

  const orderRes = http.post(`${BASE_URL}/api/orders`, orderPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(orderRes, {
    'order created': (r) => r.status === 201 || r.status === 400,
    'order response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Get order status
  if (orderRes.status === 201) {
    const orderId = JSON.parse(orderRes.body).id;
    const statusRes = http.get(`${BASE_URL}/api/orders/${orderId}`);
    check(statusRes, {
      'get order status 200': (r) => r.status === 200,
    });
  }

  // Test dispatch
  const dispatchRes = http.post(`${BASE_URL}/api/dispatch/assign`, JSON.stringify({
    orderId: `order-${Math.floor(Math.random() * 1000)}`,
    priority: 'normal',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(dispatchRes, {
    'dispatch response': (r) => r.status === 200 || r.status === 404,
  });

  sleep(Math.random() * 2 + 0.5);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      total_requests: data.metrics.http_reqs.values.count,
      avg_duration: data.metrics.http_req_duration.values.avg,
      p95_duration: data.metrics.http_req_duration.values['p(95)'],
      p99_duration: data.metrics.http_req_duration.values['p(99)'],
      failure_rate: data.metrics.http_req_failed.values.rate,
    }),
  };
}