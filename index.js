require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json())
require('./startup/ratelimit')(app);
//require('./startup/routes')(app);
require('./startup/sanitization')(app);
require('./startup/DBmanager')();
app.listen(process.env.PORT)
module.exports = { app };