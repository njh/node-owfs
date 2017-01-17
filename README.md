[![Build Status](https://travis-ci.org/njh/node-owfs.png)](https://travis-ci.org/njh/node-owfs)
[![Dependencies](https://david-dm.org/njh/node-owfs.png)](https://david-dm.org/njh/node-owfs)

owfs
====

A [node.js] client library for 1-wire devices using the [owserver] protocol.

Installation
============

    npm install owfs

Examples
========

First of all you need a connection to a running owserver:

    var Client = require("owfs").Client;
    var con = new Client(HOST, PORT);

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

    con.write("/3A.378A06000000/PIO.A", 1, function(err, message){
        console.log(message)
    })

Directory listings
------------------
According to [OWFS message types](http://owfs.org/index.php?page=owserver-message-types) there are several methods for directory listings. They all have the same argument list but behave a bit different.

Lists all the children of the supplied path as an array passed to the callback.

    con.dir("/", function(err, directories){
        console.log(directories);
    })

    con.dirall("/", function(err, directories){
        console.log(directories);
    })

    con.get("/", function(err, directories){
        console.log(directories);
    })

    con.dirallslash("/", function(err, directories){
        console.log(directories);
    })

    con.getslash("/", function(err, directories){
        console.log(directories);
    })

Debug
=====
We are using [debug] for debugging output. If you are using owfs in your app, start the debug mode like this:

    DEBUG=owfs* node app.js

owserver Documentation
======================

* [owserver Command Manual](http://owfs.org/index.php?page=owserver)
* [OWFS Network Protocol](http://owfs.org/index.php?page=owserver-protocol)
* [OWFS Message Types](http://owfs.org/index.php?page=owserver-message-types)
* [Configuring owserver](http://owfs.org/index.php?page=configuration-file)


Contributing
============

Bug reports and pull requests are welcome on GitHub at https://github.com/njh/node-owfs.

Please run ```npm test``` before submitting a Pull Request and add tests for any new functionality.

This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant] code of conduct.


License
=======

The gem is available as open source under the terms of the [MIT License].


[node.js]:     https://nodejs.org/
[owserver]:    http://owfs.org/index.php?page=owserver
[debug]:       https://github.com/visionmedia/debug
[MIT License]: http://opensource.org/licenses/MIT
[Contributor Covenant]: http://contributor-covenant.org
