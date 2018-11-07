'use strict'

var assert = require('assert')
var sinon = require('sinon')
var Client = require('../lib/owfs').Client
var debug = require('debug')

var payloadResult = {
  version: 0,
  payload: 0,
  ret: 0,
  controlflags: 0,
  size: 0,
  offset: 0
}

var testcases = [{
  header: {
    version: 0,
    payload: 0,
    ret: -1,
    controlflags: 296,
    size: 0,
    offset: 0
  },
  expectedPresence: false,
  expectedError: null,
  message: 'with negative response containing ret < 0'
}, {
  header: {
    version: 0,
    payload: 0,
    ret: 0,
    controlflags: 0,
    size: 0,
    offset: 0
  },
  expectedPresence: true,
  expectedError: null,
  message: 'with response containing ret=0'
}, {
  header: {
    version: 0,
    payload: 0,
    ret: 1,
    controlflags: 0,
    size: 0,
    offset: 0
  },
  expectedPresence: null,
  expectedError: new Error('Unexpected response on presence request'),
  message: 'with unexpected response ret > 0'
}]

function stubWithHeaderAndError (header) {
  return function () {
    debug('stubWithHeader: ', header)
    var communicationStub = {
      sendCommand: function () {}
    }

    var sendCommandStub = sinon.stub(communicationStub, 'sendCommand')
    var err = null // Simulate no error by default.

    // Simulate an error in case of negative response (ret < 0).
    if (header.ret < 0) {
      err = new Error('Communication Error. Received ' + header.ret)
      err.header = header
    }
    sendCommandStub.callsArgWith(1, err, [{
      header: header
    }])
    var owfs = new Client('foo', 4304, communicationStub)

    return {
      owfs: owfs,
      stub: sendCommandStub
    }
  }
}

describe('Presence Tests', function () {
  const fun = 6
  const command = 'presence'

  describe('#' + command + '()', function () {
    var res = stubWithHeaderAndError(payloadResult)()
    it('should send (' + fun + ') command', function (done) {
      res.owfs[command]('/some/path', function () {
        done()
      })
      assert.ok(res.stub.called)
      sinon.assert.calledWith(res.stub, sinon.match({
        command: fun,
        server: 'blablub',
        port: 4304,
        path: '/some/path'
      }))
      res.stub.restore()
    })
  })

  describe('#' + command + '()', function () {
    testcases.forEach(function (testcase) {
      it(testcase.message + ' should pass ' + testcase.expectedPresence + ' presence to callback', function () {
        var res = stubWithHeaderAndError(testcase.header)()
        res.owfs[command]('/some/path', function (error, result) {
          debug('result: ' + result)
          assert.equal(result, testcase.expectedPresence)
          assert.deepEqual(error, testcase.expectedError)
          res.stub.restore()
        })
      })
    })
  })
})
