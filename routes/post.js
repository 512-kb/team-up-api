const router = require("express").Router();
const bodyParser = require("body-parser");
const _ = require("lodash");
const Post = require("../schema").Post;
const Invitation = require("../schema").Invitation;

router.use(bodyParser.json());

router
  .route("/posts")
  .get(async (req, res) => {
    //{username,pgno,channel_id}
    if (!req.query.username || !req.query.channel_id) {
      res.send([]);
      return;
    }
    const posts = await Post.find({ channel_id: req.query.channel_id })
      .sort({ created: -1 })
      .skip(req.query.page * 30)
      .limit(30)
      .sort({ created: 1 });
    res.send(posts);
  })
  .post(async (req, res) => {
    //{username,tags[],content,channel_id}
    await new Post(_.assign(req.body, { created: Date.now() }))
      .save()
      .then(async post_obj => {
        await Invitation.updateOne(
          { channel_id: req.body.channel_id, username: req.body.username },
          {
            $inc: { post_count: 1 }
          }
        )
          .then(() => res.send({ msg: "Post created", post: post_obj }))
          .catch(err => {
            if (err) res.send(err);
          });
      })
      .catch(err => {
        if (err) res.send(err);
      });
  })
  .delete(async (req, res) => {
    //{_id,username}
    await Post.deleteOne(req.body, err => {
      if (err) res.send({ msg: "Some error occured" });
      else res.send({ msg: "Post Deleted" });
    });
  });

module.exports.getPosts = async query => {
  let res = [];

  res = await Post.find(_.omit(query, "page"))
    .sort({ created: -1 })
    .skip(query.page * 30)
    .limit(30)
    .sort({ created: 1 });
  return res;
};

module.exports.savePost = async post_object => {
  let res = {};
  await new Post(_.assign(post_object, { created: Date.now() }))
    .save()
    .then(async post_obj => {
      await Invitation.updateOne(
        { channel_id: post_object.channel_id, username: post_object.username },
        {
          $inc: { post_count: 1 }
        }
      )
        .then(() => {
          res = { msg: "Post created", post: post_obj };
        })
        .catch(err => {
          if (err) res = err;
        });
    })
    .catch(err => {
      if (err) res = err;
    });
  return res;
};

module.exports.router = router;
