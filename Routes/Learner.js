const express = require("express");
const Learner = require("../Controllers/Learner");
const auth = require("../Controllers/Auth");

const router = express.Router();
router.use(auth.protect(true));

router.get("/get", Learner.getAllLearners);
router.get("/get/:id", Learner.getLearner);
router.get("/get_many", Learner.getSeveralLearners);
router.get("/explore_courses", Learner.exploreCourses);
router.post("/upgrade/:id", Learner.upgradeLearner);
router.post("/add_course/:id", Learner.addCourse);
router.Put("/leave_course/:id", Learner.leaveCourse);

module.exports = router;
