var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Beer = require('./models/beer');
var User = require('./models/user');
var config = require('./config');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.get('/', function(req, res){
    return res.end('Hello the api is at http://localhost:8080/api/');
});    

app.get('/setup', function(req, res){
    var vijay = new User({
        name: 'Vijay Pant',
        password: 'password',
        admin: true
    });
    vijay.save(function(err){
        if(err) throw err;
        console.log('User saved successfully.');
        res.json({success: true});
    });
});

var router = express.Router();

// route to authenticate API requests.
router.post('/authenticate', function(req, res){
    User.findOne({name: req.body.name}, function(err, user){
        if(err) throw err;
        if(!user){
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else {
            if(user.password != req.body.password){
                res.json({success: false, message: 'Authentication failed. Invalid password.'});
            } else {
                var token = jwt.sign(user, app.get('superSecret'), {expiresInMinutes: 1440});

                res.json({success: true, message: 'Enjoy your token.', token: token});
            }
        }
    });
});

//todo: route middleware to verify token.
router.use(function(req, res, next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded){
            if(err) return res.json({success: false, message: 'Failed to authenticate token.'});
            req.decoded = decoded;
            next();
        });
    } else {
        return res.status(403).json({success: false, message: 'No token provided.'});
    }
});

//api routes

router.route('/beers')
    .post(function(req, res){
        var beer = new Beer();
        beer.name = req.body.name;
        console.log(req.body.name);
        beer.save(function(err){
            if(err) res.send(err);
            res.json({message: 'beer created!'});
        });
    })
    .get(function(req, res){
        Beer.find({}, function(err, beers){
            if(err) res.send(err);
            res.json(beers);
        })
    });

router.route('/beers/:beer_id')
    .get(function(req, res){
        Beer.findById(req.params.beer_id, function(err, beer){
            if(err) res.send(err);
            res.json(beer);
        })
    })    
    .put(function(req, res){
        Beer.findById(req.params.beer_id, function(err, beer){
            if(err) res.send(err);
            beer.name = req.body.name;
            beer.save(function(err){
                if(err) res.send(err);
                res.json({message: 'Beer updated!'});
            });
        })
    })
    .delete(function(req, res){
        Beer.remove({_id: req.params.beer_id}, function(err, beer){
            if(err) res.send(err);
            res.json({message: 'Beer deleted!'});
        });
    });

router.get('/showtokeninfo', function(req, res){
    res.json(req.decoded);
});
app.use('/api', router);

app.listen(port);
console.log('Magic happens on port '+port);