const express = require('express')
const Learner = require('../Controllers/Learner')
const router = express.Router()


router.get('/get',Learner.getAllLearners);
router.get('/get/:id',Learner.getLearner);
router.post('/add_course/:id',Learner.addCourse);

module.exports = router;