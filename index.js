const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xicrlbt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  // data collection
  const usersCollection = client.db("qurinom").collection("users");

  app.post("/user", async (req, res) => {
    const user = req.body;
    const uid = user.userUID;
    const query = { userUID: uid };
    const cheackUID = await usersCollection.findOne(query);
    if (cheackUID) {
      res.send({ acknowledged: true, message: "Your account was created." });
    } else {
      const result = await usersCollection.insertOne(user);
      res.send(result);
    }
  });

  app.get("/user", async (req, res) => {
    const query = {};
    const result = await blogsCollection.find(query).toArray();
    res.send(result);
  });
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Qurimon is running...");
});

app.listen(port, () => {
  console.log(`Qurimon running in ${port}`);
});
