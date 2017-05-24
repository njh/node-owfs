'use strict';

var net = require('net');

var ntohl = require('network-byte-order').ntohl;
var htonl = require('network-byte-order').htonl;

var debug = require('debug')('owfs:communication');

var headerProps = ['version', 'payload', 'ret', 'controlflags', 'size', 'offset'];
var headerLength = 24;

// The values in the flag header are documented here:
// http://owfs.org/index.php?page=owserver-flag-word
var flags = {
    request:  0x00000100,
    uncached: 0x00000020,
    safemode: 0x00000010,
    alias:    0x00000008,
    persist:  0x00000004,
    busRet:   0x00000002
};

var sendCommandToSocket = function (options, socket, callback) {
    var buffers = [];
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
        callbackOnce(error);
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
                var payload = buffer.slice(headerLength,headerLength+header.payload).toString('utf8');
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
                buffer = buffer.slice(headerLength);
            }
        }
        callbackOnce(null, messages);
    });

    socket.on('data', function (data) {
        debug('Socket.on data data.length', data.length);
        buffers.push(data);
    });

    socket.on('connect', function () {
        debug('Sending', options);

        var bodyLength = options.path.length + 1;
        var dataLength = 8192;
        if (options.payload) {
            dataLength = options.payload.length;
            bodyLength += dataLength;
        }

        var msg = new Buffer(headerLength + bodyLength);
        htonl(msg, 0, 0);
        htonl(msg, 4, bodyLength);
        htonl(msg, 8, options.command);
        htonl(msg, 12, flags.request | flags.uncached | flags.alias);
        htonl(msg, 16, dataLength);
        htonl(msg, 20, 0);

        var bytesWritten = headerLength;
        bytesWritten += msg.write(options.path, bytesWritten);
        bytesWritten += msg.write('\x00', bytesWritten);
        if (options.payload) {
            msg.write(options.payload, bytesWritten);
        }

        socket.end(msg);
    });

    return socket.connect(options.port, options.server);
};

exports.sendCommandToSocket = sendCommandToSocket;

exports.sendCommand = function (options, callback) {
    var socket = new net.Socket();

    return sendCommandToSocket(options, socket, callback);
};

