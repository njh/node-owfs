var Client = require("./owfs").Client;
var net = require("net");
var argv = require('optimist').argv;

var HOST = argv.host?argv.host:'raspberrypi';
var PORT = argv.port?argv.port:4304;
console.log("Connecting to "+HOST+":"+PORT);
var c = new Client(HOST, PORT);

c.dir('/', function(result){
	console.log(result);
	c.dir(result[0], function(res2){
		console.log(res2)
	})
});
/*
c.write('/simultaneous/temperature', 1, function(){
	setTimeout(function(){
		c.read('/10.E89C8A020800/temperature', function(result){
			console.log(result);
		});
	}, 1000);

});*/

