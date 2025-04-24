import express from 'express';
import cors from 'cors';
import {
  connectToDB, addUser, checkUser, getUser
} from './Database/db_funcs.js';

const app = express();
app.use(cors());
app.use(express.json());

await connectToDB();

app.post('/api/user', async (req, res) => {
  const { name, email } = req.body;
  console.log(`Received request to add user: ${name}, ${email}`);
  const exists = await checkUser(email);
  if (exists) {
    console.log(`User exists: ${exists._id}`);
  }
  if (exists==null){
    console.log('User does not exist! Adding user...');
    const id = await addUser(name, email);
    res.json({ id });
  } else {
    console.log('User already exists!');
    // const user = await getUser(email);
    res.json({ id: exists._id });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
