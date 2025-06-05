process.env.AUTH_STRATEGY = 'basic';
process.env.HTPASSWD_FILE = './.htpasswd';

const request = require('supertest');
const app = require('../../src/app');

const username = 'user@example.com';
const password = 'test123';
const base64 = Buffer.from(`${username}:${password}`).toString('base64');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('test');
    expect(res.statusCode).toBe(401);
  });

  test('authenticated request creates a fragment with text/plain', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', `Basic ${base64}`)
      .set('Content-Type', 'text/plain')
      .send('hello world');

    console.log('✅ Authenticated POST Response:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('reject unsupported content types', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', `Basic ${base64}`)
      .set('Content-Type', 'application/xml')
      .send('<note>hello</note>');

    expect(res.statusCode).toBe(415);
  });
});