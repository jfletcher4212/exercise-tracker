const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer');

const cors = require('cors')

const mongoose = require('mongoose')
const User = require('./models/user.js');
const Exercise = require('./models/exercise.js');
const isValidDate =  require('./isValidDate.js');

const upload = multer().fields();
mongoose.connect(process.env.MLAB_URI); 
//mongodb://<dbuser>:<dbpassword>@ds141320.mlab.com:41320/exercise-tracker
const db = mongoose.connection;
app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//create new user
app.post('/api/exercise/new-user', (req, res) => {
    var user = new User({ 
      _id: mongoose.Types.ObjectId(),
      username: req.body.username 
    });
    User.findOne({'username': req.body.username}).then( (result) => {
      if(result) {
        res.send("Username already exists, try a different one!");
      } else {
        user.save().then( (result) => {
          res.send("User request receieved! Welcome, user " + req.body.username);
        }).catch( (err) => {
          res.send("An error occurred, please try again");
        });
      }
    }).catch( (err) => {
      res.send("An error occurred, please try again");
    });
});

//add exercise log for given user
app.post('/api/exercise/add', (req, res) => {
  
  var exercise = new Exercise({
    _id: mongoose.Types.ObjectId(),
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  });
  User.findOne({'username': req.body.userId}).then( (result) => {
    if(result) { 
      exercise.save().then( (result) => {
        res.send("Exercise added for user " + req.body.userId);
      }).catch( (err) => {
        console.log(err);
        res.send("An error occurred.");
      });
    }
    else { 
      res.send("User not found");
    }
  }).catch( (err) => {
    console.log(err);
    res.send("An error occurred, please try again");
  });
});

//retrieve entries for a user from the DB
app.get('/api/exercise/log', (req, res) => {
  var options = {};
  if(req.query.limit && parseInt(req.query.limit)){
    options = {limit: parseInt(req.query.limit)};
  }
  var queryParams = {
    'userId' : req.query.userId
  };
  if(req.query.from && req.query.to){
    if(isValidDate(req.query.from) && isValidDate(req.query.to)){
      queryParams.date = {$gt: req.query.from, $lt: req.query.to}; 
    }
    else{
      console.log("Invalid dates supplied, will ignore.");
    }
  }
  else if(req.query.from){
    queryParams.date = {$gt: req.query.from};
    if(isValidDate(req.query.from)){
      queryParams.date = {$gt: req.query.from}; 
    }
    else{
      console.log("Invalid date supplied, will ignore.");
    }
  }
  else if(req.query.to){
    queryParams.date = {$lt: req.query.to};
    if(isValidDate(req.query.to)){
      queryParams.date = {$lt: req.query.to}; 
    }
    else{
      console.log("Invalid date supplied, will ignore.");
    }
  }
  Exercise.find(queryParams, {_id: 0, __v: 0}, options ).then( (result) => {
    if(result.length === 0){
      res.send("No results found.");
    }
    else {
      res.send(result);
    }
  }).catch( (err) => {
    res.send(err);
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
