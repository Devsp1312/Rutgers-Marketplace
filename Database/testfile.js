// Purpose: Test file for database functions
// this file is used to test the database functions and to show a basic usage of the functions

const db = require('./db_funcs');

db.connectToDB().then(() => {
  db.addUser('John Doe', ['Great Seller', 'Fast Shipping'], ['1', '2', '3']);
});