const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  
  // Unauthenticated request should return 401
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).post('/v1/fragments').send('fragment');
    expect(res.statusCode).toBe(401);
  });

  // Invalid credentials return 401
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'wrongpassword')
      .send('fragment');
    expect(res.statusCode).toBe(401);
  });

  // Valid credentials with unsupported content-type returns 415
  test('return 415 if content-type is not supported', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') 
      .set('content-type', 'application/xml') 
      .send('fragment');
    expect(res.statusCode).toBe(415);
    expect(res.body.error).toBe('Unsupported content type');
  });

  test('creates fragment successfully for supported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') 
      .set('Content-Type', 'text/plain') 
      .send('This is a test fragment');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment.type).toBe('text/plain');
  });

  // Valid credentials and supported content-type returns 201 with fragment data
  test('authenticated users can create a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') 
      .set('content-type', 'text/plain') 
      .send('this is a test fragment'); 

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.id).toBeDefined();
    expect(res.body.fragment.ownerId).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('returns 415 if Content-Type header is missing or invalid', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(415);
    expect(res.body.error).toBe('Unsupported or missing Content-Type header');
  });

  // Body is not a Buffer (simulate bad request)
  test('returns 400 if request body is not a Buffer', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(); 

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid or missing request body');
  });
});
