var Client = require("./owfs").Client;
var net = require("net");

var HOST = 'raspberrypi';
var PORT = 4304;
var c = new Client(HOST, PORT);

/*c.dir('/10.E89C8A020800', function(result){
	console.log(result);
});*/
/*c.write('/10.E89C8A020800/temperature', 1, function(result){
	console.log(result);
});*/
c.read('/10.E89C8A020800/temperature', function(result){
	console.log(result);
});
