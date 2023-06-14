const express = require('express');
const cors = require('cors')
const routes = require('./Routes/routes');
const app = express();

app.use(
    express.urlencoded({extended:true})
)

app.use(express.json())
app.use(routes);

module.exports = app