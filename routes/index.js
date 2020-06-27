const router = require("express").Router();
const fs = require("fs");

fs.readdirSync("./routes").forEach(
  (file) =>
    file !== "index.js" &&
    file !== "post.js" &&
    router.use(require(`./${file}`))
);
module.exports = router;
