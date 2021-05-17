var express = require('express');
var bodyparser = require('body-parser');

var app = express();

app.use(bodyparser.json());
require('./routes.js')(app);
app.listen(4010);
console.log("App listing to the port: 4010");