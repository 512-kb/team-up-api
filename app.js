const app = require("express")();
const admin = require("os").userInfo().username;
const _ = require("lodash");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const savePost = require("./routes/post").savePost;
const port = process.env.PORT || 3001;

mongoose.connect(
  admin === "kb98k" || admin === "kunal"
    ? "mongodb://localhost:27017/team-up"
    : "mongodb+srv://512kb:n%2D%25%23Q%2BH%2BEk%25W.y6@mongo-cluster-o7hzs.mongodb.net/team-up",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoDB");
  })
  .on("error", err => {
    console.log(err);
  });

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

io.on("connection", socket => {
  socket.on("join_channel_room", channel_id => {
    let rooms = _.omit(io.sockets.adapter.sids[socket.id], socket.id);
    for (let room in rooms) socket.leave(room);
    delete rooms;
    socket.join(channel_id);
  });
  socket.on("new_post", post_obj => {
    io.to(post_obj.channel_id).emit("new_post_braodcast", post_obj);
  });
});
