'use strict'

var debug = require('debug')('owfs:convert')

exports.preparePayload = function (payload) {
  if (payload === true) {
    return '1'
  } else if (payload === false) {
    return '0'
  } else {
    return payload.toString()
  }
}

exports.extractValue = function (callback) {
  return function (error, messages) {
    if (!error) {
      var messageToUse
      if (messages.length > 1) {
        debug('Received multiple messages in simple read', messages)
        messageToUse = messages.filter(function (message) {
          debug('Checking Header payload > 0', message.header.payload)
          return message.header.payload > 0
        })
      } else {
        messageToUse = messages
      }
      debug('message to use', messageToUse)
      if (messageToUse.length > 0) {
        var payload = messageToUse[0].payload
        var result = payload !== null ? payload.replace(new RegExp(' ', 'g'), '') : null
        return callback(error, result)
      } else {
        var err = new Error('No usable messages received, but no error returned.')
        // FIXME: remove this in version 1.0.0
        err.msg = err.message
        return callback(err)
      }
    } else {
      return callback(error)
    }
  }
}

var extractDirectoriesFromMessage = function (message) {
  if (message.payload) {
    if (message.payload.substr(-1) === '\0') {
      // Remove trailing NULL character
      message.payload = message.payload.slice(0, -1)
    }
    return message.payload.split(',')
  } else {
    return []
  }
}

exports.extractDirectories = function (callback) {
  debug('extractDirectories')
  return function (err, messages) {
    debug(messages)
    if (!err) {
      var directories = messages.map(extractDirectoriesFromMessage)
      var _ref
      debug('extracted directories', directories)
      return callback(err, (_ref = []).concat.apply(_ref, directories))
    } else {
      return callback(err)
    }
  }
}

exports.extractPresence = function (callback) {
  return function (err, messages) {
    var presence = false
    // If device is not present ret < 0 will be returned.
    // Device is present if ret is 0.
    if (err && err.header && (err.header.ret < 0)) {
      presence = false
    } else if (messages && (messages[0].header.ret === 0)) {
      presence = true
    } else {
      debug('failed to extract presence')
      if (!err) {
        err = new Error('Unexpected response on presence request')
      }
      return callback(err)
    }

    debug('extracted presence: ', presence)
    return callback(null, presence)
  }
}
