var assert = require("assert"),
	sinon = require("sinon"),
	proxyquire = require('proxyquire');

var payloadResult = '/01.A7F1D92A82C8\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0011\u0000\u0000\u0000\u0000\u0000\u0000\u0000 \u0000\u0000\u0000\u0010\u0000\u0000\u0000\u0000/10.D8FE434D9855\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0011\u0000\u0000\u0000\u0000\u0000\u0000\u0000 \u0000\u0000\u0000\u0010\u0000\u0000\u0000\u0000/22.8CE2B3471711\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0011\u0000\u0000\u0000\u0000\u0000\u0000\u0000 \u0000\u0000\u0000\u0010\u0000\u0000\u0000\u0000/29.98542F112D05\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000 \u0000\u0000\u0000\u0000\u0000\u0000';
var payload2 = '/10.A7F1D92A82C8,/10.D8FE434D9855,/10.8CE2B3471711,/10.98542F112D05,/10.58F56BD68807,/10.999248336241';

var communicationStub = {};
var Client = proxyquire('../build/owfs', {
	'./base/communication': communicationStub
}).Client;
var sendCommandStub;
var owfs = new Client("blablub", 4304);

function stubWithPayload(payload) {
	return function() {
		sendCommandStub = sinon.stub(communicationStub, "sendCommand");
		sendCommandStub.callsArgWith(1, null, [{
			payload: payload
		}]);
	};
}

function restore(){
	return function(){
		sendCommandStub.restore();
	};
}

var listingCommands = {
	"dir": 4,
	"dirall": 7,
	"get": 8,
	"dirallslash": 9,
	"getslash": 10
};
Object.keys(listingCommands).forEach(function(command) {
	describe('#' + command + '()', function() {
		before(stubWithPayload(payloadResult));
		after(restore());
		var fun = listingCommands[command];
		it('should send (' + fun + ') command', function(done) {
			owfs[command]("/some/path", function() {
				done();
			});
			assert.ok(sendCommandStub.called);
			sinon.assert.calledWith(sendCommandStub, sinon.match({
				command: fun,
				server: "blablub",
				port: 4304,
				path: "/some/path"
			}));
		});

		it(command + ' should pass 4 directories to callback', function() {
			owfs[command]("/some/path", function(error, directories) {
				assert.ok(!error);
				assert.ok(directories, "directories");
				assert.equal(directories.length, 4);
			});
		});
	});
	describe('#' + command + '() with 2nd payload', function() {
		before(stubWithPayload(payload2));
		after(restore());
		it(command+' should pass 6 directories to callback', function(){
			owfs[command]("/some/path", function(error, directories) {
				assert.ok(!error);
				assert.ok(directories, "directories");
				assert.equal(directories.length, 6);
			});
		});
	});
});