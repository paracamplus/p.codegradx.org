// A server without listen adapted for Vercel

import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

function logger (req, res, next) {
  dev && console.log(`>>> ${req.path}`); //DEBUG
  next(); // move on
}

function handleError (err, req, res, next) {
    console.error({path: req.originalUrl,
                   err });
}

const server = polka({
    base: '/api/p',
    onError: handleError
}).use(
    '/api/p',
    logger,
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
);

module.exports = server;

/**
   In vercel.json, With rewrites such as:

   "rewrites": [                                                               
        { "source": "/api/p/api/(.*)",                                          
          "destination": "/api/p/api/$1" },                                     
        { "source": "/(.*)",                                                    
          "destination": "/index.html" } ]                                      

   /api/p     -> this server
   /api/p/    -> this server
   /api/p?x=y -> this server
   /api/p/api -> / (that is the static server)
   /api/pwdls -> OK
   /api/xxx   -> / (that is the static server)

   All serverless functions in api/ work. But this one is better:

   "rewrites": [                                                               
        { "source": "/api/p(/.*)",                                              
          "destination": "/api/p/" },                                           
        { "source": "/(.*)",                                                    
          "destination": "/index.html" } ]                                      

   /api/p/api/signupinit.json  OK
   /api/signupinit.json  OK
   

*/

// end of pserver.js
