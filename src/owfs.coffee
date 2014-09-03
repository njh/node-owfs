communication = require '../lib/base/communication'

extractValue = (callback) ->
	(error, messages) ->
		if !error 
	        if messages.length > 1
	            #logger.warn("Received multiple messages in simple read", messages) ;
	            messageToUse = messages.filter((message) ->
	                message.header.payload > 0;
	            ) [0]
	        else
	        	messageToUse = messages[0]
	        result = messageToUse.payload.replace(new RegExp(" ", "g"), "") ;
	        callback(error, result) 
	    else 
	        callback(error) 

extractDirectoriesFromMessage = (message)->
	lines = message.payload.split(" ")
	(line.replace(new RegExp("[\u0000-\u001F]", "g"), "") for line in lines)

extractDirectories = (callback) ->
	(err, messages) ->
		if !err
			#console.log "len #{messages.length}"
			directories = messages.map extractDirectoriesFromMessage
			dir2 = [].concat directories...
			callback(err, dir2)
		else
			callback(err)


read = (path, callback) ->
	command =
		path: path
		command: 2
		server: 'localhost'
		port: 4304
	communication.sendCommand(command, extractValue(callback))

dir = (path, callback) ->
	command =
		path: path
		command: 4
		server: 'localhost'
		port: 4304
	communication.sendCommand(command, extractDirectories(callback))

#read('/10.A7F1D92A82C8/temperature', (err, value) ->
#	console.log("value")
#	console.log value
#	)
dir("/", (err,directories)-> console.log directories)

#communication.sendCommand
