const express = require("express");
const Course = require("../Controllers/Course");
const auth = require("../Controllers/Auth");
const router = express.Router();
router.use(auth.protect(true));

router.get("/get", Course.getAllCourses);
router.get("/get/:id", Course.getCourse);
router.get("/get_many", Course.getSeveralCourses);
router.get("/get_many_questions", Course.getSeveralQuestions);
router.get("/get_many_activities", Course.getSeveralActivities);
router.post("/add_question/:id", Course.addQuestion);
router.delete("/remove_question/:id", Course.deleteQuestion);
router.post("/add_reply/:id", Course.addReply);

module.exports = router;
