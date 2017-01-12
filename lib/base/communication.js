'use strict';

var net = require('net');

var ntohl = require('network-byte-order').ntohl;
var htonl = require('network-byte-order').htonl;

var debug = require('debug')('owfs:communication');

var headerProps = ['version', 'payload', 'ret', 'controlflags', 'size', 'offset'];

var sendCommandToSocket = function (options, socket, callback) {
    var messages = [];
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
        return callbackOnce(null, messages);
    });

    socket.on('data', function (data) {
        var header = {};
        for (var i = 0; i < headerProps.length; i++) {
            var prop = headerProps[i];
            header[prop] = ntohl(data, i * 4);
        }
        var payload = data.slice(24).toString('utf8');
        debug('Receiving header', header);
        debug('Receiving payload', payload);
        if (header.ret < 0) {
            callbackOnce({
                msg: 'Communication Error. Received ' + header.ret,
                header: header,
                options: options
            });
        }
        return messages.push({
            header: header,
            payload: payload
        });
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

