var Client = require("../lib/owfs").Client;
var net = require("net");
var argv = require('optimist').argv;

var HOST = argv.host?argv.host:'localhost';
var PORT = argv.port?argv.port:4304;
console.log("Connecting to "+HOST+":"+PORT);
var owfs = new Client(HOST, PORT);

owfs.dir('/', function(result){
	console.log("dir",result);
});

owfs.get('/', function(result){
	console.log("get",result);
});

owfs.getslash('/', function(result){
	console.log("getslash",result);
});

owfs.read('/10.A7F1D92A82C8/temperature', function(result){
	console.log("Result 1: "+result);
})

owfs.read('/10.A7F1D92A82C8/temperature', function(result){
	console.log("Result 2: "+result);
});


