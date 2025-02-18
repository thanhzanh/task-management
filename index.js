const express = require('express')
require("dotenv").config();
const database = require('./config/database');
const routeApiVer1 = require("./api/v1/routes/index.route");
// database
database.connect();

const app = express()
const port = process.env.PORT;

routeApiVer1(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
