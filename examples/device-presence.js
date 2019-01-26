/*
 * Example how to check presence of a device
 */
'use strict'

var Client = require('../lib/owfs').Client
var client = new Client('localhost', 4304)

var checkedDevices = ['/81.365F2F000000', '/81.365F2F000001']

checkedDevices.forEach(function (device) {
  client.presence(device, function (err, result) {
    if (err) {
      console.log('error received: ' + err)
    } else {
      console.log(device, ' present: ', result)
    }
  })
})
