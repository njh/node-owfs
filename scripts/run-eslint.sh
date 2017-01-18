#!/bin/bash
#
# This script checks the version of node.js that is running
# and only runs eslint if node.js is new enough
#

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PATH="$DIR/../node_modules/.bin:$PATH"

NODE=${NODE:-node}
NODE_VERSION=$($NODE --version)
NODE_VERSION=${NODE_VERSION#v}
NODE_MAJOR=${NODE_VERSION%%.*}

echo "node.js version $NODE_VERSION"
if [ "$NODE_MAJOR" -lt 4 ]
then
  echo "Not running eslint: it requires node.js v4 or higher"
else
  exec eslint lib test examples
fi
