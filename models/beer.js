var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var beerSchema = new Schema({
    name: String
});

var Beer = mongoose.model('Beer', beerSchema);

module.exports = Beer;