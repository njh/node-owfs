'use strict';

var assert = require('assert');
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
                0x00, 0x00, 0x01, 0x28,   // Format flags
                0x00, 0x00, 0x20, 0x00,   // Expected size of data
                0x00, 0x00, 0x00, 0x00,   // Offset for read or write
                0x2f, 0x73, 0x6f, 0x6d, 0x65, 0x2f, 0x70, 0x61, 0x74, 0x68, 0x00
            ]);
            mock.expects('end').once().withExactArgs(expect);

            sendCommandToSocket(options, socket, function() {});

            mock.verify();
        });

        it('should send a payload with the command, if given', function () {
            var options = {
                path: '/some/path',
                payload: '255',
                command: 3,
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
                0x00, 0x00, 0x00, 0x0e,   // Length (in bytes) of payload data
                0x00, 0x00, 0x00, 0x03,   // Type of function call
                0x00, 0x00, 0x01, 0x28,   // Format flags
                0x00, 0x00, 0x00, 0x03,   // Expected size of data
                0x00, 0x00, 0x00, 0x00,   // Offset for read or write
                0x2f, 0x73, 0x6f, 0x6d, 0x65, 0x2f, 0x70, 0x61, 0x74, 0x68, 0x00,
                0x32, 0x35, 0x35
            ]);
            mock.expects('end').once().withExactArgs(expect);

            sendCommandToSocket(options, socket, function() {});

            mock.verify();
        });

        it('should handle parsing of a single response message', function (done) {
            var options = {
                path: '/some/path',
                command: 2,
                server: '127.0.0.1',
                port: 4304
            };

            var socket = new net.Socket();
            var response = new Buffer([
                0x00, 0x00, 0x00, 0x00,   // Protocol Version
                0x00, 0x00, 0x00, 0x0c,   // Length (in bytes) of payload data
                0x00, 0x00, 0x00, 0x0c,   // Return Code
                0x00, 0x00, 0x00, 0x20,   // Format flags
                0x00, 0x00, 0x00, 0x0c,   // Size of data
                0x00, 0x00, 0x00, 0x00,   // Offset for read or write
                0x20, 0x20, 0x20, 0x20, 0x20, 0x31, 0x37, 0x2e, 0x38, 0x31, 0x32, 0x35
            ]);
            sinon.stub(socket, 'connect', function() {
                socket.emit('data', response);
                socket.emit('end');
            });

            sendCommandToSocket(options, socket, function(err, messages) {
                assert.equal(err, undefined);
                assert.equal(messages.length, 1);

                assert.equal(messages[0].header.version, 0x00);
                assert.equal(messages[0].header.payload, 0x0c);
                assert.equal(messages[0].header.ret, 0x0c);
                assert.equal(messages[0].header.controlflags, 0x20);
                assert.equal(messages[0].header.size, 0x0c);
                assert.equal(messages[0].header.offset, 0x00);
                assert.equal(messages[0].payload, '     17.8125');
                done();
            });
        });

        it('should handle parsing of a directory response message', function (done) {
            var options = {
                path: '/',
                command: 7,
                server: '127.0.0.1',
                port: 4304
            };

            var socket = new net.Socket();
            var response = new Buffer([
                0x00, 0x00, 0x00, 0x00,   // Protocol Version
                0x00, 0x00, 0x00, 0x22,   // Length (in bytes) of payload data
                0x00, 0x00, 0x00, 0x00,   // Return Code
                0x00, 0x00, 0x00, 0x20,   // Format flags
                0x00, 0x00, 0x00, 0x21,   // Size of data
                0x00, 0x00, 0x80, 0x02,   // Offset for read or write
                0x2f, 0x32, 0x38, 0x2e, 0x30, 0x30, 0x30, 0x30, 0x32, 0x38,
                0x44, 0x37, 0x30, 0x30, 0x30, 0x30, 0x2c, 0x2f, 0x32, 0x38,
                0x2e, 0x30, 0x30, 0x30, 0x30, 0x32, 0x38, 0x44, 0x37, 0x30,
                0x31, 0x30, 0x30, 0x00,
            ]);
            sinon.stub(socket, 'connect', function() {
                socket.emit('data', response);
                socket.emit('end');
            });

            sendCommandToSocket(options, socket, function(err, messages) {
                assert.equal(err, undefined);
                assert.equal(messages.length, 1);

                assert.equal(messages[0].header.version, 0x00);
                assert.equal(messages[0].header.payload, 0x22);
                assert.equal(messages[0].header.ret, 0x00);
                assert.equal(messages[0].header.controlflags, 0x20);
                assert.equal(messages[0].header.size, 0x21);
                assert.equal(messages[0].header.offset, 0x8002);
                assert.equal(messages[0].payload, '/28.000028D70000,/28.000028D70100\0');
                done();
            });
        });

        it('should handle multiple empty messages before a response message', function (done) {
            var options = {
                path: '/some/path',
                command: 2,
                server: '127.0.0.1',
                port: 4304
            };

            var socket = new net.Socket();
            var empty = new Buffer([
                0x00, 0x00, 0x00, 0x00,   // Protocol Version
                0xff, 0xff, 0xff, 0xff,   // Length (in bytes) of payload data
                0x00, 0x00, 0x00, 0x00,   // Return Code
                0x00, 0x00, 0x00, 0x00,   // Format flags
                0x00, 0x00, 0x00, 0x00,   // Size of data
                0x00, 0x00, 0x00, 0x00    // Offset for read or write
            ]);
            var response = new Buffer([
                0x00, 0x00, 0x00, 0x00,   // Protocol Version
                0x00, 0x00, 0x00, 0x0c,   // Length (in bytes) of payload data
                0x00, 0x00, 0x00, 0x0c,   // Return Code
                0x00, 0x00, 0x00, 0x20,   // Format flags
                0x00, 0x00, 0x00, 0x0c,   // Size of data
                0x00, 0x00, 0x00, 0x00,   // Offset for read or write
                0x20, 0x20, 0x20, 0x20, 0x20, 0x31, 0x37, 0x2e, 0x38, 0x31, 0x32, 0x35
            ]);
            sinon.stub(socket, 'connect', function() {
                socket.emit('data', empty);
                socket.emit('data', empty);
                socket.emit('data', response);
                socket.emit('end');
            });

            sendCommandToSocket(options, socket, function(err, messages) {
                assert.equal(err, undefined);
                assert.equal(messages.length, 3);

                assert.equal(messages[0].header.version, 0);
                assert.equal(messages[0].header.payload, -1);
                assert.equal(messages[0].header.ret, 0);
                assert.equal(messages[0].header.controlflags, 0);
                assert.equal(messages[0].header.size, 0);
                assert.equal(messages[0].header.offset, 0);
                assert.equal(messages[0].payload, null);

                assert.equal(messages[2].header.version, 0);
                assert.equal(messages[2].header.payload, 0x0c);
                assert.equal(messages[2].header.ret, 0x0c);
                assert.equal(messages[2].header.controlflags, 0x20);
                assert.equal(messages[2].header.size, 0x0c);
                assert.equal(messages[2].header.offset, 0x00);
                assert.equal(messages[2].payload, '     17.8125');
                done();
            });
        });

        it('should handle parsing of an error message', function (done) {
            var options = {
                path: '/some/path',
                command: 2,
                server: '127.0.0.1',
                port: 4304
            };

            var socket = new net.Socket();
            var response = new Buffer([
                0x00, 0x00, 0x00, 0x00,   // Protocol Version
                0x00, 0x00, 0x00, 0x00,   // Length (in bytes) of payload data
                0xff, 0xff, 0xff, 0xff,   // Return Code
                0x00, 0x00, 0x00, 0x00,   // Format flags
                0x00, 0x00, 0x00, 0x00,   // Size of data
                0x00, 0x00, 0x00, 0x00,   // Offset for read or write
            ]);
            sinon.stub(socket, 'connect', function() {
                socket.emit('data', response);
                socket.emit('end');
            });

            sendCommandToSocket(options, socket, function(err, messages) {
                assert.equal(messages, undefined);

                assert(err !== undefined);
                assert.equal(err.msg, 'Communication Error. Received -1');
                assert.equal(err.header.ret, -1);
                assert.equal(err.header.controlflags, 0);
                assert.equal(err.header.size, 0);
                assert.equal(err.header.offset, 0);
                done();
            });
        });

        it('should pass socket errors to the callback handler', function (done) {
            var options = {
                path: '/some/path',
                command: 2,
                server: '127.0.0.1',
                port: 4304
            };

            var socket = new net.Socket();
            sinon.stub(socket, 'connect', function() {
                socket.emit('error', new Error('the was an error'));
            });

            sendCommandToSocket(options, socket, function(err, messages) {
                assert.equal(messages, undefined);

                assert.equal(typeof err, 'object');
                assert.equal(err.name, 'Error');
                assert.equal(err.message, 'the was an error');
                done();
            });
        });

    });

});
