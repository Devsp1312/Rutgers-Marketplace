// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  connectToDB,
  addUser,
  checkUser,
  getUser,
  addListing,
  getAllListings,
  getListingsByUser,
  addReport, 
  getAllReports,
  getListing,
  getUserWishlist,
  deleteListing,
  User // Add User model import
} from './Database/db_funcs.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
app.post('/api/listings', upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, seller_id } = req.body;
    
    if (!seller_id) {
      return res.status(400).json({ message: 'Missing seller_id' });
    }
    if (!title || !description || price == null) {
      return res.status(400).json({ message: 'Missing listing fields' });
    }

    // Process uploaded files
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Store relative path to access via /uploads/filename
        imageUrls.push(`/uploads/${file.filename}`);
      });
    }

    // Creates the listing and also appends it to the user's Listings array
    const listingId = await addListing(
      title,
      description,
      Number(price),
      seller_id,
      imageUrls
    );
    
    return res.status(200).json({id: listingId});
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

// Add to wishlist endpoint
app.post('/api/users/:userId/wishlist', async (req, res) => {
  try {
    const { userId } = req.params;
    const { listingId } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ message: 'Missing listingId in request body' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item is already in wishlist
    if (user.Wishlist.includes(listingId)) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Add to wishlist
    user.Wishlist.push(listingId);
    await user.save();

    res.status(200).json({ message: 'Added to wishlist successfully' });
  } catch (err) {
    console.error('POST /api/users/:userId/wishlist failed:', err);
    res.status(500).json({ message: 'Could not add to wishlist' });
  }
});

//import { getListingsByUser } from './Database/db_funcs.js';

// GET all listings for one user
app.get('/api/users/:userId/listings', async (req, res) => {
  try {
    const listings = await getListingsByUser(req.params.userId);
    return res.json(listings);
  } catch(err) {
    console.error('GET /api/users/:userId/listings failed', err);
    return res.status(500).json({ message: 'Could not fetch user listings' });
  }
});

// app.get('/api/listings/:id', async (req, res) => {
//   try {
//     const listing = await getListing(req.params.id);
//     if (!listing) return res.status(404).json({ message: "Not found" });
//     res.json(listing);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

app.post('/api/reports', async (req, res) => {
  const { listingId, reporterId, reason, details } = req.body;
  if (!listingId || !reporterId || !reason) {
    return res.status(400).json({ message: 'Missing report fields' });
  }
  try {
    const id = await addReport(listingId, reporterId, reason, details);
    res.json({ id });
  } catch (err) {
    console.error('/api/reports error', err);
    res.status(500).json({ message: 'Could not save report' });
  }
});

// (Optional) Fetch all reports for admin dashboard
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await getAllReports();
    res.json(reports);
  } catch (err) {
    console.error('GET /api/reports failed', err);
    res.status(500).json({ message: 'Could not fetch reports' });
  }
});

app.get('/api/users/:userId/wishlist', async (req, res) => {
  try {
    const items = await getUserWishlist(req.params.userId);
    res.json(items);
  } catch (err) {
    console.error('GET /api/users/:userId/wishlist failed:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/debug/listing-model', async (req, res) => {
  try {
    // Get a sample listing
    const sampleListing = await Listing.findOne().lean();
    
    // Check the schema fields
    console.log('Listing schema paths:', Object.keys(Listing.schema.paths));
    
    // Check actual document fields
    console.log('Sample listing document:', sampleListing);
    
    res.json({
      schema: Object.keys(Listing.schema.paths),
      sample: sampleListing
    });
  } catch (err) {
    console.error('Debug failed:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await getListing(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    console.error('GET /api/listings/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    console.log(' Verified Google Sign-In for:', email);
    res.status(200).json({ email, name, googleId });
  } catch (err) {
    console.error(' Google login failed:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});


const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}

export default app;
