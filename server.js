require('dotenv').config();
const express = require("express");
const path = require("path");
const moment = require("moment");
const app = express();

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
  GetCollection(DB, Collection, res).then((o) => {
    res.send(o);
  });
});
async function GetCollection(DB, Collection) {
  try {
    console.log(`Connecting to ${DB}, Collection: ${Collection}`);
    const database = client.db(DB);
    const quests = database.collection(Collection);
    console.log(`Connection Success!`);
    const query = { Category: { $ne: "a" } };
    const DB_all = await quests.find(query);
    DB_all.forEach((result) => {
      let k = JSON.stringify(result);
      db_lst.push(k);
    });
  } catch {
    console.log("error occure");
  }
}

app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => `listening on Port: ${PORT}`);
