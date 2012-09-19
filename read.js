var net = require("net");

var HOST = 'raspberrypi';
var PORT = 4304;

var client = new net.Socket();

// Convert an integer to an array of "bytes" in network/big-endian order.
function htonl(n)
{
    // Mask off 8 bytes at a time then shift them into place
    return [
        (n & 0xFF000000) >>> 24,
        (n & 0x00FF0000) >>> 16,
        (n & 0x0000FF00) >>>  8,
        (n & 0x000000FF) >>>  0,
    ];
}
/*
error    = 0
    nop      = 1
    read     = 2
    write    = 3
    dir      = 4
    size     = 5
    presence = 6
*/

client.on('data', function(data) {
    
    console.log(data.toString());
  client.end();
    
});

client.on('error', function(error){
	console.log("error", error);
});

client.on('timeout', function(e){
	console.log("timeout", e);
});

client.on('close', function() {
    console.log('Connection closed');
});

client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    var path = '/bus.0/10.E89C8A020800/temperature';
    var fun = 2;
    var data_len = 8192;
    var msg =[];
    msg = msg.concat(htonl(0));           //version
   	msg = msg.concat(htonl(path.length+1)); //payload length
    msg = msg.concat(htonl(fun));    //type of function call
    msg = msg.concat(htonl(258));         //format flags -- 266 for alias upport
    msg = msg.concat(htonl(data_len));    //size of data element for read or write
    msg = msg.concat(htonl(0));  
    //];
    console.log(msg);
    client.write(new Buffer(msg));
    client.write(path+ '\x00');
    client.end();

});

