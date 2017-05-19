'use strict';

var assert = require('assert');
var net = require('net');
var Client = require('../lib/owfs').Client;
var spawn = require('child_process').spawn;

function startTestServer(port, devices, callback) {
    if (Array.isArray(devices)) {
        devices = devices.join(',');
    }

    var server = spawn('owserver', [
        '--foreground',
        '--nozero',
        '--Celsius',
        '--port=127.0.0.1:'+port,
        '--error_print=2',
        '--tester='+devices
    ], {
        'stdio': 'inherit'
    });

    // Wait for the server to start accepting connections
    var count = 0;
    var timer = setInterval(function () {
        count += 1;
        var socket = new net.Socket();
        socket.connect({
            'host': '127.0.0.1',
            'port': port,
            'timeout': 5
        }, function () {
            // Successfully connected
            socket.end();
            clearInterval(timer);
            callback();
        });

        socket.on('error', function (err) {
            console.log('Waiting longer for test server to start: '+err);
            if (count > 5) {
                throw new Error('Failed to connect to owserver after '+count+' attempts');
            }
        });
    }, 10);

    server.on('error', function (err) {
        throw new Error('owserver error: '+err);
    });

    return server;
}


describe('Integration Test', function () {
    var server;
    var port = 43041;
    before(function (done) {
        server = startTestServer(port, ['DS18B20', 'DS2413', 'DS2408'], done);
    });

    after(function () {
        server.kill('SIGTERM');
    });

    it('should read a list of directories', function (done) {
        var client = new Client('127.0.0.1', port);
        client.dirall('/', function(err, result) {
            assert.equal(err, undefined);
            assert.deepEqual(result, [
                '/28.000028D70000',
                '/3A.00003AC50100',
                '/29.000029D60200'
            ]);
            done();
        });
    });

    it('should read a temperature from a DS18B20 device', function (done) {
        var client = new Client('127.0.0.1', port);
        client.read('/28.000028D70000/temperature', function(err, result) {
            assert.equal(err, undefined);
            assert.equal(result, '4');
            done();
        });
    });

    it('should write a 1-byte payload to a DS2413 device', function (done) {
        var client = new Client('127.0.0.1', port);
        client.write('/3A.00003AC50100/PIO.A', 1, function(err, result) {
            assert.equal(err, undefined);
            assert.equal(result.length, 1);
            assert.equal(result[0].header.ret, 0);
            assert.equal(result[0].header.size, 1);
            done();
        });
    });

    it('should write a 3-byte payload to a DS2408 device', function (done) {
        var client = new Client('127.0.0.1', port);
        client.write('/29.000029D60200/PIO.BYTE', 255, function(err, result) {
            assert.equal(err, undefined);
            assert.equal(result.length, 1);
            assert.equal(result[0].header.ret, 0);
            assert.equal(result[0].header.size, 3);
            done();
        });
    });

    it('should return an error for a non-existant device', function (done) {
        var client = new Client('127.0.0.1', port);
        client.read('/28.000028D80000/temperature', function(err, result) {
            assert(err.msg.match(/Communication Error/));
            assert.equal(err.header.ret, -1);
            assert.equal(result, undefined);
            done();
        });
    });

    it('should return an error for badly named device', function (done) {
        var client = new Client('127.0.0.1', port);
        client.read('foo/bar', function(err, result) {
            assert(err.msg.match(/Communication Error/));
            assert.equal(err.header.ret, -1);
            assert.equal(result, undefined);
            done();
        });
    });

});
