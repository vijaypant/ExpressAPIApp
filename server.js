var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var api = require('./api');
var config = require('./config');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
mongoose.connect(config.database);

app.get('/', function(req, res){
    return res.end('Hello the api is at http://localhost:8080/api/');
});    

// Create a sample user.
// app.get('/setup', function(req, res){
//     var vijay = new User({
//         name: 'Vijay Pant',
//         password: 'password',
//         admin: true
//     });
//     vijay.save(function(err){
//         if(err) throw err;
//         console.log('User saved successfully.');
//         res.json({success: true});
//     });
// });

app.use('/api', api);

app.listen(port);
console.log('Magic happens on port '+port);