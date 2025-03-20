### Detailed Function Descriptions: Inputs & Outputs

1. **connectToDB**
   - **Inputs**: 
     - None directly (uses environment variables for MongoDB connection).
   - **Outputs**:
     - **Promise**: Resolves with `true` if connected successfully, or rejects with an error message if the connection fails.

2. **addUser(name)**
   - **Inputs**:
     - `name` (String): The name of the new user being added.
   - **Outputs**:
     - **String**: The unique ID (`_id`) of the newly created user document in the database.
     - **Console Log**: Logs `User: {name} added!` if the user is added successfully.
   
3. **getUser(id)**
   - **Inputs**:
     - `id` (String): The unique ID of the user to retrieve.
   - **Outputs**:
     - **User Document**: The full user document with the given ID from the database, or `null` if no user is found.

4. **addListing(title, description, price, seller_id, images)**
   - **Inputs**:
     - `title` (String): The title of the listing.
     - `description` (String): The description of the listing.
     - `price` (Number): The price of the listing.
     - `seller_id` (String): The unique ID of the seller (user ID).
     - `images` (Array of Strings): An array of URLs for images associated with the listing.
   - **Outputs**:
     - **String**: The unique ID (`_id`) of the newly created listing document in the database.
     - **Console Log**: Logs `Listing: {title} added!` if the listing is added successfully.
   
5. **getListing(id)**
   - **Inputs**:
     - `id` (String): The unique ID of the listing to retrieve.
   - **Outputs**:
     - **Listing Document**: The full listing document with the given ID from the database, or `null` if no listing is found.

6. **addReview(user_id, review)**
   - **Inputs**:
     - `user_id` (String): The unique ID of the user to whom the review will be added.
     - `review` (String): The content of the review to add to the user's profile.
   - **Outputs**:
     - **Console Log**: Logs `Review added to user: {user_id}` if the review is added successfully.

7. **changeListingPrice(listing_id, newPrice)**
   - **Inputs**:
     - `listing_id` (String): The unique ID of the listing to update.
     - `newPrice` (Number): The new price for the listing.
   - **Outputs**:
     - **Console Log**: Logs `Price changed for listing: {listing_id}` if the price is updated successfully.

8. **changeListingDescription(listing_id, newDescription)**
   - **Inputs**:
     - `listing_id` (String): The unique ID of the listing to update.
     - `newDescription` (String): The new description for the listing.
   - **Outputs**:
     - **Console Log**: Logs `Description changed for listing: {listing_id}` if the description is updated successfully.

9. **changeListingTitle(listing_id, newTitle)**
   - **Inputs**:
     - `listing_id` (String): The unique ID of the listing to update.
     - `newTitle` (String): The new title for the listing.
   - **Outputs**:
     - **Console Log**: Logs `Title changed for listing: {listing_id}` if the title is updated successfully.

10. **changeListingImages(listing_id, newImages)**
    - **Inputs**:
      - `listing_id` (String): The unique ID of the listing to update.
      - `newImages` (Array of Strings): An array of new image URLs for the listing.
    - **Outputs**:
      - **Console Log**: Logs `Images changed for listing: {listing_id}` if the images are updated successfully.

### Usage
The function `connectToDB` needs to called and resolved before calling other functions.