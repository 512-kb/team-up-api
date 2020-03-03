const _ = require("lodash");
const Post = require("../schema").Post;
const Invitation = require("../schema").Invitation;

module.exports.getPosts = async query => {
  let res = [];

  res = await Post.find(_.omit(query, "page"))
    .sort({ created: -1 })
    .skip(query.page * 20)
    .limit(20);
  return res.reverse();
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
