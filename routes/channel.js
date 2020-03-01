const router = require("express").Router();
const bodyParser = require("body-parser");
const _ = require("lodash");
const User = require("../schema").User;
const Channel = require("../schema").Channel;
const Invitation = require("../schema").Invitation;

router.use(bodyParser.json());

router
  .route("/channels")
  .get(async (req, res) => {
    let channels = await Invitation.aggregate([
      { $match: _.assign(req.query, { status: true }) },
      { $sort: { post_count: -1 } }
    ]);

    for (let i = 0; i < channels.length; i++) {
      channels[i] = await Channel.findOne({
        _id: channels[i].channel_id
      });
    }
    res.send(channels);
  })
  .post(async (req, res) => {
    //{name,description,username,tags[]}
    if (!req.body) {
      res.send({ msg: "No data sent" });
      return;
    }
    let channel = await Channel.find({
      username: req.body.username,
      name: req.body.name
    });
    if (channel.length > 0) {
      res.send({ msg: "Channel Already Exists" });
      return;
    }
    channel = new Channel(_.assign(req.body, { created: Date.now() }));
    await channel
      .save()
      .then(async channel_obj => {
        const invite = new Invitation({
          username: channel_obj.username,
          sent_by: channel_obj.username,
          channel_id: channel_obj._id,
          status: true,
          post_count: 0,
          created: Date.now()
        });
        await invite
          .save()
          .then(() => res.send({ msg: "Channel created" }))
          .catch(err => {
            if (err) {
              console.log(err);
              res.send({ msg: "Error Occured" });
            }
          });
      })
      .catch(err => {
        if (err) {
          console.log(err);
          res.send({ msg: "Error Occured" });
        }
      });
  });

router
  .route("/invitations")
  .get(async (req, res) => {
    //{username}
    const channels = await Invitation.find(
      _.assign(req.query, { status: false })
    ).sort({ created: 1 });
    res.send(channels);
  })
  .post(async (req, res) => {
    //{channel_id,channel_name,username,sent_by}
    if (req.body.username === req.body.sent_by) {
      res.send({ err: "Can't Invite Yourself!" });
      return;
    }
    let usr = await User.findOne({ username: req.body.username });
    if (!usr) {
      res.send({ err: "No such user" });
      return;
    }
    let invite = await Invitation.findOne(req.body);
    if (invite) {
      if (invite.status) res.send({ err: "Already a member" });
      else res.send({ err: "Invite already Sent" });
      return;
    }
    invite = new Invitation(
      _.assign(req.body, { status: false, post_count: 0, created: Date.now() })
    );
    await invite
      .save()
      .then(() => res.send({ msg: "Invite Sent" }))
      .catch(err => {
        if (err) {
          console.log(err);
          res.send({ err: "Error Occured" });
        }
      });
  })
  .put(async (req, res) => {
    //{channel_id,username}
    await Invitation.updateOne(
      req.body,
      {
        $set: {
          status: true
        }
      },
      err => {
        if (err) res.send(err);
        else res.send({ msg: "Invitation Accepted" });
      }
    );
  })
  .delete(async (req, res) => {
    //{channel_id,username}
    await Invitation.deleteOne(req.query, err => {
      if (err) res.send({ msg: "Some error occured" });
      else res.send({ msg: "Invitation Declined" });
    });
  });

module.exports = router;
