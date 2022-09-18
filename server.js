require('dotenv').config();
const express = require("express");
const path = require("path");
const moment = require("moment");
const app = express();

var passport = require('passport');
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');

var GITHUB_CLIENT_ID = "e2b5d69b73001a9c0606";
var GITHUB_CLIENT_SECRET = "d522e0361838f5e5a7c94ee901a07ccb5a546c70";

let LoggedIn = false;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/index_loggedin.html"
},
function(accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function () {
    
    // To keep the example simple, the user's GitHub profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the GitHub account with a user record in your database,
    // and return that user instead.
    LoggedIn = true;
    console.log(LoggedIn);
    return done(null, profile);
  });
}
));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    console.log('test this will never run')
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    LoggedIn = true
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.


/*
complete functionalities:
  Submit
  Done 
  NotDone
  AddQuest
  DeleteQuest
*/
const middleware_post = (req, res, next) => {
  let dataString = "";

  req.on("data", function (data) {
    dataString += data;
  });

  req.on("end", function () {
    console.log(dataString);
    req.json = JSON.stringify(dataString);
    // advance to next middleware or route
    next();
  });
};

app.use(middleware_post);

app.post("/Done", (req, res) => {
  const Q = JSON.parse(req.json);
  const Q1 = JSON.parse(Q);
  const Q_name = Q1.Body;
  UpdateDone(Q_name, DB, Collection).then((result) => {
    res.end("Updata sucess!");
  });
});

async function UpdateDone(Q_name, DB, Collection) {
  try {
    console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);
    const Quest = await quests.findOneAndUpdate(
      { Quest: Q_name },
      { $set: { Done: true } }
    );
    return Quest;
  } catch {
    console.log("err happened");
  }
}

app.post("/NotDone", (req, res) => {
  const Q = JSON.parse(req.json);
  const Q1 = JSON.parse(Q);
  const Q_name = Q1.Body;
  UpdateNotDone(Q_name, DB, Collection).then((result) => {
    res.end("Updata sucess!");
  });
});

async function UpdateNotDone(Q_name, DB, Collection) {
  try {
    console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);
    const Quest = await quests.findOneAndUpdate(
      { Quest: Q_name },
      { $set: { Done: false } }
    );
    return Quest;
  } catch {
    console.log("err happened");
  }
}

app.get("/GetQuest/:Categ", (req, res) => {
  const Categ = req.params.Categ;
  console.log(`Trying to fetch Category: ${Categ}`);
  GetRandomeQuest(Categ, DB, Collection)
    .then((results) => {
      results.forEach((result) => {
        res.end(JSON.stringify(result));
      });
      console.log(`Found!`);
    })
    .catch((err) => {
      console.log(err);
    });
});

async function GetRandomeQuest(Categ, DB, Collection) {
  try {
    console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);
    const query = [{ $match: { Category: Categ } }, { $sample: { size: 1 } }];
    const Quest = await quests.aggregate(query);
    return Quest;
  } catch {
    console.log("err happened");
  }
}

app.post("/AddQuest", (req, res) => {
  const Q = JSON.parse(req.json);
  const Q1 = JSON.parse(Q);
  const json = { Quest: Q1.Quest, Category: Q1.Category };
  Addone(DB, Collection, json);
});

async function Addone(DB, Collection, item) {
  const Quest = item.Quest;
  const Category = item.Category;
  const F = false;
  try {
    console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);

    const doc = { Quest: Quest, Category: Category, Done: F };
    const result = await quests.insertOne(doc);
    console.log(`Doc with new ID: ${result.insertedId} added`);
  } catch {
    console.log("error occure while adding a document to database");
  }
}

app.post("/DeleteQuest", (req, res) => {
  const Q = JSON.parse(req.json);
  const Q1 = JSON.parse(Q);
  const json = { Quest: Q1.Quest, Category: Q1.Category };
  DeleteOne(DB, Collection, json);
});

async function DeleteOne(DB, Collection, item) {
  const Quest = item.Quest;
  try {
    console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);

    const doc = { Quest: Quest };
    const result = await quests.deleteOne(doc);
    if (result.deletedCount === 1) {
      console.log("Successfully deleted one document.");
    } else {
      console.log("No documents matched the query. Deleted 0 documents.");
    }
  } catch {
    console.log("error occure while Deleting a document to database");
  }
}

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DBname}:${process.env.DBpass}@amazon0.ul5uj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
});

const DB = "CS4445";
const Collection = "HW3";
let db_lst = [];

const logger = (req, res, next) => {
  console.log(
    `getting ID by: ${req.params.id}, time: ${moment.defaultFormat()}`
  );
  next();
};

//app.use(logger);

app.get("/GetAll", async function GetAllSend(req, res) {
  console.log("Get Database!");
  console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);
    //const query = { Category: { $ne: "a" } };
    quests.find({}).toArray(function (err, result) {
      if (err) {
          console.log(err)
      } else {
          res.end(JSON.stringify(result));
      }
    });
});

app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => `listening on Port: ${PORT}`);
