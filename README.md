[![Build Status](https://travis-ci.org/njh/node-owfs.png)](https://travis-ci.org/njh/node-owfs)
[![Dependencies](https://david-dm.org/njh/node-owfs.png)](https://david-dm.org/njh/node-owfs)

owfs
====

A [node.js](nodejs.org) client library to owserver [Documentation & protocol specs](http://www.owfs.org)

Installation
============

	npm install owfs

Examples
========

First of all you need a connection to a running owserver:

	var Client = require("owfs").Client;
	var con = new Client(HOST,PORT);

or with the default port 4304

	var con = new Client(HOST);

read
----
Reads a value of the specified path and passes the value to the callback.

	con.read("/10.E89C8A020800/temperature", function(err, result){
		console.log(result);
	})

write
-----
Writes a value to the specified path and passes the raw owserver message to the callback.

	con.write("/10.E89C8A020800/temperature",1,function(err, message){
		console.log(message)
	})

Directory listings
------------------
According to [OWFS message types](http://owfs.org/index.php?page=owserver-message-types) there are several methods for directory listings. They all have the same argument list but behave a bit different.

Lists all the children of the supplied path as an array passed to the callback.

	con.dir("/",function(err, directories){
		console.log(directories);
	})

	con.dirall("/",function(err, directories){
		console.log(directories);
	})

	con.get("/",function(err, directories){
		console.log(directories);
	})

	con.dirallslash("/",function(err, directories){
		console.log(directories);
	})

	con.getslash("/",function(err, directories){
		console.log(directories);
	})

Debug
=====
We are using [debug](https://github.com/visionmedia/debug) for debugging output. If you are using owfs in your app, start the debug mode like this:

	DEBUG=owfs* node app.js
	
Debug
=====
We are using [debug](https://github.com/visionmedia/debug) for debugging output. If you are using owfs in your app, start the debug mode like this:

	DEBUG=owfs* node app.js
	

Contributing
============

Bug reports and pull requests are welcome on GitHub at https://github.com/njh/node-owfs.

Please run ```npm test``` before submitting a Pull Request and add tests for any new functionality.

This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


License
=======

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

