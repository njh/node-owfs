(function() {
  var extractDirectoriesFromMessage, logger;

  logger = require("winston");

  exports.extractValue = function(callback) {
    return function(error, messages) {
      var messageToUse, result;
      if (!error) {
        if (messages.length > 1) {
          logger.warn("Received multiple messages in simple read", messages);
          messageToUse = messages.filter(function(message) {
            return message.header.payload > 0;
          });
          [0];
        } else {
          messageToUse = messages[0];
        }
        result = messageToUse.payload.replace(new RegExp(" ", "g"), "");
        return callback(error, result);
      } else {
        return callback(error);
      }
    };
  };

  extractDirectoriesFromMessage = function(message) {
    var exp, lines;
    exp = new RegExp("[\u0000-\u001F]", "g");
    lines = message.payload.replace(exp, "").split(" ");
    lines = lines.filter(function(line) {
      return !!line;
    });
    return lines.join(",").split(",");
  };

  exports.extractDirectories = function(callback) {
    logger.debug("extractDirectories");
    return function(err, messages) {
      var directories, _ref;
      logger.debug(messages);
      if (!err) {
        directories = messages.map(extractDirectoriesFromMessage);
        logger.debug("extracted directories", directories);
        return callback(err, (_ref = []).concat.apply(_ref, directories));
      } else {
        return callback(err);
      }
    };
  };

}).call(this);

//# sourceMappingURL=convert.js.map
