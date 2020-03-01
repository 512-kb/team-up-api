const mongoose = require("mongoose");

const User = mongoose.Schema({
  email: String,
  region: String,
  username: String,
  password: String,
  created: String
  //,updated: String
});

const Post = mongoose.Schema({
  username: String,
  tags: [String],
  content: String,
  channel_id: String,
  created: String
});

const Channel = mongoose.Schema({
  name: String,
  description: String,
  username: String,
  tags: [String],
  created: String
  //,updated: String
});

const Invitation = mongoose.Schema({
  channel_id: String,
  channel_name: String,
  username: String,
  sent_by: String,
  status: Boolean,
  post_count: Number,
  created: String
});

module.exports.User = mongoose.model("User", User);
module.exports.Channel = mongoose.model("Channel", Channel);
module.exports.Post = mongoose.model("Post", Post);
module.exports.Invitation = mongoose.model("Invitation", Invitation);
