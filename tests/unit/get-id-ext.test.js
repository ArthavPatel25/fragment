// tests/unit/get-id-ext.test.js
const request = require('supertest');
const app = require('../../src/app'); // Adjust if needed

describe('GET /v1/fragments/:id.ext without mocking', () => {
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';

  let markdownId, plainTextId;

  beforeAll(async () => {
    // Create Markdown fragment
    const mdRes = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .type('text/markdown')
      .send('# Hello Markdown');
    markdownId = mdRes.body.fragment.id;

    // Create plain text fragment
    const txtRes = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .type('text/plain')
      .send('Hello Plain Text');
    plainTextId = txtRes.body.fragment.id;
  });

  test('converts Markdown to HTML with .html extension', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${markdownId}.html`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<h1>Hello Markdown</h1>');
  });

  test('returns raw text with correct MIME for .txt extension', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${plainTextId}.txt`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toBe('Hello Plain Text');
  });

  test('returns 415 for unsupported conversion (e.g. .pdf)', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${plainTextId}.pdf`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(415);
    expect(res.body.error).toBe('Conversion not supported');
  });

  test('returns 404 for non-existent fragment ID', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist.txt')
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  test('denies unauthenticated request', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${plainTextId}.txt`); // No auth

    expect(res.statusCode).toBe(401);
  });
});
