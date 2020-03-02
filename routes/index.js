const router = require("express").Router();

router.use(require("./user_auth"));
router.use(require("./channel"));
router.use(require("./top5"));
router.use(require("./post").router);

module.exports = router;
