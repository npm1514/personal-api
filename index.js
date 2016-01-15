var express = require('express');
var bodyParser =require('body-parser');
var middleware = require('./controllers/middleware.js');
var mainCtrl = require('./controllers/mainCtrl.js');

var app = express();

var users = [
  {
    "name": "Donald Duck",
    "location": "NYC",
    "occupation": ["dipping", "diving", "dodging"],
    "hobbies": [
      {
        "name": "Chilling",
        "type": "current"
      },
      {
        "name": "swimming",
        "type": "past"
      }
    ]
  },
  {
    "name": "Mickey Mouse",
    "location": "Orlando",
    "occupation": ["hosting", "smiling", "dancing"],
    "hobbies": [
      {
        "name": "Hangin with Minnie",
        "type": "current"
      },
      {
        "name": "Billiards",
        "type": "past"
      }
    ]
  }
];

app.use(bodyParser.json());
app.use(middleware.addHeaders);

app.get('/name', function(req, res, next) {
  var names = [];
  users.forEach (function(elem, ind, arr) {
    names.push(users[ind].name);
  });
  res.send(JSON.stringify(names));
});
app.get('/location', function(req, res, next) {
  var locations = [];
  users.forEach (function(elem, ind, arr) {
    locations.push(users[ind].location);
  });
  res.send(JSON.stringify(locations));
});
app.get('/occupation', function(req, res, next) {
  var occupations = [];
  users.forEach (function(elem, ind, arr) {
    occupations.push(users[ind].occupation);
  });
  res.send(JSON.stringify(occupations));
});
app.get('/occupation/latest', function(req, res, next) {
  var occupationsLatest = [];
  users.forEach (function(elem, ind, arr) {
    occupationsLatest.push(users[ind].occupation[users[ind].occupation.length - 1]);
    console.log(occupationsLatest);
  });
  res.send(JSON.stringify(occupationsLatest));
});
app.get('/hobbies', function(req, res, next) {
  var hobbies = [];
  users.forEach (function(elem, ind, arr) {
    hobbies.push(users[ind].hobbies[ind]);
  });
  res.send(JSON.stringify(hobbies));
});
app.get('/hobbies/:type', function(req, res, next) {
  var hobbiesType = [];
  var type = "";
  users.forEach (function(elem, ind, arr) {
    for (var i = 0; i < users[ind].hobbies.length; i++) {
      type = users[ind].hobbies[i].type;
      if (type == req.params.type) {
          hobbiesType.push(users[ind].hobbies[i].name);
          console.log(hobbiesType);
      }
    }
  });
  res.send(JSON.stringify(hobbiesType));
});



app.listen(8989,function(){
  console.log("listening on 8989");
});
