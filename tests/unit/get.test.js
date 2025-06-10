// tests/unit/get.test.js
const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401)); 

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
  
test('returns correct fragment metadata for authenticated user', async () => {
 
  const postRes = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .type('text/plain')
    .send('Hello world');

  expect(postRes.statusCode).toBe(201);

  const getRes = await request(app)
    .get('/v1/fragments')
    .auth('user1@email.com', 'password1');

  expect(getRes.statusCode).toBe(200);
  expect(getRes.body.status).toBe('ok');
  expect(Array.isArray(getRes.body.fragments)).toBe(true);

  expect(getRes.body.fragments.length).toBeGreaterThan(0);
  const fragmentId = postRes.body.fragment.id;
  expect(getRes.body.fragments).toContain(fragmentId);
});

});