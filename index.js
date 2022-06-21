import express from "express";
import bodyParser from "body-parser";
import { connect, getDB } from "./db.js";
import { ObjectId } from "mongodb";

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connect();

app.get("/todos/:sortby", (req, res) => {
  const sortby = req.params.sortby; // take by what we must to sort
  if (sortby === "byname") {
    getDB()
      .collection("todos")
      .find({})
      .sort("name") //sort by name
      .toArray((err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ err: err });
          return;
        }
        res.status(200).json(result);
      });
  } else if (sortby === "bypriority") {
    getDB()
      .collection("todos")
      .find({})
      .sort({ priority: -1 }) //sort by priority, descending order
      .toArray((err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ err: err });
          return;
        }
        res.status(200).json(result);
      });
  } else {
    res.status(200).send("Please change your url to sort!");
  }
});

app.post("/todo", (req, res) => {
  const newProduct = req.body; // через json передаем name, priority...
  getDB().collection("todos").insertOne(newProduct);
  res.status(200).send();
});

app.delete("/todo/:id", (req, res) => {
  getDB()
    .collection("todos")
    .deleteOne({ _id: new ObjectId(req.params.id) }, (err) => {
      //write id to url, and take from req.params
      // req.query - parameters after ?
      if (err) {
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).send();
    });
});

app.get("/todo/find/:name", (req, res) => {
  const name = req.params.name; // take name from url
  getDB()
    .collection("todos")
    .find({ name: name })
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(result);
    });
});

app.put("/todo/change", (req, res) => {
  // find element by id, then change it
  // first enter id, then parameters that you want to change
  const { id, ...parames } = req.body;
  getDB()
    .collection("todos")
    .updateMany({ _id: new ObjectId(id) }, { $set: { ...parames } });
  res.status(200).send();
});

app.listen(port, () => {
  console.log("Server started!");
});
