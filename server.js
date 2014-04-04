var fs = require('fs');		//Filesystem to read and write to files
var json2csv = require('json2csv');		//Used to export json to csv file. Slightly modified to deal with nested objects
var express = require('express');		//Used to create a webserver to serve an HTML page
var io = require('socket.io');			//Used to communicate between the client and server
var http = require('http');				//Needed to server webpages with express
var app = express();					//Creates an express application with the name app
var server = http.createServer(app);	//Create a webserver with the extended functionality of express
var twitter = require('ntwitter');		//Used to connect to the twitter API and gather tweets 
var twit = new twitter({
	consumer_key: '5UMbMiZmyfmZIv4w4wIvA',
	consumer_secret: '4XbLRKae0JnngpHyvgXm1K0dnmHYjKGwsZhHrfychy0',
	access_token_key: '110624472-7wxnUD6uIdDYnwLAEIucjtVe1jn6oMWgwd4Oytmp',
	access_token_secret: 'wfgF941yxA0xt2eg6QPUPpI2p5KBCJY3j9OOhir3gsFHF'
});										//Twitter API credentials

app.get('/', function(req,res){			//Serve index.html when connecting to the domain root
	res.sendfile('index.html');
});

app.use('/resources', express.static(__dirname + '/resources'));	//Imports all the files in this and all all subdirectories. 

server.listen(8080);

io = io.listen(server);

io.sockets.on('connection', function(socket){
	console.log('Connected');

	socket.on('getTweets', function(){
		/**
		 * Check if the named file exists. If it does emit an event to notify the client of the existence to display a message to the user. 
		 * @param  boolean exists True if the file exists. False otherwise.
		 */
		fs.exists('ITWS4200-lab6-zonej-tweets.json', function(exists){
			
			if(exists){
				console.log("File is being overwritten!");
				socket.emit("tweetOver"); //Emit an event to the client of this socket for the client to display an alert based on this event. 
				gatherTweets(); //call this function to gather the tweets
			}
			
			else{
				gatherTweets();
				socket.emit("tweetSuccess");
			}
		});
	});

	socket.on('getCsv', function(){
		/**
		 * Check if the file exists to export. If the json file does not exists then a warning is displayed client side telling the user to create it first
		 * @param  boolean exists True if exists, False otherwise.
		 */
		fs.exists('ITWS4200-lab6-zonej-tweets.json', function(exists){
			
			if(exists){
				socket.emit("csvSuccess");
				tweet2csv();
			}

			else {
				socket.emit("jsonNotExist");
			}
		});
	});

	socket.on('disconnect', function(){
		console.log('Disconnected');
	});
});

/**
 * Connect to the streaming twitter API via ntwitter module to collect 1000 tweets to write to a json file.
 * Streams all the tweets into an array that will hold 1000 tweets. Once the array has 1000 tweets the array is then writted to a json file using node-fs module. 
 * @return file ITWS4200-lab6-zonej-tweets.json
 */
function gatherTweets() {
	console.log('Gettin dem dere tweets');
	var i = 0;
	var tweets = [];

	twit.stream('statuses/sample', function(stream) {
		stream.on('error', function(error, code){
			console.log("error: " + error + ": " + code);
		});

		stream.on('end', function(response){
			console.log("Stream Ended");
		});

		stream.on('destroy', function(response){
			console.log("Stream Destroyed");
		});
		
		stream.on('data', function(data){
			if(i < 1000){
				if(i % 20 == 0){
					console.log(i);
				}
				tweets.push(data);
				i++;
			}

			else if(i == 1000){
				i++;
				fs.writeFile('ITWS4200-lab6-zonej-tweets.json', JSON.stringify(tweets, null, 4), function(err){
					if(err) throw err;
					console.log("Tweets saved to file!");
				});
			}
				
			else{
				stream.destroy();
			}
		});
	});
}

/**
 * Take the json file that is created by the gatherTweets function and exports certain fields to a csv file with the same name. This function uses the json2csv module of node. 
 * This file first reads the json file into a string that can be parsed. The columns and column names are passed in as parameters to the json2csv module. 
 * Writes a tweet csv file if there are no errors. Otherwise log the error. 
 * @return ITWS4200-lab6-zonej-tweets.csv
 */
function tweet2csv() {
	console.log("Converting to CSV.");
	var data = fs.readFileSync('ITWS4200-lab6-zonej-tweets.json').toString();
	var json = JSON.parse(data);
	var columns = ['created_at', 'id', 'text', 'user.id', 'user.name', 'user.screen_name', 'user.location', 'user.followers_count', 'user.friends_count', 
		'user.created_at', 'user.time_zone', 'user.profile_background_color', 'user.profile_image_url', 'geo', 'coordinates', 'place'];
		
	var col_names = ['created_at', 'id','text', 'user_id', 'user_name', 'user_screen_name', 'user_location', 'user_followers_count', 'user_friends_count', 
		'user_created_at', 'user_time_zone', 'user_profile_background_color', 'user_profile_image_url', 'geo', 'coordinates', 'place'];

	json2csv({data: json, fields: columns, fieldNames: col_names}, function(err, csv){
		if(err) console.log(err);
		fs.writeFile('ITWS-lab6-zonej-tweets.csv', csv, function(err){
			if(err) throw err;
			console.log('file saved');
		});
	});
}