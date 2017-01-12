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

var check = function (done) {
    return function (err, result) {
        assert.equal(result, 22.375);
        return done();
    };
};

describe('extractValue', function () {
    it('should extract the value from one correct and one wrong message', function (done) {
        var messages = [correct, wrong];
        return convert.extractValue(check(done))(null, messages);
    });

    it('should extract the value from one wrong and one correct message', function (done) {
        var messages = [wrong, correct];
        return convert.extractValue(check(done))(null, messages);
    });

    return it('should extract the value from a message with undefined payload and one correct message', function (done) {
        var messages = [withoutPayload, correct];
        return convert.extractValue(check(done))(null, messages);
    });
});
