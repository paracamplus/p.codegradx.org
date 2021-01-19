/**
   Vercel wrapper.

   This wrapper is deployed in the ~/api/ directory.
   That directory also contains ./{src,static,node_modules}/
*/

//import { get } from '/var/task/api/src/routes/api/signupinit.json.js';
const vercel = require('vercel.js');

async function handler (req, res) {

    let info = 'Content of .: ';
    info += fs.readdirSync('./').join(', ');
    info += '\n\n';
    console.log(info);
    
    let info = 'Content of /var/task: ';
    info += fs.readdirSync('/var/task/').join(', ');
    info += '\n\n';
    console.log(info);

    info = 'Content of /var/task/api: ';
    info += fs.readdirSync('/var/task/api/').join(', ');
    info += '\n\n';
    console.log(info);

    try {
        const wrappedreq = new vercel.Request(req);
        const wrappedres = new vercel.Response(res);
        //await get(wrappedreq, wrappedres);
    } catch (exc) {
        console.error(`error in signupinit.json.js handler`, {exc});
        res.status(500);
        res.send(exc.toString());
    }
}

module.exports = handler;

// end of signupinit.json.js
