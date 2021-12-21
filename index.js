require('dotenv').config();
const express = require('express');
const app = express();
require('./startup/ratelimit')(app);
require('./startup/sanitization')(app);
require('./startup/DBManager')();
require('./startup/routes')(app);
app.listen(process.env.PORT)
module.exports = app;