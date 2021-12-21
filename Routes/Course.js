const express = require('express')
const Course = require('../Controllers/Course')
const router = express.Router()


router.get('/get',Course.getAllCourses);
router.get('/get/:id',Course.getCourse);
router.post('/add_question/:id',Course.addQuestion);
router.delete('/remove_question/:id',Course.deleteQuestion);
router.post('/add_reply/:id',Course.addReply);

module.exports = router;