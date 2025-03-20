require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DB_URI = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@ru-marketplace.2zzoe.mongodb.net/marketplace?retryWrites=true&w=majority&appName=ru-marketplace`;


function connectToDB() {
    return new Promise((resolve, reject) => {
      mongoose.connect(DB_URI);
  
      const db = mongoose.connection;
      db.on('error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
  
      db.once('open', () => {
        console.log('Connected to Database');
        resolve(true);
      });
    });
  }

const ListingSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Seller_id: {
        type: String,
        required: true
    },
    Images: {  // Array of image URLs but this is subjected to change depending on how we decide to store images
        type: [String],
        required: true
    }
}, {timestamps: true});

const UserSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Reviews: {
        type: [String],
        required: false
    },
    Listings: {
        type: [String], // Array of Listing IDs
        required: false
    }
}, {timestamps: true});


const Listing = mongoose.model('Listing', ListingSchema);
const User = mongoose.model('User', UserSchema);

async function addUser(name) {
    const newUser = new User({
      Name: name,
      Reviews: [],
      Listings: []
    });
  
    try {
      const savedUser = await newUser.save();  // Wait for the user to be saved
      console.log(`User: ${name} added!`);
      return savedUser._id;  // Return the ID of the saved user
    } catch (err) {
      console.error('Error adding user:', err);
    }
  }
  

function getUser(id) {
    return User.findById(id);
}

async function addListing(title, description, price, seller_id, images) {
    const newListing = new Listing({
      Title: title,
      Description: description,
      Price: price,
      Seller_id: seller_id,
      Images: images
    });
  
    try {
        const savedListing = await newListing.save();
        console.log(`Listing: ${title} added!`);
        await addListingToUser(seller_id, savedListing._id);
        return savedListing._id;
        } catch (err) {
        console.error('Error adding listing:', err);
    }
  }

function getListing(id) {
    return Listing.findById(id);
}

async function addReview(user_id, review) {
    const user = await User.findById(user_id);
    user.Reviews.push(review);
    await user.save();
    console.log(`Review added to user: ${user_id}`);
    }

async function addListingToUser(user_id, listing_id) {
    const user = await User.findById(user_id);
    user.Listings.push(listing_id);
    await user.save();
    console.log(`Listing added to user: ${user_id}`);
}

async function changeListingPrice(listing_id, newPrice) {
    const listing = await Listing.findById(listing_id);
    listing.Price = newPrice;
    await listing.save();
    console.log(`Price changed for listing: ${listing_id}`);
}

async function changeListingDescription(listing_id, newDescription) {
    const listing = await Listing.findById(listing_id);
    listing.Description = newDescription;
    await listing.save();
    console.log(`Description changed for listing: ${listing_id}`);
}

async function changeListingTitle(listing_id, newTitle) {
    const listing = await Listing.findById(listing_id);
    listing.Title = newTitle;
    await listing.save();
    console.log(`Title changed for listing: ${listing_id}`);
}

async function changeListingImages(listing_id, newImages) {
    const listing = await Listing.findById(listing_id);
    listing.Images = newImages;
    await listing.save();
    console.log(`Images changed for listing: ${listing_id}`);
}

