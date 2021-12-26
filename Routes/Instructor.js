const express = require("express");
const Instructor = require("../Controllers/Instructor");
const auth = require("../Controllers/Auth");

const router = express.Router();
router.use(auth.protect(true));
router.get("/get", Instructor.getAllInstructors);
router.get("/get/:id", Instructor.getInstructor);
router.get("/get_many", Instructor.getSeveralInstructors);
router.post("/add_course", Instructor.createCourse);

module.exports = router;
