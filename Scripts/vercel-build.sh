#! /bin/bash
# Time-stamp: "2021-01-27 10:27:07 queinnec"

# Build the P server on Vercel.
# api/p.js should already exist to be taken into account.

# On Vercel, project settings are:
#    build command:     npm run vercel
#    output directory:  export
#    install command:   npm ci
# no development command (default is sapper dev --port $PORT)
# no root directory (default /)

# Tab Source Output shows a thorough reorganization of the files:
#   + _digits/*.png
#   + api/p.js
#   + client/*.{js,css}
#   favicon.{ico,png}
#   fw4ex-*.png
#   global.css
#   index.html
#   manifest.json
#   service-worker-index.html
#   service-worker.js
# So, static/ is exported
#     __sapper__/export is moved into static/client
#     api/ is moved into static/

DEBUG=false

showls () {
    if $DEBUG
    then
        echo "*** ls -tal $1"
        ls -tal $1
    fi
}

# Tab 'source source' is only filled with manual deployment.
# However the build command is still npm run vercel so to differentiate
# a manual deployment from a GIT deployment, the WOGIT (read without git)
# environment variable is set.

if ${WOGIT:-false}
then
    echo "*** Manual deployment"
    # The webapp and its serverless functions are completely built on
    # the dev machine.
    exec /bin/true
fi

# The webapp and its serverless functions are completely built on the
# dev machine so nothing else to be done on Vercel.
if [ -d export ]
then
   echo "*** The entire webapp and its serverless functions are ready"
   exec /bin/true
fi

# Inquire context:
if ${SHOW_CONTEXT:-false}
then
    echo "*** ls -al shows"
    ls -al
    echo "*** whoami -> $(whoami)"   # vercel
    echo "*** pwd    -> $(pwd)"      # /vercel/workpath0/
    echo "*** node --version -> $(node --version)"
    echo "*** npm --version  -> $(npm --version)"
    echo "*** printenv is"
    printenv
fi

echo "*** Building the p.codegradx.org static server..."
# export needs the original server.js with a listen method in order to
# crawl the site after generation.
cp -pf src/server.js src/server.js.ORG
if grep -q listen.PORT < src/server.js
then :
else
    echo "Bad version of src/server.js"
    exit 2
fi

npm run export
showls `pwd`/
showls __sapper__/
showls __sapper__/export/

if [ ! -f __sapper__/export/index.html ]
then
    echo "!!!!! Crawling phase probably missing!" >&2
    exit 1
fi
# Make sure that ./export is the 'output directory' in the project settings:
mv __sapper__/export .
rm -rf __sapper__/build

# Update src/server.js in order to be invoked as a serverless function.
cat > src/server.js <<EOF
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { CodeGradX } from 'codegradx';
const serverless = require('serverless-http');
const fs = require('fs');
const path = require('path');

const { NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

process.on('unhandledRejection', err => {
    console.error('Unhandled rejection:', err);
    setTimeout(() => process.exit(11), 5*1000);
});
process.on("uncaughtException", error => {
    console.error("Uncaught Exception:", error);
    setTimeout(() => process.exit(12), 5*1000);
});

module.exports.handler = async function (event, context, callback) {
   console.log('Within handler...');
   return {
      statusCode: 200,
      headers: {},
      body: 'Default handler OK'
   };
};

function showDir (dir = '.') {
  try {
    console.log("\nListing directory " + dir + ":\n  ");
    console.log(fs.readdirSync(dir).join('\n  '));
  } catch (exc) {
    // ignore
  }
}

showDir('.');
showDir('./api');
showDir('./static');
showDir('./export');
showDir('./__sapper__');
showDir('./__sapper__/build');

try {
  const server = polka()
        .use(
                compression({ threshold: 0 }),
                sirv('static', { dev }),
                sapper.middleware()
        );
  const handler = serverless(server);
  module.exports = { handler, server };

} catch (exc) {
  console.log({exc});
  setTimeout(() => process.exit(13), 5*1000);
}

/*
module.exports.handler = async function (event, context) {
   console.log('entering handler...');
   if ( handler ) {
     const result = await handler(event, context);
     console.log('exiting handler');
     return result;
   } else {
     console.error('undefined handler');
   }  
};
*/
EOF

echo "*** Building the p.codegradx.org dynamic server..."
npm run build
tr -d '\r' < __sapper__/build/server/server.js > api/p.js
showls api/

# Restaure back the original file:
mv -f src/server.js.ORG src/server.js

echo "*** end of vercel-build.sh"

# end of vercel-build.sh
