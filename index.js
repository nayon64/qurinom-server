const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
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
  const postsCollection = client.db("qurinom").collection("posts");

  // create jwt token
  app.get("/jwt", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    if (user) {
      const token = jwt.sign({ email }, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: "30d",
      });
      return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: "" });
  });

  // add user in database 
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

  // add new user in database
  app.get("/user", async (req, res) => {
    const query = {};
    const result = await blogsCollection.find(query).toArray();
    res.send(result);
  });

  // add a new post
  app.post("/post", async (req, res) => {
    const message = req.body;
    const result = await postsCollection.insertOne(message);
    res.send(result);
  });

  // get all post
  app.get("/posts", async (req, res) => {
    const query = {};
    const posts = await postsCollection
      .find(query)
      .sort({ publishedDate: -1 })
      .toArray();
    res.send(posts);
  });

  // post update
  app.put("/post", async (req, res) => {
    const id = req.query.id;
    const query = { _id: ObjectId(id) };
    const post = req.body;
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        message: post.message,
        publishedDate: post.date,
      },
    };

    const result = await postsCollection.updateOne(query, updateDoc, options);
    console.log(post, id);
    res.send(result);
  });

  // singleuser posts
  app.get("/userPosts", async (req, res) => {
    const email = req.query.email;
    const query = { authorEmail: email };
    const userPosts = await postsCollection.find(query).toArray();
    res.send(userPosts);
  });
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Qurimon is running...");
});

app.listen(port, () => {
  console.log(`Qurimon running in ${port}`);
});
