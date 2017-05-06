/*

  Example of getting a single temperature from owserver.

*/

'use strict';

var Client = require('owfs').Client;
var client = new Client('localhost', 4304);

client.read('/28.C040C4030000/temperature', function(err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});
