var net = require('net'),
    sys = require('sys'),
    events = require('events'),
    ntohl = require('network-byte-order').ntohl,
    htonl = require('network-byte-order').htonl;
require('buffertools');

var header_props = ["version","payload", "ret", "controlflags", "size", "offset"];


function Client(server, port){
    if(false === (this instanceof Client)) {
        return new Client();
    }
    
    this._server = server;
    this._port = port;
}

function _send(path,fun, callback){
    var socket = new net.Socket({type:'tcp4'});
    var messages = [];
    socket.on('error', function(error){
        console.log(error);
    });
    socket.on('end', function(e){
        callback(messages);
    });
    socket.on('data', function (data) {
        var i,j=0,chunk = 4;
        var header ={};
        for (i=0; i<24; i+=chunk) {
            var value = ntohl(data,i);
            header[header_props[j]] = value;
            j++;
        }
        var payload = data.slice(24);
        var message = {
            header: header,
            payload: payload.toString('utf8')
        };
        messages.push(message);  
    });
    socket.connect(this._port, this._server, function() {
        var data_len = 8192;
        var msg = new Buffer(24);
        htonl(msg,0,0);           //version
        htonl(msg,4,path.length+1); //payload length
        htonl(msg,8,fun);    //type of function call -> http://owfs.org/index.php?page=owserver-message-types
        htonl(msg,12,0x00000020);         //format flags -- 266 for alias upport
        htonl(msg,16,data_len);    //size of data element for read or write
        htonl(msg,20,0);  
        var bres = buffertools.concat(msg, path+'\x00');
        socket.end(bres);
    });
}

function _dir(method, path, callback){
    var directories = [];
    _send.call(this,path,method,function(messages){
        messages.forEach(function(message){
            var lines = message.payload.split(" ");
            var temp = lines.map(function(line){
                return line.replace(new RegExp("[\u0000-\u001F]", "g"), "");
            }).forEach(function(line){
                if(line){
                    directories = directories.concat(line.split(","));
                }
            });
        });
        callback(directories);
    });
}


Client.prototype.read = function(path, callback){
    _send.call(this,path,2,function(messages){
        var messageToUse;
        if(messages.length > 1){
            //Sometimes there are multiple result packages. I don't know why!
            messageToUse = messages.filter(function(message){
                return message.header.payload > 0;
            })[0];
        } else {
            messageToUse = messages[0];
        }
        var result = messageToUse.payload.replace(new RegExp(" ", "g"), "");
        callback(result);
    });
};

Client.prototype.write = function(path, payload, callback){
    _send.call(this, path+"\u0000"+payload,3, callback);
};
Client.prototype.dir = function(path, callback){
    _dir.call(this,4,path,callback);
};

Client.prototype.dirall = function(path, callback){
    _dir.call(this,7,path,callback);
};
Client.prototype.get = function(path, callback){
    _dir.call(this,8,path,callback);
};

Client.prototype.dirallslash = function(path, callback){
    _dir.call(this,9,path,callback);
};

Client.prototype.getslash = function(path, callback){
    _dir.call(this,10,path,callback);
};

exports.Client = Client;
