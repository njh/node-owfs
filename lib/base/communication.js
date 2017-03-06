'use strict';

var net = require('net');

var ntohl = require('network-byte-order').ntohl;
var htonl = require('network-byte-order').htonl;

var debug = require('debug')('owfs:communication');

var headerProps = ['version', 'payload', 'ret', 'controlflags', 'size', 'offset'];
var headerLength = 24;

var sendCommandToSocket = function (options, socket, callback) {
    var buffers = [];
    var path = options.path;
    var called = false;

    var callbackOnce = function (error, data) {
        if (!called) {
            callback(error, data);
            called = true;
            return true;
        }
    };

    socket.on('error', function (error) {
        debug(error);
        return callbackOnce(error);
    });

    socket.on('end', function () {
        var messages = [];
        var buffer = Buffer.concat(buffers);
        debug('socket.on end, Total length', buffer.length);
        while (buffer.length >= headerLength) {
            var header = {};
            for (var i = 0; i < headerProps.length; i++) {
                var prop = headerProps[i];
                header[prop] = ntohl(buffer, i * 4);
            }
            debug('Extracted header', header);
            if (header.ret < 0) {
                callbackOnce({
                    msg: 'Communication Error. Received ' + header.ret,
                    header: header,
                    options: options
                });
            }
            if (header.payload > 0) {
                var payload = buffer.slice(24,24+header.payload).toString('utf8');
                debug('Extracted payload', payload);
                messages.push({
                    header: header,
                    payload: payload
                });
                break;
            } else {
                messages.push({
                    header: header,
                    payload: null
                });
                buffer = buffer.slice(24);
            }
        }
        return callbackOnce(null, messages);
    });

    socket.on('data', function (data) {
        debug('Socket.on data data.length', data.length);
        buffers.push(data);
        return;
    });

    return socket.connect(options.port, options.server, function () {
        debug('Sending', options);
        var msg = new Buffer(24 + path.length + 1);
        htonl(msg, 0, 0);
        htonl(msg, 4, path.length + 1);
        htonl(msg, 8, options.command);
        htonl(msg, 12, 0x00000020);
        htonl(msg, 16, options.data_len);
        htonl(msg, 20, 0);
        var bytesWritten = msg.write(path, 24);
        msg.write('\x00', 24 + bytesWritten);
        return socket.end(msg);
    });
};

exports.sendCommandToSocket = sendCommandToSocket;

exports.sendCommand = function (options, callback) {
    var socket = new net.Socket({
        type: 'tcp4'
    });

    return sendCommandToSocket(options, socket, callback);
};

