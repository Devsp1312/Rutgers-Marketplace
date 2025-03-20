// Purpose: Test file for database functions
// this file is used to test the database functions and to show a basic usage of the functions

const db = require('./db_funcs');

db.connectToDB().then(() => {
    // need to do a callback function to ensure that the database is connected before running the functions below
    // you can also use the return value of connectToDB() to check if the database is connected before trying to use other functions.
  db.addUser('test1', ['Great Seller', 'Fast Shipping'], ['1', '2', '3']);
});