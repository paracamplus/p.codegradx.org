#! /bin/bash
# Time-stamp: "2021-01-20 15:52:39 queinnec"

# Build the P serverless server

# Erase some previous cached files:
if [ -d __sapper__ -o -d api/__sapper__ ]
then
    rm -rf __sapper__ api/__sapper__
fi

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

module.exports.handler = async function handler (event, context) {
   console.log('entering handler...');
   const result = await handler(event, context);
   console.log('exiting handler');
   return result;
};

EOF

npm run build

# end of vercel-serverless-build.sh
