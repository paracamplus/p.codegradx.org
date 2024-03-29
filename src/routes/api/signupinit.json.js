// Serve information for the movecaptcha

import { CodeGradX } from 'codegradx';
import { crypt, shuffle } from '../../server/cryptlib.mjs';
import fetch from 'node-fetch';

/* NOTA: Fortunately, Vercel allows serverless functions to be invoked
   with or without the .js suffix.
*/
const prefixurl = '/api/digit';

export async function get (req, res, next) {

    const state = new CodeGradX.State();
    // Initialize that server-side CodeGradX instance:
    state.servers = state.defaultservers;
    state.fetch = fetch;
    
    state.sendAXServer('x', {
        path: '/movecaptchainfo',
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    }).then((response) => {
        if ( response.entityKind !== 'JSON' ) {
            throw "bad answer";
        }
        //console.log(response);//DEBUG
        //console.log(response.entity);//DEBUG
        const nonce = response.entity.nonce;
        const wanted = response.entity.wanted;
        const expires = CodeGradX._str2Date(response.entity.expires)
              .toUTCString();
        const images = response.entity.images;
        const urls = shuffle(images.map((s) => `${prefixurl}?slug=${s}`));
        //console.log(nonce, wanted, urls); //DEBUG

        let content = `${nonce},${wanted.join('')},${images.join(',')}`;
        content = crypt(content);
        // Rename the cookie as __Secure-MV ? See
        //   https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
        let cookie = `MV=${content}; path=/api; expires=${expires};`;
        cookie += `sameSite=none; secure; httponly;`;
        res.setHeader('Set-Cookie', cookie);
		res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({nonce, wanted, urls, expires}));
        
    }).catch((exc) => {
        console.log('signupinit PB', state.log);
        console.log('signupinit PB', {exc});
        let content = `Problem
exception: ${exc.toString()}
state.log is
${state.log.items.join('\n')}
`;
        res.statusCode = 500;
        res.statusMessage = "Erroneous movecaptchainfo";
        res.setHeader('Content-Type', 'text/plain');
        res.end(content);
    });
}

// end of api/signupinit.js
