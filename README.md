owfs
====

A node.js client library to owserver (Documentation & protocol specs at http://www.owfs.org)
Currently supported operations: dir, read and write

Installation
============
	npm install owfs

Examples
========

First of all you need a connection to a running owserver:

	var Client = require("owfs").Client;
	var con = new Client(HOST,PORT);

dir
---
Lists all the children of the supplied path as an array passed to the callback.

	con.dir("/",function(directories){
		console.log(directories);
	})

read
----
Reads a value of the specified path and passes the value to the callback.

	con.read("/10.E89C8A020800/temperature", function(result){
		console.log(result);
	})

write
-----
Writes a value to the specified path and passes the raw owserver message to the callback.

	con.write("/10.E89C8A020800/temperature",1,function(message){
		console.log(message)
	})