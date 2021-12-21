const express = require('express')
const auth = require('../Controllers/Auth')
const router = express.Router()


router.post('/login',auth.login);
router.post('/signup',auth.signup);

module.exports = router;