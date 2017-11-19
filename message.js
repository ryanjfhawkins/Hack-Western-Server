var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    userName: String,
    message: String,
    time: String,
    sentiment: String,
    anger: String,
    joy: String,
    fear: String,
    surprise: String,
    sadness: String
    
});

module.exports = mongoose.model('Message', MessageSchema);