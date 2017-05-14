'use strict';

var sinon = require('sinon');
var net = require('net');
var sendCommandToSocket = require('../lib/base/communication').sendCommandToSocket;


// Monkey patch to help with debugging Buffer comparison assertions
(function(BufferToString) {
    Buffer.prototype.toString = function(encoding) {
        if (encoding === undefined) {
            var array = [];
            for (var i = 0; i < this.length; i++) {
                var hex = this[i].toString(16);
                if (this[i] < 0x10) {
                    hex = '0' + hex;
                }
                array.push('0x' + hex);
            }
            return '[' + array.join(', ') + ']';
        } else {
            return BufferToString.apply(this, arguments);
        }
    };
})(Buffer.prototype.toString);


describe('Communication Test', function () {
    beforeEach(function() {
        var version = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
        if (version < 4.0) {
            // These tests erroneously fails on old versions of node.js
            this.skip();
        }
    });

    describe('sending a command', function () {

        it('should open a connection to the server', function () {
            var options = {
                server: '127.0.0.1',
                port: 4304
            };
            var socket = new net.Socket();
            var mock = sinon.mock(socket);
            mock.expects('connect').once().withExactArgs(4304, '127.0.0.1');

            sendCommandToSocket(options, socket, function() {});
            
            mock.verify();
        });

        it('should send a command to the server once connected', function () {
            var options = {
                path: '/some/path',
                command: 2,
                data_len: 8192,
                server: '127.0.0.1',
                port: 4304
            };
            var socket = new net.Socket();
            var mock = sinon.mock(socket);
            sinon.stub(socket, 'connect', function() {
                socket.emit('connect');
            });

            var expect = new Buffer([
                0x00, 0x00, 0x00, 0x00,   // Protocol Version
                0x00, 0x00, 0x00, 0x0b,   // Length (in bytes) of payload data
                0x00, 0x00, 0x00, 0x02,   // Type of function call
                0x00, 0x00, 0x00, 0x20,   // Format flags
                0x00, 0x00, 0x20, 0x00,   // Expected size of data 
                0x00, 0x00, 0x00, 0x00,   // Offset for read or write
                0x2f, 0x73, 0x6f, 0x6d, 0x65, 0x2f, 0x70, 0x61, 0x74, 0x68, 0x00
            ]);
            mock.expects('end').once().withExactArgs(expect);

            sendCommandToSocket(options, socket, function() {});
            
            mock.verify();
        });

    });

});
