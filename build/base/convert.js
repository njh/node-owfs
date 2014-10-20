(function() {
  var debug, extractDirectoriesFromMessage;

  debug = require("debug")("owfs:convert");

  exports.extractValue = function(callback) {
    return function(error, messages) {
      var messageToUse, result;
      if (!error) {
        if (messages.length > 1) {
          debug("Received multiple messages in simple read" + messages);
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
    if (!!message.payload) {
      exp = new RegExp("[\u0000-\u001F]", "g");
      lines = message.payload.replace(exp, "").split(" ");
      lines = lines.filter(function(line) {
        return !!line;
      });
      return lines.join(",").split(",");
    } else {
      return [];
    }
  };

  exports.extractDirectories = function(callback) {
    debug("extractDirectories");
    return function(err, messages) {
      var directories, _ref;
      debug(messages);
      if (!err) {
        directories = messages.map(extractDirectoriesFromMessage);
        debug("extracted directories");
        debug(directories);
        return callback(err, (_ref = []).concat.apply(_ref, directories));
      } else {
        return callback(err);
      }
    };
  };

}).call(this);

//# sourceMappingURL=convert.js.map
