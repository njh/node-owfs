'use strict';

var debug = require('debug')('owfs:convert');

exports.preparePayload = function (payload) {
    if (payload === true) {
        return '1';
    } else if (payload === false) {
        return '0';
    } else {
        return payload.toString();
    }
};

exports.extractValue = function (callback) {
    return function (error, messages) {
        if (!error) {
            var messageToUse;
            if (messages.length > 1) {
                debug('Received multiple messages in simple read', messages);
                messageToUse = messages.filter(function (message) {
                    debug('Checking Header payload > 0', message.header.payload);
                    return message.header.payload > 0;
                });
            } else {
                messageToUse = messages;
            }
            debug('message to use', messageToUse);
            if (messageToUse.length > 0) {
                var result = messageToUse[0].payload.replace(new RegExp(' ', 'g'), '');
                return callback(error, result);
            } else {
                return callback({
                    msg: 'No usable messages received, but no error returned.'
                });
            }
        } else {
            return callback(error);
        }
    };
};

var extractDirectoriesFromMessage = function (message) {
    if (message.payload) {
        var exp = new RegExp('[\u0000-\u001F]', 'g');
        var lines = message.payload.replace(exp, '').split(' ');
        lines = lines.filter(function (line) {
            return !!line;
        });
        return lines.join(',').split(',');
    } else {
        return [];
    }
};

exports.extractDirectories = function (callback) {
    debug('extractDirectories');
    return function (err, messages) {
        debug(messages);
        if (!err) {
            var directories = messages.map(extractDirectoriesFromMessage);
            var _ref;
            debug('extracted directories', directories);
            return callback(err, (_ref = []).concat.apply(_ref, directories));
        } else {
            return callback(err);
        }
    };
};
