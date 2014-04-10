/**
 * client.js is the javascript that is run on the clientside to listen for dom events and also communicate with the nodejs server via the socket.io module
 * The entire javascript is wrapped in jquery to add some functionality for the javascript. 
 */

jQuery(document).ready(function() {
	var socket = io.connect();					//socket connection via socket.io to the nodejs/express server

	socket.on('connect', function(){
		console.log('Connected');					//Receive 'connect' from the server and write connected to the console
	});
	socket.on('disconnect', function(){
		console.log('Disconnected');			//Receive 'disconnect' from the server and write disconnected to the console
	});
	socket.on('error', function(err){
		if(err == 'handshake error') {		//Receive 'handshake error' if there is one from the server and log the error to the console for debugging. 
			console.log('handshake error', err);
		} else {
			console.log('io error', err);		//If there is an io error log that error to the console. 
		}
	});
	
	/**
	 * receive the tweetSuccess message from the server and display an alert to notify the user what is happening. 
	 * There is also a log server side to notify the admin of what is happening.
	 */
	socket.on('tweetSuccess', function(){
		$("#alert").html("<div class='alert alert-success alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>Getting Dem Dere Tweets!</div>");
	});
	/**
	 * If there is a file with the same name as the json file is trying to write it will display and alert notifying the user of an overwrite.
	 */
	socket.on('tweetOver', function(){
		$("#alert").html("<div class='alert alert-warning alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>File is being overwritten!</div>");
	})
	/**
	 * When the JSON2CSV event runs on the server side this event is emmitted and the client displays this alert to notify the user of the successful writing of the file. 
	 */
	socket.on('csvSuccess', function(){
		$("#alert").html("<div class='alert alert-success alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>Exporting JSON to CSV!</div>");
	});
	/**
	 * If the csv file with the same name already exists an alert warning of the overwrite is displayed. 
	 */
	socket.on('csvOver', function(){
		$("#alert").html("<div class='alert alert-warning alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>File is Being overwritten!</div>");
	});
	/**
	 * If the JSON file does not exist then an alert is displayed to notify the user to create the file first.
	 */
	socket.on('jsonNotExist', function(){
		$("#alert").html("<div class='alert alert-danger alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button> The json file does not exist please create it first! </div>")
	});
	
	/**
	 * listen for the 'tweetReturn' event from the server. Receives an array of tweets from the server to parse and display on the page based on lab1. 
	 * @param  array tweets collection of tweets to be parsed and displayed.
	 */
	socket.on('tweetReturn', function(tweets){
		for(var i = 0; i < 5; i++){
          $("#tweets").prepend("<li><img class='dp' src='" + tweets[i].user.profile_image_url + "'></img> <div class='tweet'>" + tweets[i].text + "</div></li>");
          $("img").error(function () {
            $(this).unbind("error").attr("src", "js/twitter-bird.jpg");
          });
       }
       var count = 5;

       //Every 2 seconds prepend a tweet to the ul and delete the last tweet
       var timer = setInterval(function(){
          if(count == tweets.length) count = 0;
          var listItemHTML = "<li><img class='dp' src='" + tweets[count].user.profile_image_url + "'></img> <div class='tweet'>" + tweets[count].text + "</div></li>";

          $(listItemHTML)
               .hide()
               .css('opacity',0.0)
               .prependTo('#tweets')
               .slideDown('slow')
               .animate({opacity: 1.0});

          $("img").error(function () {
            $(this).unbind("error").attr("src", "js/twitter-bird.jpg");
          });
          if (count != tweets.length) count ++;
          $("#tweets li:gt(5):last").remove();
       } , 2000);

       //hashtags
       var count = 0;
       var j=0;
       while(j < 5){
          if(tweets[count].entities.hashtags.length != 0){
             $("#hashtags").prepend("<li> #" + tweets[count].entities.hashtags[0].text + "</li>");
             j++;
          }
          count++;
       }
       var timer = setInterval(function(){
          if(count == tweets.length) count = 0;
          while(tweets[count].entities.hashtags.length == 0){
             count++;
          }
          var listItemHTML = "<li> #" + tweets[count].entities.hashtags[0].text + "</li>";
          $(listItemHTML)
               .hide()
               .css('opacity',0.0)
               .prependTo('#hashtags')
               .slideDown('slow')
               .animate({opacity: 1.0});
          if (count != tweets.length) count ++;
          $("#hashtags li:gt(5):last").remove();
       } , 2200);
	});

	/**
	 * The click events for the buttons. These events emit the approriate message to the server in order to run the server side functions to either get the tweets or export to CSV.
	 */
	$("#btn1").click(function() {
		socket.emit('getTweets');
	});

	$("#btn2").click(function() {
		socket.emit('getCsv');
	});
	$("#btn3").click(function() {
		socket.emit('getMongo');
	})
	$("#btn4").click(function() {
		socket.emit('displayTweets');
		$("#alert").html("<div class='alert alert-success alert-dismissable'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button> Getting Tweets to Display on Page. Please Wait</div>")
	});
});