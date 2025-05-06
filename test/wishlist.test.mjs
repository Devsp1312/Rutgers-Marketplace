import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Add to Wishlist API', () => {
  let userId = null;
  let listingId = null;

  // Step 1: Create a user
  before(async () => {
    const userRes = await request(app)
      .post('/api/user')
      .send({
        name: 'Wishlist User',
        email: 'wishlistuser@scarletmail.rutgers.edu'
      });

    expect(userRes.status).to.equal(200);
    userId = userRes.body.id;
  });

  // Step 2: Create a listing
  before(async () => {
    const listingRes = await request(app)
      .post('/api/listings')
      .field('title', 'Wishlist Item')
      .field('description', 'For testing wishlist')
      .field('price', '20.00')
      .field('seller_id', userId);

    expect(listingRes.status).to.equal(200);
    listingId = listingRes.body.id;
  });

  // Step 3: Add to wishlist
  it('should add the listing to user\'s wishlist', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/wishlist`)
      .send({ listingId });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Added to wishlist successfully');

    console.log('\n--- Add to Wishlist Test ---');
    console.log('→ Request:', { userId, listingId });
    console.log('→ Response:', res.body);
  });
});
