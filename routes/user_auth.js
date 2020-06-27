const router = require("express").Router();
const _ = require("lodash");
const User = require("../schema").User;

router.get("/login", async (req, res) => {
  let user = await User.find(req.query, (err) => {
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

router.get("/validate", async ({ query }, res) => {
  let [user] = await User.find({
    $or: [{ username: query.username }, { email: query.email }]
  });
  let obj = {};
  if (user) {
    if (user.email === query.email) obj.email = "E-mail already registered";
    if (user.username === query.username)
      obj.username = "Username already taken";
  }
  res.send(obj);
});

router.post("/register", async ({ body }, res) => {
  let [user] = await User.find({
    $or: [{ username: body.username }, { email: body.email }]
  });
  if (user) {
    let obj = {};
    if (user.email === body.email) obj.email = "E-mail already registered";
    if (user.username === body.username)
      obj.username = "Username already taken";
    res.send(obj);
    return;
  }
  user = new User(_.assign(body, { created: Date.now() }));
  await user.save().then(({ _id, username, region }) => {
    res.send({ _id, username, region });
  });
});

module.exports = router;
