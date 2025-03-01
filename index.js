const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const database = require('./config/database');
const routeApiVer1 = require("./api/v1/routes/index.route");
// database
database.connect();

const app = express()
const port = process.env.PORT;

// parse application/json
app.use(bodyParser.json());

// cors
app.use(cors());

// cookie
app.use(cookieParser());

routeApiVer1(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
