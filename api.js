var express = require('express');
var router = express.Router();
var User = require('./models/user');
var Beer = require('./models/beer');
var jwt = require('jsonwebtoken');
var config = require('./config');

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
                var token = jwt.sign(user, config.secret, {expiresInMinutes: 1440});

                res.json({success: true, message: 'Enjoy your token.', token: token});
            }
        }
    });
});

//todo: route middleware to verify token.
router.use(function(req, res, next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, config.secret, function(err, decoded){
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

module.exports = router;