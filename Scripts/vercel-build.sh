#! /bin/bash
# Time-stamp: "2021-01-25 18:29:52 queinnec"

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

DEBUG=false

showls () {
    if $DEBUG
    then
        echo "*** ls -tal $1"
        ls -tal $1
    fi
}

# Tab source source is only filled with manual deployment.
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

if [ -d __sapper__/export/__sapper__/build/ ]
then
    echo "*** The entire webapp and its serverless functions are ready"
    # The webapp and its serverless functions are completely built on
    # the dev machine.
    showls -R __sapper__/export/
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

# Preserve this server.js since it is required for sapper export:
mv src/server.js src/server.js.ORG
cat > src/server.js <<EOF
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { CodeGradX } from 'codegradx';
const serverless = require('serverless-http');

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const fs = require('fs');
const path = require('path');

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
showDir('./__sapper__');
showDir('./__sapper__/build');
showDir('./__sapper__/export');
showDir('./__sapper__/export/static');
showDir('./__sapper__/export/__sapper__');
showDir('./__sapper__/export/__sapper__/build');

const staticDir = path.join(process.cwd(), 'static');

process.chdir('./__sapper__/export');
showDir(process.cwd());

let handler = undefined;
try {
  const server = polka()
        .use(
                compression({ threshold: 0 }),
                sirv(staticDir, { dev }),
                sapper.middleware()
        );
  if ( dev ) {
     console.log('listening on ' + PORT);
     server.listen(PORT, err => {
          if (err) console.log('error', {err});
     });
  }
  handler = serverless(server);
} catch (exc) {
  console.error({exc});
}

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
EOF

echo "*** Building the p.codegradx.org dynamic server..."
npm run build
showls `pwd`/
showls __sapper__/
#showls __sapper__/export/
showls __sapper__/build/
$DEBUG && tail -20 __sapper__/build/server/server.js

false && \
( cd __sapper__/build/ && sed -i.bak \
      -e 's@__sapper__/build@./__sapper__/build@' \
      server/server.js && \
  rm server/server.js.bak && \
  cp -p server/server.js ../../src/server.js.SAV )
cp __sapper__/build/server/server.js src/server.js.SAV 
# Preserve that server.js it will be destroyed by sapper export.

echo "*** Building the p.codegradx.org static server..."
# Restaure this server.js since it is required by export when crawling the site:
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

mkdir -p __sapper__/export/static/
#cp -p __sapper__/export/*.{ico,png,css,json,html,js} __sapper__/export/static/
cp -rp static __sapper__/export/
showls __sapper__/
showls __sapper__/export/

mkdir -p __sapper__/export/__sapper__/
mv src/server.js.SAV __sapper__/build/server/server.js
mv __sapper__/build __sapper__/export/__sapper__/

# NOTA: the content of p.js cannot be changed at build-time:
#mkdir -p api
#cp -p __sapper__/export/sapper/build/server/server.js api/
#showls api/

showls -R __sapper__/export/

echo "*** end of vercel-build.sh"

# end of vercel-build.sh
