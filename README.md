webSci_lab7
===========

Nodejs, json, mongodb

Description
-----------
Add 2 more buttons on to lab 6. One button will read tweets from the twitter API and save them to a collection in mongoDB. The other button will read the tweets from the database collection and display them in a manner similar to that of lab 1. This will make 4 total buttons.

Approach
--------
Create an array of tweets using nTwitter, just like in lab 5 when you write to a JSON file. Instead of writing that array to the JSON file, connect to mongoDB and insert that array into a mongoDB collection. This collection can then later be queried to get the collection of tweets to display to the page. The client socket emits an event to tell the server to collect the tweets from mongoDB and put them in an array. This array is then sent via the socket to the client where the client parses it and displays the tweets on the page. 

Refelection
-----------
Writing to mongoDB can be done directly from an array. This makes writing to mongoDB as easy as writing to the JSON file in the previous labs. Once the array of objects is in the database it can then be queried to retrieve all or some of the tweets in the database. In order to display the tweets from mongoDB to the page, a socket event is emitted from the client to request a query of all tweets. This query will find all the tweets in the collection and then save them to an array. This array is then sent back to the client after being fully populated. This is a slow way to do it espectially when you get into larger quantities than 1000. However, this way makes it simple to send the tweets to the client via the socket for the client to display. Reading and writing to and from mongoDB is pretty straightforward as I can tell. 

References
----------
[Socket.io](http://socket.io/ "Socket.io")
[Nodejs.org](http://nodejs.org/ "Nodejs")
[getbootstrap.com](http://getbootstrap.com/ "Twitter Bootstrap")
[node-fs](http://nodejs.org/api/fs.html "Node Filesystem")
[json2csv module](https://github.com/zeMirco/json2csv "json2csv Module")
[expressjs.com](http://expressjs.com/ "ExpressJS")
[Christian Valheim Blog](http://christiankvalheim.com/ "chrisianvalheim")