var assert = require("assert"),
	sinon = require("sinon"),
	proxyquire = require('proxyquire');

describe('OWFS Client', function() {
	var communicationStub = {};
	var Client = proxyquire('../lib/owfs', {
		'./base/communication': communicationStub
	}).Client;
	var sendCommandStub;
	var owfs = new Client("blablub", 4304);

	var sandbox;
	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});


	function communicationRead(value) {
		sendCommandStub = sandbox.stub(communicationStub, "sendCommand");
		sendCommandStub.callsArgWith(1, [{
			payload: value
		}]);
	}

	describe('#read()', function() {
		it('should read an integer', function(done) {
			communicationRead('10');
			owfs.read('/some/path', function(value) {
				assert.equal(value, 10);
				done();
			});
		});
		it('should read an decimal', function(done) {
			communicationRead('3.3434');
			owfs.read('/some/path', function(value) {
				assert.equal(value, 3.3434);
				done();
			});
		});
	});

});