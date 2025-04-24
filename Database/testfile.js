// Purpose: Test file for database functions
// this file is used to test the database functions and to show a basic usage of the functions

import {connectToDB, getUser}
 from './db_funcs.js';

connectToDB().then(() => {
    // need to do a callback function to ensure that the database is connected before running the functions below
    // you can also use the return value of connectToDB() to check if the database is connected before trying to use other functions.
  getUser("j15t3r.t99@gmail.com").then((user) => {
    console.log(user);
  });
});