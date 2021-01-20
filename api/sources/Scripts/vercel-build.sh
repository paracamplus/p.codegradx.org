#! /bin/bash -x
# Time-stamp: "2021-01-20 20:38:04 queinnec"

# Build the P server on Vercel:

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

echo "*** Building the p.codegradx.org server..."
npm run export

echo "*** Building the API function..."
cp -rp api/package*.json api/sources/
cp -rp rollup.config.js Scripts secrets src static api/sources/

cat > api/p.js <<EOF
module.exports.handler = require('./sources/src/server.js');
EOF

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

module.exports.handler = async function handler (event, context) {
   console.log('entering handler...');
   const result = await handler(event, context);
   console.log('exiting handler');
   return result;
};
EOF

( cd api/sources/ && npm ci && ls -al && npm run build)

# end of vercel-build.sh
