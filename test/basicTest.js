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
		sendCommandStub.callsArgWith(1, null,[{
			payload: value
		}]);
	}

	describe('Constructor', function(){
		it('should use host and port parameter', function(done){
			communicationRead('23');
			var client = new Client("blablub", 1111);
			client.read('/some/path', function(error, value) {
				assert.ok(!error);
				assert.equal(value, 23);
				sinon.assert.calledWith(sendCommandStub, sinon.match({ command: 2, server:"blablub", port:1111, path:"/some/path" }));
				done();
			});
		});
		it('should use default port 4304', function(done){
			communicationRead('23');
			var client = new Client("blablub");
			client.read('/some/path', function(error, value) {
				assert.ok(!error);
				assert.equal(value, 23);
				sinon.assert.calledWith(sendCommandStub, sinon.match({ command: 2, server:"blablub", port:4304, path:"/some/path" }));
				done();
			});
		});
	});

	describe('#read()', function() {
		it('should read an integer', function(done) {
			communicationRead('10');
			owfs.read('/some/path', function(error, value) {
				assert.ok(!error);
				assert.equal(value, 10);
				done();
			});
		});
		it('should read an decimal', function(done) {
			communicationRead('3.3434');
			owfs.read('/some/path', function(error, value) {
				assert.ok(!error);
				assert.equal(value, 3.3434);
				done();
			});
		});
	});

});