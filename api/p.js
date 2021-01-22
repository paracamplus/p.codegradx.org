// Define an AWS lambda

/**
   Requires `sapper build` before use!
   See Scripts/vercel-build.sh
*/

//module.exports.handler = require('./__sapper__/server/server.js');

const p = require('p');
module.exports.handler = p.handler;

// end of p.js
