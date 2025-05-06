import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Reports API', () => {
  it('should retrieve all reports (admin view)', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');

    console.log('\n--- HTTP Request: GET /api/reports ---');
    console.log('GET /api/reports');
    console.log('\n--- HTTP Response ---');
    console.log(res.body);
  });
});
