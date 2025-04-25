// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  connectToDB,
  addUser,
  checkUser
} from './Database/db_funcs.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1) Connect to MongoDB
connectToDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// 2) User login/signup endpoint
app.post('/api/user', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Missing name or email' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  console.log('→ Login attempt for:', normalizedEmail);

  // 2a) Rutgers-only check
  if (!normalizedEmail.endsWith('@scarletmail.rutgers.edu')) {
    return res
      .status(403)
      .json({ message: 'Authentication failed: not a Rutgers account' });
  }

  try {
    // 2b) Does user already exist?
    const exists = await checkUser(normalizedEmail);
    if (exists) {
      console.log('✅ Existing user:', normalizedEmail);
      return res.status(200).json({ id: exists._id || exists });
    }

    // 2c) Create new user
    const newId = await addUser(name, normalizedEmail);
    console.log('✅ New user created:', newId);
    return res.status(200).json({ id: newId });
  } catch (err) {
    console.error('❌ /api/user error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
