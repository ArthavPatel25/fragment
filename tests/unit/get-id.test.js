// tests/unit/get-id.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';

  let fragmentId;

  // Create a fragment first to have an ID to test with
  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .type('text/plain')
      .send('Hello test fragment');

    expect(res.statusCode).toBe(201);
    fragmentId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}`).expect(401));

  test('authenticated user can get fragment data by id', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toBe('Hello test fragment');
  });

  test('request for nonexistent fragment returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent-id')
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
