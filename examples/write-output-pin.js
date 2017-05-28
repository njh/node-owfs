/*

  Example of writing to an DS2413 output pin.

*/

'use strict'

var Client = require('../lib/owfs').Client
var client = new Client('10.108.65.30', 4304)

client.write('/3A.378A06000000/PIO.A', true, function (err, message) {
  if (err) {
    console.log(err)
  } else {
    console.log(message)
  }
})
