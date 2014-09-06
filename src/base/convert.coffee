logger = require "winston"
exports.extractValue = (callback) ->
	(error, messages) ->
		if !error
			if messages.length > 1
				logger.warn("Received multiple messages in simple read", messages)
				messageToUse = messages.filter (message) ->
					message.header.payload > 0
				[0]
			else
				messageToUse = messages[0]
			result = messageToUse.payload.replace(new RegExp(" ", "g"), "")
			callback(error, result)
		else
			callback(error)

extractDirectoriesFromMessage = (message)->
	exp = new RegExp("[\u0000-\u001F]", "g")
	lines = message.payload.replace(exp, "").split(" ")
	lines.filter (line)->
		not not line

exports.extractDirectories = (callback) ->
	logger.debug "extractDirectories"
	(err, messages) ->
		logger.debug messages
		if !err
			directories = messages.map extractDirectoriesFromMessage
			logger.debug "extracted directories", directories
			dir2 = [].concat directories...
			callback(err, dir2)
		else
			callback(err)
