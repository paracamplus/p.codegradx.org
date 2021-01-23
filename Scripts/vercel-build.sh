#! /bin/bash
# Time-stamp: "2021-01-23 17:53:56 queinnec"

# Build the P server on Vercel.
# api/p.js should already exist to be taken into account.

# On Vercel, project settings are:
#    build command:     npm run vercel
#    output directory:  __sapper__/export
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

# Tab source source is only filled when manual deployed.
# However the build command is still npm run vercel so to differentiate
# a manual deployment from a GIT deployment, the WOGIT (read without git)
# environment variable is set.

if ${WOGIT:-false}
then
    # This is a manual deployment
    exec Scripts/wogit-vercel-build.sh
fi

# Erase some previous cached files:
if [ -d __sapper__ -o -d api/__sapper__ ]
then
    rm -rf __sapper__ api/__sapper__
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

false && \
if [ -z "$FKEY_PUBLIC" ]
then if [ -z "$FKEY_PRIVATE" ]
     then
         echo "*** Building pair of keys:"
         mkdir -p secrets/
         ( cd secrets/
           if [ ! -f ./fkeyPrivate ]
           then 
               ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
               openssl rsa -in ./fkeyPrivate -pubout -out ./fkeyPublic
           fi
           ls -l ../secrets/
         )
         cp -rp secrets api/
     else
         unset FKEY_PUBLIC
     fi
else
    unset FKEY_PRIVATE
fi

showls () {
    echo "*** ls -tal $1"
    ls -tal $1
}

mv src/server.js src/server.js.ORG
cat > src/server.js <<EOF
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { CodeGradX } from 'codegradx';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const serverless = require('serverless-http');
const server = polka() // You can also use Express
        .use(
                compression({ threshold: 0 }),
                sirv('static', { dev }),
                sapper.middleware()
        );
const handler = serverless(server);

module.exports.handler = async function (event, context) {
   console.log('entering handler...');
   const result = await handler(event, context);
   console.log('exiting handler');
   return result;
};
EOF

echo "*** Building the p.codegradx.org dynamic server..."
false && {
npm run build
showls `pwd`/
showls __sapper__/
#showls __sapper__/export/
showls __sapper__/build/

( sed -i.bak \
      -e 's@__sapper__/build@./__sapper__/build@' \
      __sapper__/build/server/server.js && \
  rm __sapper__/build/server/server.js.bak )
}

echo "*** Building the p.codegradx.org static server..."
# This server.js is required by export when crawling the site:
mv src/server.js.ORG src/server.js
npm run export
showls `pwd`/
showls __sapper__/
showls __sapper__/export/

if [ ! -f __sapper__/export/index.html ]
then
    echo "!!!!! Crawling phase probably missing!" >&2
    exit 1
fi

mkdir -p __sapper__/export/__sapper__/
mv __sapper__/build __sapper__/export/__sapper__/

#mkdir -p api
#cp -p __sapper__/export/server/server.js api/p.js

echo "*** end of vercel-build.sh"

# end of vercel-build.sh
