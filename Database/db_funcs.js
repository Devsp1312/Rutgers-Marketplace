import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DB_URI = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@ru-marketplace.2zzoe.mongodb.net/marketplace?retryWrites=true&w=majority&appName=ru-marketplace`;

// Define schemas
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
    Images: {
        type: [String],
        required: true
    }
}, {timestamps: true});

const UserSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    IsAdmin: {
        type: Boolean,
        required: false,
        default: false
    },
    Reviews: {
        type: [String],
        required: false
    },
    Listings: {
        type: [String],
        required: false
    },
    Wishlist: { 
        type: [String], 
        required: false,
        default: [] 
    }
}, {timestamps: true});

const ReportSchema = new Schema({
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    details: { type: String }
}, { timestamps: true });

// Create and export models
export const Report = mongoose.model('Report', ReportSchema);
export const Listing = mongoose.model('Listing', ListingSchema);
export const User = mongoose.model('User', UserSchema);

export const connectToDB = async () => {
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

export async function addReport(listingId, reporterId, reason, details = '') {
  const rpt = new Report({ listingId, reporterId, reason, details });
  const saved = await rpt.save();
  console.log(`New report ${saved._id} for listing ${listingId}`);
  return saved._id;
}

export async function getAllReports() {
  return Report
    .find()
    .populate('listingId', 'Title')    // bring back the title
    .populate('reporterId', 'Name Email');
}

export const addUser = async (name, email, reviews = [], listings = []) => {
    const newUser = new User({
      Name: name,
      Email: email,
      Reviews: reviews,
      Listings: listings
    });
  
    try {
      const savedUser = await newUser.save();  // Wait for the user to be saved
      console.log(`User: ${name} added!`);
      return savedUser._id;  // Return the ID of the saved user
    } catch (err) {
      console.error('Error adding user:', err);
    }
}

export const checkUser = async (email) => {
    return User.exists({ Email: email });
}

export const getUser = async (email) => {
    return await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  };
  

export async function addListing(title, description, price, seller_id, images) {
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

export async function getListing(id) {
    // Find listing by ID and populate seller info from User collection
    const listing = await Listing.findById(id).lean();
    if (!listing) return null;
    
    // Get seller info
    const seller = await User.findById(listing.Seller_id).lean();
    if (seller) {
        listing.sellerEmail = seller.Email;
    }
    
    return listing;
}

async function addReview(user_id, review) {
    const user = await User.findById(user_id);
    user.Reviews.push(review);
    await user.save();
    console.log(`Review added to user: ${user_id}`);
    }

export async function addListingToUser(user_id, listing_id) {
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

export async function getAllListings() {
    try {
      return await Listing.find();
    } catch (err) {
      console.error('Error fetching all listings:', err);
      throw err;
    }
  }
  
  export async function getListingsByUser(userId) {
    try {
      return await Listing.find({ Seller_id: userId });
    } catch(err) {
      console.error('Error in getListingsByUser:', err);
      throw err;
    }
  }

export async function getUserWishlist(userId) {
  try {
    const user = await User.findById(userId).lean();
    
    // Debug to see what's in the user document
    console.log('User document:', user);
    console.log('User wishlist data:', user?.Wishlist);
    
    const wishlistIds = user?.Wishlist || [];
    
    if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) {
      console.log('No wishlist items found for user');
      return [];
    }
    
    // Convert string IDs to MongoDB ObjectId if needed
    // Use Mongoose's Types.ObjectId if the IDs are stored as strings
    // import mongoose from 'mongoose';
    // const objectIds = wishlistIds.map(id => mongoose.Types.ObjectId(id));
    
    // Find all listings in the wishlist
    console.log('Looking for listing IDs:', wishlistIds);
    const items = await Listing.find({ _id: { $in: wishlistIds } }).lean();
    
    // Debug the retrieved items
    console.log(`Found ${items.length} items in wishlist`);
    console.log('First item sample:', items[0]);
    
    return items;
  } catch (error) {
    console.error('Error in getUserWishlist:', error);
    throw error;
  }
}

export async function deleteListing(listingId) {
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      console.log(`Listing with ID ${listingId} not found`);
      return false;
    }

    const userId = listing.Seller_id;

    const deleteResult = await Listing.deleteOne({ _id: listingId });

    if (deleteResult.deletedCount !== 1) {
      console.error('Failed to delete listing:', listingId);
      return { success: false, message: 'Failed to delete listing' };
    }

    console.log(`Listing with ID ${listingId} deleted successfully.`);

    const userUpdateResult = await User.updateOne(
      { _id: sellerId },
      { $pull: { Listings: listingId } }
    );

    if (userUpdateResult.modifiedCount !== 1) {
      console.warn(`Warning: Could not update user ${sellerId}'s Listings array or no update was needed.`);
      return { 
        success: true, 
        message: 'Listing deleted, but could not update user\'s listings array', 
        listingDeleted: true,
        userUpdated: false
      };
    } 

    console.log(`Listing ID ${listingId} removed from user ${sellerId}'s Listings array.`);

    return { 
      success: true, 
      message: 'Listing deleted and user updated successfully',
      listingDeleted: true,
      userUpdated: true
    };
  } 
  catch (error) {
    console.error('Error in deleteListing function:', error);
    return { 
      success: false, 
      message: `An error occurred: ${error.message}`,
      error: error
    };
  }
}


