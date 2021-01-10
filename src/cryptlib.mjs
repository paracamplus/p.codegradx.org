// Crypt utilities to hide from browsers the content of some cookies.
// These are used on server-side.

const chunksize = 80;

// With Docker, this is where keys are available:
const defaultfkeyfilenames = {
    public:  '/run/secrets/fkeyPublic',
    private: '/run/secrets/fkeyPrivate'
};

function preparePublicKey (fkeyfilename = defaultfkeyfilenames.public) {
    const fs = require('fs');
    const crypto = require('crypto');
    let pubkeycontent = undefined;
    try {
        if ( process.env.PUBLICKEY ) {
            pubkeycontent = process.env.PUBLICKEY.replace(/@/g, '\n');
        } else if ( fs.existsSync(fkeyfilename) ) {
            pubkeycontent = fs.readFileSync(fkeyfilename);
        } else {
            throw new Error(`Missing public key file ${fkeyfilename}`);
        }
        const pubkey = crypto.createPublicKey({
            key: pubkeycontent,
            format: 'pem'
        });
        //console.log(`public key`, pubkey); // DEBUG
        return pubkey;
    } catch (exc) {
        throw exc;
    }
}

function preparePrivateKey (fkeyfilename = defaultfkeyfilenames.private) {
    const fs = require('fs');
    const crypto = require('crypto');
    let keycontent = undefined;
    try {
        if ( process.env.PRIVATEKEY ) {
            const keycontent = process.env.PRIVATEKEY.replace(/@/g, '\n');
        } else if ( fs.existsSync(fkeyfilename) ) {
            keycontent = fs.readFileSync(fkeyfilename);
        } else {
            throw new Error(`Missing private key file ${fkeyfilename}`);
        }
        const key = crypto.createPrivateKey({
            key: keycontent,
            format: 'pem'
        });
        //console.log(`private key`, key); // DEBUG
        return key;
    } catch (exc) {
        throw exc;
    }
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
