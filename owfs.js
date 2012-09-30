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




var header_props = ["version","payload", "ret", "controlflags", "size", "offset"];


function Client(server, port){
    if(false === (this instanceof Client)) {
        return new Client();
    }
    
    //events.EventEmitter.call(this);
    this._server = server;
    this._port = port;
}
//sys.inherits(Client, events.EventEmitter);

function _send(path,fun, callback){
    var socket = new net.Socket({type:'tcp4'});
    var _self = this;
    var messages = [];
    socket.on('error', function(error){
        console.log(error);
    })
    socket.on('end', function(e){
        callback(messages);
    })
    socket.on('data', function (data) {
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
            payload: payload.toString('utf8')
        }
        messages.push(message);  
    });
    socket.connect(this._port, this._server, function() {
        var data_len = 8192;
        var msg =[];
        msg = msg.concat(htonl(0));           //version
        msg = msg.concat(htonl(path.length+1)); //payload length
        msg = msg.concat(htonl(fun));    //type of function call -> http://owfs.org/index.php?page=owserver-message-types
        msg = msg.concat(htonl(0x00000020));         //format flags -- 266 for alias upport
        msg = msg.concat(htonl(data_len));    //size of data element for read or write
        msg = msg.concat(htonl(0));  
        var bres = buffertools.concat(new Buffer(msg), path+'\x00');
        socket.end(bres);
    });
}


Client.prototype.read = function(path, callback){
    _send.call(this,path,2,function(messages){
        var messageToUse = messages.filter(function(message){
            return message.header.payload > 0;
        })
        var result = messageToUse[0].payload.replace(new RegExp(" ", "g"), "");
        callback(result);
    });
}

Client.prototype.write = function(path, payload, callback){
    _send.call(this, path+"\u0000"+payload,3, callback);
}

Client.prototype.dir = function(path, callback){
    var directories = []
    _send.call(this,path,7,function(messages){
        messages.forEach(function(message){
            var lines = message.payload.split(" ")
            var temp = lines.map(function(line){
                return line.replace(new RegExp("[\u0000-\u001F]", "g"), "");
            }).forEach(function(line){
                if(line){
                    directories.push(line);
                }
            })
        });
        callback(directories);
    });
}

exports.Client = Client;
