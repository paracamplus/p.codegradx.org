// Serve digit image as /digit/[slug].js

const fs = require('fs');
import { decrypt } from '../../server/cryptlib.mjs';

export async function get(req, res, next) {
	// the `slug` parameter is available because this file
	// is called [slug].json.js
	let { slug } = req.params;
    slug = slug.replace(/[.]png$/, '');

    let images = [];
    const cookies = req.headers.cookie.split(';');
    //console.log('cookies', cookies);
    for ( const cookie of cookies ) {
        const nameValue = cookie.trim().split('=');
        //console.log(nameValue);
        const content = decrypt(nameValue[1]);
        if ( nameValue[0] === 'MV' ) {
            const fields = content.split(',');
            images = fields.slice(2);
            break;
        }
    }
    //console.log('images', images, slug);

    let pngfile = 'static/_digits/bad.png';
    if ( images.length > 0 ) {
        // There was an MV cookie (therefore not expired!):
        for ( let i=0 ; i<images.length ; i++ ) {
            if ( images[i] === slug ) {
                pngfile = `static/_digits/${i}.png`;
                break;
            }
        }
    }
    //console.log('pngfile', pngfile); //DEBUG

    // TODO add noise to image ???

    res.setHeader('Content-Type', 'image/png');
    res.end(fs.readFileSync(pngfile));
}

// end of digit/[slug].js
