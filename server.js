// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  connectToDB,
  addUser,
  checkUser,
  getUser,
  addListing,
  getAllListings
} from './Database/db_funcs.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Connect to MongoDB
connectToDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

//User login/signup endpoint
app.post('/api/user', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Missing name or email' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  console.log('→ Login attempt for:', normalizedEmail);

  //Rutgers-only check
  if (!normalizedEmail.endsWith('@scarletmail.rutgers.edu')) {
    return res
      .status(403)
      .json({ message: 'Authentication failed: not a Rutgers account' });
  }

  try {
    //Does user already exist?
    const exists = await checkUser(normalizedEmail);
    if (exists) {
      console.log('Existing user:', normalizedEmail);
      return res.status(200).json({ id: exists._id || exists });
    }

    //Create new user
    const newId = await addUser(name, normalizedEmail);
    console.log('New user created:', newId);
    return res.status(200).json({ id: newId });
  } catch (err) {
    console.error('/api/user error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



// This is for creating a listing
app.post('/api/listings', async (req, res) => {
  const { title, description, price, images, seller_id } = req.body;
  if (!seller_id) {
    return res.status(400).json({ message: 'Missing seller_id' });
  }
  if (!title || !description || price == null) {
    return res.status(400).json({ message: 'Missing listing fields' });
  }

  try {
    // Creates the listing and also appends it to the user’s Listings array
    const listingId = await addListing(
      title,
      description,
      Number(price),
      seller_id,
      images || []
    );
    return res.status(200).json({ id: listingId });
  } catch (err) {
    console.error('/api/listings error:', err);
    return res.status(500).json({ message: 'Could not create listing' });
  }
});

// Return every listing in the database
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await getAllListings();
    res.json(listings);
  } catch (err) {
    console.error(' GET /api/listings failed:', err);
    res.status(500).json({ message: 'Could not fetch listings' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});