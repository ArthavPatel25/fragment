// tests/unit/get-info.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';

  let fragmentId;

  // Create a fragment first to have an ID to test with
  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .type('text/plain')
      .send('Hello metadata test');

    expect(res.statusCode).toBe(201);
    fragmentId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}/info`).expect(401));

  test('authenticated user can get fragment metadata by id', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    // Check metadata keys exist and types
    const meta = res.body.fragment;
    expect(meta).toHaveProperty('id', fragmentId);
    expect(meta).toHaveProperty('ownerId');
    expect(meta).toHaveProperty('type', 'text/plain');
    expect(meta).toHaveProperty('size');
    expect(meta).toHaveProperty('created');
    expect(meta).toHaveProperty('updated');
  });

  test('request for nonexistent fragment metadata returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent-id/info')
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
