// Specific server-side utilities

import { CodeGradX } from 'codegradx';
import fetch from 'node-fetch';

/** NOTA: when signup.svelte requests signupinit.js, X-forwarded-host
    is null. So we prefer to use sitename.
*/

function mkpatcher4route (req) {
    return mkpatcher(fetch, req.globals.sitename, 'server.route');
}

function mkpatcher (fetch, sitename, side) {
    const fs = require('fs');
    if ( fs.existsSync(`static/${sitename}.js`) ) {
        return function (state) {
            state.fetch = function patcherFetch (url, options) {
                state.debug('patcherFetch', side, url);
                console.log('patcherFetch', side, url);
                //options.origin = `http://${sitename}`;  // ???
                return fetch(url, options);
            };
            //console.log('within mkpatcher', side, state);//DEBUG
            const fdef = fs.readFileSync(`static/${sitename}.js`);
            const f = eval(`(${fdef.toString()})`);
            f(CodeGradX, state);
            state.side = side;
            return state;
        };
    } else {
        throw `Missing patcher file static/${sitename}.js`;
    }
}

/** This code uses the this.fetch available within preload functions.
    But it also use Node API to access the local file system.
    this.fetch works on server and browser side.
*/

function mkpatcher4preload (fetch, session) {
    return mkpatcher(fetch, session.sitename, 'server.preload');
}

export { mkpatcher4preload, mkpatcher4route };

// end of serverlib.mjs
