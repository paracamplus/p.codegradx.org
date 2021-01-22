#! /bin/bash
# Time-stamp: "2021-01-22 18:27:50 queinnec"

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


# if [ -z "$FKEY_PUBLIC" ]
# then if [ -z "$FKEY_PRIVATE" ]
#      then
#          echo "*** Building pair of keys:"
#          mkdir -p secrets/
#          ( cd secrets/
#            if [ ! -f ./fkeyPrivate ]
#            then 
#                ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
#                openssl rsa -in ./fkeyPrivate -pubout -out ./fkeyPublic
#            fi
#            ls -l ../secrets/
#          )
#          cp -rp secrets api/
#      else
#          unset FKEY_PUBLIC
#      fi
# else
#     unset FKEY_PRIVATE
# fi

showls () {
    echo "*** ls -tal $1"
    ls -tal $1
}

echo "*** Building the p.codegradx.org static server..."
npm run export
showls `pwd`
showls `pwd`/__sapper__/
showls `pwd`/static/

echo "*** Building the API function..."
cp -rp rollup.config.js \
   src static \
   api/sources/

cat > api/sources/src/server.js <<EOF
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

( cd api/sources/ && npm run build )
sed -i.bak \
    -e 's@__sapper__/build@./__sapper__/build@./' \
    < api/sources/__sapper__/build/server/server.js \
    > api/sources/__sapper__/build/server/server.js
rm api/sources/__sapper__/build/server/server.js.bak

rm -rf __sapper__/build/
mv api/sources/__sapper__ __sapper__/export/

#( cd api/sources/ && mv package*.json __sapper__ node_modules ../ )
#cp -rp static api/
#if [ "$VERCEL" = 1 ]
#then
#    echo "*** removing api/sources/"
#    rm -rf api/sources/
#fi

# showls `pwd`
# showls `pwd`/__sapper__/
# showls `pwd`/api/

echo "*** end of vercel-build.sh"

# end of vercel-build.sh
