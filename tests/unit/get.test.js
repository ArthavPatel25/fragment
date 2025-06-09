// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401)); 

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
  // Add a fragment first and then check if it appears in the list
test('returns correct fragment metadata for authenticated user', async () => {
  // Step 1: Create a fragment
  const postRes = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .type('text/plain')
    .send('Hello world');

  expect(postRes.statusCode).toBe(201);

  // Step 2: Get the list of fragments
  const getRes = await request(app)
    .get('/v1/fragments')
    .auth('user1@email.com', 'password1');

  expect(getRes.statusCode).toBe(200);
  expect(getRes.body.status).toBe('ok');
  expect(Array.isArray(getRes.body.fragments)).toBe(true);

  // Step 3: Check that the created fragment is in the list
  expect(getRes.body.fragments.length).toBeGreaterThan(0);
  const fragmentId = postRes.body.fragment.id;
  expect(getRes.body.fragments).toContain(fragmentId);
});

  // TODO: we'll need to add tests to check the contents of the fragments array later
});