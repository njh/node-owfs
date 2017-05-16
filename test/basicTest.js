'use strict';

var assert = require('assert');
var sinon = require('sinon');

var communicationStub = {
    sendCommand: function () {

    }
};

var Client = require('../lib/owfs').Client;
var sendCommandStub;

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
});

afterEach(function () {
    sandbox.restore();
});

function communicationRead (value) {
    sendCommandStub = sandbox.stub(communicationStub, 'sendCommand');
    sendCommandStub.callsArgWith(1, null, [{
        payload: value
    }]);
}

function communicationWrite (value) {
    sendCommandStub = sandbox.stub(communicationStub, 'sendCommand');
    sendCommandStub.callsArgWith(1, null, [{
        'header': {
            'version': 0,
            'payload': 0,
            'ret': 0,
            'controlflags': 32,
            'size': 1,
            'offset': 0
        },
        'payload': value
    }]);
}

describe('Basic Tests', function () {

    describe('Constructor', function () {
        it('should use host and port parameter', function (done) {
            communicationRead('23');
            var client = new Client('blablub', 1111, communicationStub);
            client.read('/some/path', function (error, value) {
                assert.ok(!error);
                assert.equal(value, 23);
                sinon.assert.calledWith(sendCommandStub, sinon.match({
                    command: 2,
                    server: 'blablub',
                    port: 1111,
                    path: '/some/path'
                }));
                done();
            });
        });

        it('should use default port 4304', function (done) {
            communicationRead('23');
            var client = new Client('blablub', null, communicationStub);
            client.read('/some/path', function (error, value) {
                assert.ok(!error);
                assert.equal(value, 23);
                sinon.assert.calledWith(sendCommandStub, sinon.match({
                    command: 2,
                    server: 'blablub',
                    port: 4304,
                    path: '/some/path'
                }));
                done();
            });
        });
    });

    describe('#read()', function () {
        var owfs = new Client('blablub', 4304, communicationStub);
        it('should read an integer', function (done) {
            communicationRead('10');
            owfs.read('/some/path', function (error, value) {
                assert.ok(!error);
                assert.equal(value, 10);
                done();
            });
        });

        it('should read an decimal', function (done) {
            communicationRead('3.3434');
            owfs.read('/some/path', function (error, value) {
                assert.ok(!error);
                assert.equal(value, 3.3434);
                done();
            });
        });
    });

    describe('#write()', function () {
        var owfs = new Client('blablub', 4304, communicationStub);
        it('should write an integer', function (done) {
            communicationWrite('');
            owfs.write('/some/path', 1, function (error, messages) {
                assert.ok(!error);
                assert.equal(messages[0].header.ret, 0);
                done();
            });
        });
    });

});
