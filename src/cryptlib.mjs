// Crypt utilities to hide from browsers the content of some cookies.
// These are used on server-side (between the browser and the server).
// X servers do not need to know them.

const chunksize = 80;

// With Docker, this is where keys are available:
const defaultKeyDirs = [
    '/run/secrets/',
    './secrets/'
];

const defaultfkeyfilenames = {
    public:  'fkeyPublic',
    private: 'fkeyPrivate'
};

function prepareKey (creator, filename) {
    const fs = require('fs');
    const crypto = require('crypto');
    let keycontent = undefined;
    try {
        for ( const dir of defaultKeyDirs ) {
            const path = `${dir}/${filename}`;
            if ( fs.existsSync(path) ) {
                keycontent = fs.readFileSync(path);
                break;
            }
        }
        if ( ! keycontent ) {
            throw new Error(`Missing key file ${filename}`);
        }
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
    return prepareKey(crypto.createPublicKey, fkeyfilename);
}

function preparePrivateKey (fkeyfilename = defaultfkeyfilenames.private) {
    return prepareKey(crypto.createPrivateKey, fkeyfilename);
}

function decrypt (s) {
    const crypto = require('crypto');
    const privatekey = preparePrivateKey();
    let results = [];
    const blocks = s.split(',');
    function decrypt1block (block) {
        let result = decodeURIComponent(block);
        result = Buffer.from(result, 'base64');
        result = crypto.privateDecrypt(privatekey, result)
        results.push(result.toString());
    }
    for ( let block of blocks ) {
        decrypt1block(block);
    }
    return results.join('');
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

function finalcrypt (s) {
    const crypto = require('crypto');
    let blocks = [];
    const key = preparePrivateKey();
    function crypt1block (s) {
        //console.log('crypt1block', s);//DEBUG
        let result = crypto.privateEncrypt(key, Buffer.from(s));
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

export { shuffle, crypt, decrypt, finalcrypt };
