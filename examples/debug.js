var Client = require("../owfs").Client;
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

c.read('/10.67C6697351FF/temperature', function(result){
	console.log(result);
});

