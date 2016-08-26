// Simple User API App using ExpressJS and MongoDB

"use strict";

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

var app = express();

//Configure express to use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure And create Mongodb connection with mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/user');

// create schema for our model
var userSchema = mongoose.Schema({
  name         : String,
  email        : String,
  password     : {type: String, select: false}
});

// use schema to create a mongoose model
var User = mongoose.model('User', userSchema);

// Create index route using express
app.get('/', (req, res) => {
  // fetch all users from database
  User.find({}, (err, user) => {
    // if error occurs let the user know
    if (err) {
      res.json({
        "err" : true,
        "msg": "An error occured",
        data: []
      });
    }

    // if query returns null
    if (!user) {
      res.json({
        err: false,
        "msg": "No user at the moment",
        data: []
      });
    }

    if (user) {
      res.json({
        err: false,
        "msg": user.length + " users found",
        data: user
      });
    }
  })
});

// Dynamic route for getting user with id
app.get('/:id', (req, res) => {
  // check if id was set in url Parameter
  if (!req.params.id || isNaN(req.params.id)) {
    res.json({
      err: true,
      "msg": "User id missing from parameter Or Parameter is not a number",
      data: []
    })
  }

  // get specific user with id
  User.findOne({'_id': req.params.id}, (err, user) => {
    if (err) {
      // if error occurs let the user know
      res.json({
        "err" : true,
        "msg": "An error occured",
        data: []
      });
    }
    if (!user) {
      // if query returns null
      res.json({
        err: false,
        "msg": "No User With That id found",
        data: []
      });
    }

    if (user) {
      res.json({
        err: false,
        "msg": "User with id" + req.params.id + " found",
        data: user
      });
    }
  })
});

// create post route for adding user
app.post('/', (req, res) => {
  var nUser = new User();
  var {name, email, password} = req.body;

  // check if any value is missing from request
  if (!name || !email || !password) {
    res.json({
      err: true,
      "msg": "User Account Parameter(s) Missing",
      data: []
    })
  }

  User.findOne({'email': email}, (err, user) => {
    if (err) {
      res.json({
        err: true,
        "msg": "database error occurred",
        data: []
      })
    }

    if (!user) {
      nUser.name = name;
      nUser.email = email;
      nUser.password = password;

      nUser.save((err) => {
        if (err) {
          res.json({
            err: true,
            "msg": "Database error occurred",
            data: []
          });
        } else {
          // if no error occurred
          res.json({
            err: false,
            "msg": "User account created",
            data: {
              "id": nUser._id
            }
          });
        }
      });
    }

    if (user) {
      res.json({
        err: true,
        "msg": "User account already exists",
        data: []
      })
    }
  });
});

app.all('*', function (req, res) {
  res.json({
    err: true,
    "msg": "Wrong Endpoint",
    data: []
  });
});



app.listen(3000, () => {
  console.log("App started on port 3000");
});
