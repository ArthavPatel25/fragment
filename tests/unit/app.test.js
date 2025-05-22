// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('App 404 handler', () => {
  test('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toEqual({
      message: 'not found',
      code: 404,
    });
  });
});
