const router = require("express").Router();
const bodyParser = require("body-parser");
const _ = require("lodash");
const User = require("../schema").User;
const Post = require("../schema").Post;
const Channel = require("../schema").Channel;

router.use(bodyParser.json());

router.get("/top5", async (req, res) => {
  switch (req.query.entity) {
    case "channels":
      let channels = await Post.aggregate([
        { $match: JSON.parse(req.query.filter) },
        {
          $sortByCount: "$channel_id"
        }
      ]).limit(5);
      for (i = 0; i < channels.length; i++) {
        channels[i].name = (
          await Channel.findOne({
            _id: channels[i]._id
          })
        ).name;
      }
      res.send(channels);
      return;
    case "regions":
      const regions = await User.aggregate([
        { $match: JSON.parse(req.query.filter) },
        { $sortByCount: "$region" }
      ]).limit(5);
      res.send(regions);
      return;
    case "users":
      const users = await Post.aggregate([
        { $match: JSON.parse(req.query.filter) },
        { $sortByCount: "$username" }
      ]).limit(5);
      res.send(users);
      return;
    case "tags":
      let tags = await Post.aggregate([
        { $match: JSON.parse(req.query.filter) },
        { $unwind: "$tags" },
        {
          $group: {
            _id: "$tags",
            channels: { $addToSet: "$channel_id" }
          }
        }
      ]);
      tags = _.slice(
        tags.sort((one, other) => other.channels.length - one.channels.length),
        0,
        5
      );
      res.send(tags);
      return;
    default:
      res.send({ msg: "Invalid Param" });
  }
});

module.exports = router;
