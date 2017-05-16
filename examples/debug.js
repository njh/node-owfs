/*
  Example of using node-owfs to connect to owserver.

  Uncomment the various sections below to try out the different owfs functions.
  By default it will connect to port 4304 on localhost
  or you can specify something else:

      node debug.js --host pi.example.com --port 1234

*/

'use strict';

var Client = require('../lib/owfs').Client;
var argv = require('optimist').argv;
var HOST = argv.host || 'localhost';
var PORT = argv.port || 4304;

console.log('Connecting to ' + HOST + ':' + PORT);
var owfs = new Client(HOST, PORT);

owfs.dirall('/', function(err, result) {
    if (err) {
        console.log('err: ' + err);
    } else {
        console.log('dirall: ' + result);
    }
});

/* owfs.get('/', function(err, result) {
    if (err) {
        console.log('err: ' + err);
    } else {
        console.log('get: ' + result);
    }
}); */

/* owfs.getslash('/', function(err, result) {
    if (err) {
        console.log('err: ' + err);
    } else {
        console.log('read: ' + result);
    }
}); */

/* owfs.read('/28.A7F1D92A82C8/temperature', function(err, result) {
    if (err) {
        console.log('err: ' + err);
    } else {
        console.log('read: ' + result);
    }
}); */
