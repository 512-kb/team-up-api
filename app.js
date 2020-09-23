require("dotenv").config();
const express = require("express");
const app = express();
const _ = require("lodash");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const getPosts = require("./routes/post").getPosts;
const savePost = require("./routes/post").savePost;
const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoDB");
  })
  .on("error", (err) => {
    console.log(err);
  });

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.use(routes);

app.get("/", (req, res) => res.send("DATABASE SERVER"));

const io = require("socket.io")(
  app.listen(port, () => console.log("Server listening on port " + port))
);

let q = {};

const waitForQueue = async (id) => {
  while (q[id].isOccupied)
    await ((ms) => new Promise((res) => setTimeout(res, ms)))(400);
};

io.on("connection", (socket) => {
  socket.on("join_channel_room", async (channel_id, updateClientPosts) => {
    for (let room in _.omit(io.sockets.adapter.sids[socket.id], socket.id))
      socket.leave(room);

    if (!q[channel_id]) q[channel_id] = { posts: [], isOccupied: false };

    await waitForQueue(channel_id);

    q[channel_id].isOccupied = true;
    let res = await getPosts({ channel_id, skip: 0 });
    q[channel_id].isOccupied = false;

    if (res.length > 0) updateClientPosts(res);
    delete res;
    socket.join(channel_id);
  });

  socket.on("new_post", (post_obj) => {
    q[post_obj.channel_id].posts.push(post_obj);
    setTimeout(async () => {
      await waitForQueue(post_obj.channel_id);

      q[post_obj.channel_id].isOccupied = true;
      while (q[post_obj.channel_id].posts.length) {
        const res = await savePost(q[post_obj.channel_id].posts.shift());
        io.to(post_obj.channel_id).emit("new_post_braodcast", res.post);
        delete res;
      }
      q[post_obj.channel_id].isOccupied = false;
    }, 400);
  });

  socket.on("fetch_old_posts", async (query, updateClientPosts) => {
    await waitForQueue(query.channel_id);
    q[query.channel_id].isOccupied = true;
    let res = await getPosts(query);
    q[query.channel_id].isOccupied = false;
    if (res.length > 0) updateClientPosts(res);
    delete res;
  });
});
