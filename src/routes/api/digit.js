// Serve digit image as /api/digit.js?slug=XXX

const fs = require('fs');
import { decrypt } from '../../server/cryptlib.mjs';
import queryString from 'query-string';
import { getCookies } from '../../common/utils.mjs';

function showDir (dir) {
    let info = '';
    try {
        info += `\nContent of directory ${dir}/:\n  `;
        info += fs.readdirSync(dir).join(',\n  ');
    } catch (exc) {
        info += `!!!!! Absent directory ${dir}`;
    }
    info += '\n';
    return info;
}

const pngDirs = [
    // When on dev machine:
    "_digits",

    // When on Docker:
    "static/_digits",
    
    /**
       When deployed on Vercel, cwd(), that is /var/task/, contains:
          ___vc_*.js
          + api/digit.js
          + export/_digits/
          + _ node_modules/
          package.json

       However, if servers are built on Vercel, then /var/task/ contains:
          ___vc_*.js
          + api/digit.js
          + _ node_modules/
          package.json
          + static/_digits/

       so these are the two possible paths of the images:                 */
    
    "./export/_digits",
    "./static/_digits"
];

export async function get(req, res, next) {
    try {
        const search = req.url.replace(/^.*\?/, '?');
        const params = queryString.parse(search);
        //console.log(req.url, {search, params}, req.query);//DEBUG
        let slug = params.slug.replace(/[.]png$/, '');

        if ( 0 ) {
            let info = '';
            info += showDir(process.cwd());
            info += showDir('./api');
            info += showDir('./export');
            info += showDir('./static');
            console.log(info);
        }

        let images = [];
        const MVcontent = getCookies(req).get('MV');
        //console.log({MVcontent});// DEBUG
        if ( MVcontent ) {
            const fields = decrypt(MVcontent).split(',');
            images = fields.slice(2);
        } else {
            throw "Missing MV cookie";
        }
        //console.log({images, slug});//DEBUG

        let pngfile = undefined;
        for ( const pngDir of pngDirs ) {
            const badfile = `${pngDir}/bad.png`;
            if ( fs.existsSync(badfile) ) {
                pngfile = badfile;
                break;
            }
        }
        if ( ! pngfile ) {
            throw "Missing bad png";
        }
        for ( const pngDir of pngDirs ) {
            if ( images.length > 0 ) {
                // There was an MV cookie (therefore not expired!):
                for ( let i=0 ; i<images.length ; i++ ) {
                    if ( images[i] === slug ) {
                        const file = `${pngDir}/${i}.png`;
                        if ( fs.existsSync(file) ) {
                            pngfile = file;
                            break;
                        }
                    }
                }
            }
        }
        //console.log(`Sending pngfile ${pngfile}`); //DEBUG
        // TODO add noise to image ???
        res.setHeader('Content-Type', 'image/png');
        res.end(fs.readFileSync(pngfile));
    } catch (exc) {
        console.log(exc);
        res.statusCode = 400;
        res.statusMessage = "Missing image";
        res.end(JSON.stringify({error: exc.toString()}));
    }
}

// end of api/digit.js
