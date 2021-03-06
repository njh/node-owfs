'use strict'

var assert = require('assert')
var sinon = require('sinon')
var Client = require('../lib/owfs').Client

var payloadResult = '/01.A7F1D92A82C8,/10.D8FE434D9855,/22.8CE2B3471711,/29.98542F112D05\0'

var testcases = [{
  payload: payloadResult,
  listingEntries: 4,
  message: ''
}, {
  payload: '/10.A7F1D92A82C8,/10.D8FE434D9855,/10.8CE2B3471711,/10.98542F112D05,/10.58F56BD68807,/10.999248336241',
  listingEntries: 6,
  message: 'with 2nd payload '
}, {
  payload: '',
  listingEntries: 0,
  message: 'with emptyPayload '
}]

function stubWithPayload (payload) {
  return function () {
    var communicationStub = {
      sendCommand: function () {

      }
    }

    var sendCommandStub = sinon.stub(communicationStub, 'sendCommand')
    sendCommandStub.callsArgWith(1, null, [{
      payload: payload
    }])
    var owfs = new Client('blablub', 4304, communicationStub)

    return {
      owfs: owfs,
      stub: sendCommandStub
    }
  }
}

var listingCommands = {
  'dir': 4,
  'dirall': 7,
  'get': 8,
  'dirallslash': 9,
  'getslash': 10
}

describe('Listing Tests', function () {
  Object.keys(listingCommands).forEach(function (command) {
    describe('#' + command + '()', function () {
      var res = stubWithPayload(payloadResult)()
      var fun = listingCommands[command]
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
        it(testcase.message + 'should pass ' + testcase.listingEntries + ' directories to callback', function () {
          var res = stubWithPayload(testcase.payload)()
          res.owfs[command]('/some/path', function (error, directories) {
            assert.ok(!error)
            assert.ok(directories, 'directories')
            assert.equal(directories.length, testcase.listingEntries)
            res.stub.restore()
          })
        })
      })
    })
  })
})
