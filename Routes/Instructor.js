const express = require("express");
const Instructor = require("../Controllers/Instructor");
const auth = require("../Controllers/Auth");
const multer = require("multer");
const upload = multer({ dest: "Resources/files" });

const router = express.Router();
router.use(auth.protect(true));
router.get("/get", Instructor.getAllInstructors);
router.get("/get/:id", Instructor.getInstructor);
router.get("/get_many", Instructor.getSeveralInstructors);
router.post("/add_course", Instructor.createCourse);
router.put("/remove_course/:id", Instructor.removeCourse);
router.post("/add_syllabus/:id", upload.single("file"), Instructor.addSyllabus);

module.exports = router;
