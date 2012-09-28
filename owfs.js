var net = require('net'),
    sys = require('sys'),
    events = require('events');
require('buffertools');

var HOST = 'raspberrypi.fritz.box';
var PORT = 4304;

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

function ntohl(b){
      return ((0xff & b[0]) << 24) |
         ((0xff & b[1]) << 16) |
         ((0xff & b[2]) << 8) |
         ((0xff & b[3]));
}

function dataDecoder(data) {
    var i,j=0,temparray,chunk = 4;
    var header ={};
    for (i=0; i<24; i+=chunk) {
        temparray = data.slice(i,i+chunk);
        var value = ntohl(temparray);
        header[header_props[j]] = value;
        j++;
    }
    var payload = data.slice(24)
    var message = {
        header: header,
        payload: payload.toString()
    }
    this.emit("message", message);    
}


var header_props = ["version","payload", "ret", "controlflags", "size", "offset"];


function Client(server, port){
    if(false === (this instanceof Client)) {
        return new Client();
    }
    
    events.EventEmitter.call(this);
    this._server = server;
    this._port = port;
}
sys.inherits(Client, events.EventEmitter);


Client.prototype.read = function(path){
    var socket = new net.Socket({type:'tcp4'});
    var _self = this;
    socket.on('data', function(data){
        dataDecoder.apply(_self, [data]);
    });
    socket.connect(this._port, this._server, function() {
        /*
            error    = 0
            nop      = 1
            read     = 2
            write    = 3
            dir      = 4
            size     = 5
            presence = 6
        */
        var fun = 2;
        var data_len = 8192;
        var msg =[];
        msg = msg.concat(htonl(0));           //version
        msg = msg.concat(htonl(path.length+1)); //payload length
        msg = msg.concat(htonl(fun));    //type of function call
        msg = msg.concat(htonl(0x00000020));         //format flags -- 266 for alias upport
        msg = msg.concat(htonl(data_len));    //size of data element for read or write
        msg = msg.concat(htonl(0));  
        var bres = buffertools.concat(new Buffer(msg), path+'\x00');
        socket.end(bres);
    });
    //return eventEmitter;
}

exports.Client = Client;
