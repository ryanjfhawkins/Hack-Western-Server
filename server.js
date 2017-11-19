
// DATABASE SETUP
// =============================================================================
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors = require('cors');


//Configuration parameters for the indico.io API
var indico = require('indico.io');
indico.apiKey = '1368cfc82277b8ed42c531a1c6ae2351';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
// var port = 12222;
// DATABASE SETUP
// =============================================================================

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/messageboard', {
  useMongoClient: true,
});

var Message = require("./message");

// ROUTES
// ======================================
var router = express.Router();

app.use('/client', express.static('client'));

router.use(function(req, res, next){
   // do logging
   console.log("I'm the middle man");
   next();
});

app.use(cors())
router.get('/', function(req, res) {
    console.log("I'm the standard GET");
    res.json({ message: 'hooray! welcome to our api!' });   
});

// global class variables
var resp1;

router.route('/message')
    //creating a message using the 
    .post(function(req, res) {
        console.log("POST for creating a message");
        var message = new Message();
        message.userName = req.body.userName;
        message.message = req.body.message;
        message.time = req.body.time;
            
        // console.log("Message sent: " + message.message);
        // console.log("Message body: " + req.body.message);
            
        indico.sentimentHQ(message.message)
            .then(function(response){
                message.sentiment = response.toString();
                console.log("sentiment: "+message.sentiment)
                //resp1 = response;
                //console.log("Sentiment: " + message.sentiment);
            })
            .catch(function(err){
                console.log(err);
                res.json({message: 'Unable to create Message in database'});
            });
            
            setTimeout(() => {
                indico.emotion(message.message)
                .then(function(res1){
                    //console.log("Variables from emotion");
                    message.anger = res1.anger.toString();
                    message.joy = res1.joy.toString();
                    message.fear = res1.fear.toString();
                    message.sadness = res1.sadness.toString();
                    message.surprise = res1.surprise.toString();
                    //message.sentiment = resp1;
                    // console.log("resp1" + resp1);
                        
                    // console.log(message.anger);
                    // console.log(message.joy);
                    // console.log(message.fear);
                    // console.log(message.sadness);
                    // console.log(message.surprise);
                     console.log("Sentiment " + message.sentiment);
                    message.save(function(err){
                        if(err){
                            res.send(err);
                        }
                    res.json({message: 'Message created!!'});
                });
            })
            .catch(function(err){
                if(err){
                    res.json({message: 'Error getting emotion'});
                    console.log(err);
                }
            })
            }, 500)
            
        })
        
        .get(function(req, res){
            console.log("GET all the messages");
            Message.find(function(err, messages){
                if(err){
                    console.log('err');
                    res.send(err);
                }
                res.setHeader('Content-Type', 'application/json');
                res.json(messages);
                
            });
        });
        
router.route('/message/:message_id')

    //Delete a message from the database
    .delete(function(req, res){

        console.log('DELETE has been called');
        Message.remove({
            _id: req.params.message_id
        }, function(err, message) {
            if(err){
                res.send(err);
            }
            res.json({message: 'Successfully deleted'});
        });
    })
    
    .get(function(req, res) {
		Message.findById(req.params.message_id, function(err, message) {
			if (err){
				res.send(err);
			}
			res.json(message);
		});
	});
       
router.route('/test')
    .post(function(req,res){
        
        var message = new Message();
        message.userName = req.body.userName;
        message.message = req.body.message;
        message.time = req.body.time;
            
        // console.log("Message sent: " + message.message);
        // console.log("Message body: " + req.body.message);
            
        indico.sentimentHQ(message.message)
            .then(function(response){
                message.sentiment = response.toString();
                console.log("sentiment: "+message.sentiment)
                //resp1 = response;
                //console.log("Sentiment: " + message.sentiment);
            })
            .catch(function(err){
                console.log(err);
                res.json({message: 'Unable to create Message in database'});
            });
            
            setTimeout(() => {
                indico.emotion(message.message)
                .then(function(res1){
                    //console.log("Variables from emotion");
                    message.anger = res1.anger.toString();
                    message.joy = res1.joy.toString();
                    message.fear = res1.fear.toString();
                    message.sadness = res1.sadness.toString();
                    message.surprise = res1.surprise.toString();
                    //message.sentiment = resp1;
                    // console.log("resp1" + resp1);
                        
                    console.log(message.anger);
                    console.log(message.joy);
                    console.log(message.fear);
                    console.log(message.sadness);
                    console.log(message.surprise);
                     console.log("Sentiment " + message.sentiment);
                    // message.save(function(err){
                    //     if(err){
                    //         res.send(err);
                    //     }
                   // res.json({message: 'Message created!!'});
               // });
               //wait one second before sending it back because waiting for the object to be initialized
               setTimeout(()=>{
                console.log("Message: " + message);
                res.json(message);
            }, 1000)
            
            })
            .catch(function(err){
                if(err){
                    res.json({message: 'Error getting emotion'});
                    console.log(err);
                }
            })
            }, 500)
    })

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);