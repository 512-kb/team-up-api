const router = require("express").Router();
const bodyParser = require("body-parser");
const _ = require("lodash");
const User = require("../schema").User;

router.use(bodyParser.json());

router.get("/login", async (req, res) => {
  let user = await User.find(req.query, err => {
    if (err) res.send({ msg: "Invalid Credentials" });
  });
  if (user.length <= 0) res.send({ msg: "Invalid Credentials" });
  else
    res.send({
      _id: user[0]._id,
      username: user[0].username,
      region: user[0].region
    });
});

router.post("/register", async (req, res) => {
  let user = await User.find({ username: req.body.username });
  if (user.length > 0) {
    res.send({ msg: "Username already taken" });
    return;
  }
  user = new User(_.assign(req.body, { created: Date.now() }));
  await user.save().then(({ _id, username, region }) => {
    res.send({ _id, username, region });
  });
});

module.exports = router;
