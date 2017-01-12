'use strict';

var basecommunication = require('./base/communication');
var convert = require('./base/convert');

exports.Client = (function () {
    function Client (server, port, communication) {
        this.server = server;
        this.port = port || 4304;
        this.communication = communication || basecommunication;
    }

    Client.prototype._dir = function (path, fun, callback) {
        var command = {
            path: path,
            command: fun,
            data_len: 8192,
            server: this.server,
            port: this.port
        };
        return this.communication.sendCommand(command, convert.extractDirectories(callback));
    };

    Client.prototype.read = function (path, callback) {
        var command = {
            path: path,
            command: 2,
            data_len: 8192,
            server: this.server,
            port: this.port
        };
        return this.communication.sendCommand(command, convert.extractValue(callback));
    };

    Client.prototype.write = function (path, payload, callback) {
        var command = {
            path: path + '\u0000' + payload,
            command: 3,
            data_len: payload.toString().length,
            server: this.server,
            port: this.port
        };
        return this.communication.sendCommand(command, callback);
    };

    Client.prototype.dir = function (path, callback) {
        return this._dir(path, 4, callback);
    };

    Client.prototype.dirall = function (path, callback) {
        return this._dir(path, 7, callback);
    };

    Client.prototype.get = function (path, callback) {
        return this._dir(path, 8, callback);
    };

    Client.prototype.dirallslash = function (path, callback) {
        return this._dir(path, 9, callback);
    };

    Client.prototype.getslash = function (path, callback) {
        return this._dir(path, 10, callback);
    };

    return Client;
})();
