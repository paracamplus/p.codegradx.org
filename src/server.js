import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { CodeGradX } from 'codegradx';
const serverless = require('serverless-http');
const fs = require('fs');
const path = require('path');

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

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

const staticDir = path.join(process.cwd(), 'static');

let handler = undefined;
try {
  const server = polka()
        .use(
                compression({ threshold: 0 }),
                sirv(staticDir, { dev }),
                sapper.middleware()
        );
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
