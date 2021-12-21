const express = require('express')
const Instructor = require('../Controllers/Instructor')
const router = express.Router()


router.get('/get',Instructor.getAllInstructors);
router.get('/get/:id',Instructor.getInstructor);
router.post('/add_course/:id',Instructor.createCourse);

module.exports = router;