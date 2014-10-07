debug = require("debug")("owfs:convert")
exports.extractValue = (callback) ->
	(error, messages) ->
		if !error
			if messages.length > 1
				debug("Received multiple messages in simple read"+ messages)
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
	lines = lines.filter (line)->
		not not line
	lines.join(",").split ","

exports.extractDirectories = (callback) ->
	debug "extractDirectories"
	(err, messages) ->
		debug messages
		if !err
			directories = messages.map extractDirectoriesFromMessage
			debug "extracted directories"
			debug directories
			callback(err, [].concat directories...)
		else
			callback(err)
