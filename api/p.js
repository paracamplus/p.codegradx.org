// Define an AWS lambda

/**
   Requires `sapper build` before use!
   See Scripts/vercel-build.sh
*/

module.exports.handler =
    require('./__sapper__/build/server/server.js').handler;

// end of p.js
