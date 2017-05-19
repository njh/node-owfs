'use strict';

var convert = require('../lib/base/convert');
var assert = require('assert');

var wrong = {
    header: {
        version: 0,
        payload: -1,
        ret: 0,
        controlflags: 0,
        size: 0,
        offset: 0
    },
    payload: ''
};

var withoutPayload = {
    header: {
        version: 0,
        payload: -1,
        ret: 0,
        controlflags: 0,
        size: 0,
        offset: 0
    }
};

var correct = {
    header: {
        version: 0,
        payload: 12,
        ret: 12,
        controlflags: 32,
        size: 12,
        offset: 0
    },
    payload: '      22.375'
};

describe('Convert Tests', function () {

    describe('preparePayload', function () {
        it('short convert true to the string "1"', function () {
            assert.equal(convert.preparePayload(true), '1');
        });

        it('short convert false to the string "0"', function () {
            assert.equal(convert.preparePayload(false), '0');
        });

        it('short convert 1 to the string "1"', function () {
            assert.equal(convert.preparePayload(1), '1');
        });

        it('short convert 0 to the string "0"', function () {
            assert.equal(convert.preparePayload(0), '0');
        });
    });

    describe('extractValue', function () {
        it('should extract the value from one correct and one wrong message', function (done) {
            var messages = [correct, wrong];
            convert.extractValue(function(err, result) {
                assert.equal(err, undefined);
                assert.equal(result, 22.375);
                done();
            })(null, messages);
        });

        it('should extract the value from one wrong and one correct message', function (done) {
            var messages = [wrong, correct];
            convert.extractValue(function(err, result) {
                assert.equal(err, undefined);
                assert.equal(result, 22.375);
                done();
            })(null, messages);
        });

        it('should extract the value from a message with undefined payload and one correct message', function (done) {
            var messages = [withoutPayload, correct];
            convert.extractValue(function(err, result) {
                assert.equal(err, undefined);
                assert.equal(result, 22.375);
                done();
            })(null, messages);
        });

        it('should pass an error to callback when there are no usable messages', function (done) {
            var messages = [withoutPayload, withoutPayload];
            convert.extractValue(function(err, result) {
                assert.equal(err.msg, 'No usable messages received, but no error returned.');
                assert.equal(result, undefined);
                done();
            })(null, messages);
        });

        it('should pass an error to callback when there was an error', function (done) {
            var messages = [];
            var error = new Error('there was an error');
            convert.extractValue(function(err, result) {
                assert.equal(err.message, 'there was an error');
                assert.equal(result, undefined);
                done();
            })(error, messages);
        });
    });

    describe('extractDirectories', function () {
        it('should extract a list of directories', function (done) {
            var messages = [{
                header: {
                    version: 0,
                    payload: 12,
                    ret: 12,
                    controlflags: 32,
                    size: 12,
                    offset: 0
                },
                payload: '/28.000028D70000,/3A.00003AC50100'
            }];
            convert.extractDirectories(function(err, result) {
                assert.equal(err, undefined);
                assert.deepEqual(result, [ '/28.000028D70000', '/3A.00003AC50100' ]);
                done();
            })(null, messages);
        });

        it('should pass an error to callback when there was an error', function (done) {
            var messages = [];
            var error = new Error('there was an error');
            convert.extractDirectories(function(err, result) {
                assert.equal(err.message, 'there was an error');
                assert.equal(result, undefined);
                done();
            })(error, messages);
        });

    });

});
