import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users over 30 seconds
    { duration: '1m', target: 10 },  // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
  },
};

const BASE_URL = 'http://localhost:3000/api';

export function setup() {
  const email = `test${Date.now()}@example.com`; // Unique email
  const password = 'password123';

  // First try to register
  const registerPayload = JSON.stringify({
    full_name: 'Test User',
    email: email,
    phone: '0712345678',
    role: 'customer',
    password: password
  });

  const registerResponse = http.post(`${BASE_URL}/auth/register`, registerPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // If registration fails (user exists), that's ok, proceed to login

  // Login to get token
  const loginPayload = JSON.stringify({
    email: email,
    password: password
  });

  const loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(loginResponse, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginResponse.json().token;
  return { token };
}

export default function (data) {
  const { token } = data;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test getting all products
  const productsResponse = http.get(`${BASE_URL}/products`, { headers });
  check(productsResponse, {
    'get products status is 200': (r) => r.status === 200,
    'get products response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test creating an order (if products exist)
  if (productsResponse.status === 200 && productsResponse.json().length > 0) {
    const product = productsResponse.json()[0];
    const orderPayload = JSON.stringify({
      user_id: 1, // Assuming user id 1
      product_id: product.product_id,
      market_id: 1,
      quantity: 1,
      total_amount: product.price,
      order_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });

    const orderResponse = http.post(`${BASE_URL}/order`, orderPayload, { headers });
    check(orderResponse, {
      'create order status is 201 or 400': (r) => r.status === 201 || r.status === 400, // 400 if no stock or other validation
    });
  }

  sleep(1); // Wait 1 second between iterations
}