var Client = require("./owfs").Client;
var net = require("net");

var HOST = 'raspberrypi';
var PORT = 4304;
var c = new Client(HOST, PORT);

c.read('/bus.0/10.E89C8A020800/temperature');
c.on("message", function(message){
	console.log("event",message);
})
