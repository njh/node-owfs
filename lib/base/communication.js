var net = require('net'),
    ntohl = require('network-byte-order').ntohl,
    htonl = require('network-byte-order').htonl,
    logger = require('winston'),
    buffertools = require('buffertools');

var header_props = ["version","payload", "ret", "controlflags", "size", "offset"];

function sendCommandToSocket(options,socket, callback){
    var messages = [];
    var path = options.path;
    var called = false;
    function callbackOnce(error, data){
        if(!called){
            callback(error,data);
            called = true;
        }
    }
    socket.on('error', function(error){
        logger.error(error);
        callbackOnce(error);
    });
    socket.on('end', function(){
        callbackOnce(null,messages);
    });
    socket.on('data', function (data) {
        var i,j=0,chunk = 4;
        var header ={};
        for (i=0; i<24; i+=chunk) {
            var value = ntohl(data,i);
            header[header_props[j]] = value;
            j++;
        }
        var payload = data.slice(24).toString('utf8');
        var message = {
            header: header,
            payload: payload
        };
        logger.log('debug', "Receiving header",header);
        logger.log('debug', "Receiving payload",payload);
        if(header.ret < 0){
            callbackOnce({msg: "Communication Error. Received "+header.ret, header:header, options:options});
        }
        messages.push(message);  
    });
    socket.connect(options.port, options.server, function() {
        logger.debug("Sending",options);
        var data_len = 8192;
        var msg = new Buffer(24);
        htonl(msg,0,0);           //version
        htonl(msg,4,path.length+1); //payload length
        htonl(msg,8,options.command);    //type of function call -> http://owfs.org/index.php?page=owserver-message-types
        htonl(msg,12,0x00000020);         //format flags -- 266 for alias upport
        htonl(msg,16,data_len);    //size of data element for read or write
        htonl(msg,20,0);  
        var bres = buffertools.concat(msg, path+'\x00');
        socket.end(bres);
    });
}

function sendCommand(options, callback){
    var socket = new net.Socket({type:'tcp4'});
    sendCommandToSocket(options, socket, callback);
}

module.exports.sendCommand = sendCommand;
module.exports.sendCommandToSocket = sendCommandToSocket;