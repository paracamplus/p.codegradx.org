(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('codegradx')) :
    typeof define === 'function' && define.amd ? define(['codegradx'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.codegradx));
}(this, (function (codegradx) { 'use strict';

    // Crypt utilities to hide from browsers the content of some cookies.
    // These are used on server-side (between the browser and the server).
    // X servers do not need to know them.

    const chunksize = 80;

    // With Docker, this is where keys are available:
    const defaultKeyDirs = [
        './secrets/',
        '/run/secrets/'
    ];

    const defaultfkeyfilenames = {
        public:  'fkeyPublic',        // FKEYPUBLIC
        private: 'fkeyPrivate'        // FKEYPRIVATE
    };

    function prepareKey (creator, filename) {
        let keycontent = undefined;
        if ( process.env[filename.toUpperCase()] ) {
            //console.log(`cryptlib: Using env variable ${filename.toUpperCase()}`);
            keycontent = process.env[filename.toUpperCase()];
            keycontent = keycontent.replace(/@/g, '\n');
        } else {
            const fs = require('fs');
            try {
                for ( const dir of defaultKeyDirs ) {
                    const path = `${dir}/${filename}`;
                    if ( fs.existsSync(path) ) {
                        //console.log(`cryptlib: Using file ${path}`);
                        keycontent = fs.readFileSync(path);
                        break;
                    }
                }
            } catch (exc) {
                throw exc;
            }
        }
        if ( ! keycontent ) {
            throw new Error(`Missing key ${filename}`);
        }
        try {
            const key = creator({
                key: keycontent,
                format: 'pem'
            });
            return key;
        } catch (exc) {
            throw exc;
        }
    }

    function preparePublicKey (fkeyfilename = defaultfkeyfilenames.public) {
        const crypto = require('crypto');
        return prepareKey(crypto.createPublicKey, fkeyfilename);
    }

    function crypt (s) {
        const crypto = require('crypto');
        let blocks = [];
        const pubkey = preparePublicKey();
        function crypt1block (s) {
            //console.log('crypt1block', s);//DEBUG
            let result = crypto.publicEncrypt(pubkey, Buffer.from(s));
            result = result.toString('base64');
            result = encodeURIComponent(result);
            blocks.push(result);
        }
        while ( s.length > 0 ) {
            let bs = s.slice(0, chunksize);
            crypt1block(bs);
            s = s.slice(chunksize);
        }
        return blocks.join(',');
    }

    function shuffle (array) {
        // Fisher-Yates
        for ( let i=(array.length - 1) ; i>0 ; i-- ) {
            const j = Math.floor(Math.random() * (i+1));
            const aj = array[j];
            array[j] = array[i];
            array[i] = aj;
        }
        return array;
    }

    // Serve information for the movecaptcha
    const fetch = require('node-fetch');

    const prefixurl = '/digit';

    async function get (req, res, next) {

        const state = new codegradx.CodeGradX.State();
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
            const expires = codegradx.CodeGradX._str2Date(response.entity.expires)
                  .toUTCString();
            const images = response.entity.images;
            const urls = shuffle(images.map((s) => `${prefixurl}/${s}.png`));
            //console.log(nonce, wanted, urls); //DEBUG

            let content = `${nonce},${wanted.join('')},${images.join(',')}`;
            content = crypt(content);
            let cookie = `MV=${content}; path=/digit/; expires=${expires};`;
            res.setHeader('Set-Cookie', cookie);
    		res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({nonce, wanted, urls, expires}));
            
        }).catch((exc) => {
            console.log('signupinit PB', state.log);
            console.log('signupinit PB', exc);
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

    // end of signupinit.js

    // Embeds an API entrypoint for Vercel
    module.exports = get;

    // end of signupinit.json.js

})));
