import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Google Sign-In API', () => {
  it('should return 401 for an invalid token', async () => {
    const res = await request(app).post('/api/google-login').send({
      token: 'invalid_or_fake_token'
    });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
    console.log('\n→ Response:', res.body);
  });
});
