import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';


describe('Marketplace API Tests', () => {
 let userId = null;
 let listingId = null;


 // 1. Create a user first (so we can use their real MongoDB ObjectId)
 before(async () => {
   const res = await request(app)
     .post('/api/user')
     .send({
       name: 'Test User',
       email: 'testuser@scarletmail.rutgers.edu'
     });


   expect(res.status).to.equal(200);
   expect(res.body).to.have.property('id');
   userId = res.body.id;
 });

 it('should create a new listing without images', async () => {
    const res = await request(app)
      .post('/api/listings')
      .field('title', 'Test Item Title')
      .field('description', 'This is a test listing for Report 3')
      .field('price', '25.50')
      .field('seller_id', userId);
 
 
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('id');
    listingId = res.body.id;
 
 
    // Output for Report 3
    console.log('\n--- HTTP Request: POST /api/listings ---');
    console.log({
      method: 'POST',
      url: '/api/listings',
      body: {
        title: 'Test Item Title',
        description: 'This is a test listing for Report 3',
        price: 25.50,
        seller_id: userId
      }
    });
 
 
    console.log('\n--- HTTP Response ---');
    console.log(res.body);
  });
  
 });


 

 