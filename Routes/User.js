const express = require("express");
const User = require("../Controllers/User");
const { route } = require("./Auth");
const auth = require("../Controllers/Auth");
const router = express.Router();
router.use(auth.protect(true));
router.get("/profile", User.getMyProfile);

module.exports = router;
