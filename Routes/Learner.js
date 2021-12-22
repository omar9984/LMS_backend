const express = require("express");
const Learner = require("../Controllers/Learner");
const auth = require("../Controllers/Auth");

const router = express.Router();
router.use(auth.protect(true));

router.get("/get", Learner.getAllLearners);
router.get("/get/:id", Learner.getLearner);
router.post("/add_course/:id", Learner.addCourse);

module.exports = router;
