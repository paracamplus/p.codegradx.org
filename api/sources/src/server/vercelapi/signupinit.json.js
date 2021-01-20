/**
   Vercel wrapper.

   This wrapper is deployed in the ~/api/ directory.
*/

import {get } from '../src/routes/api/signupinit.json.js';
import { VercelRequest, VercelResponse } from 'vercel.mjs';

async function handler (req, res) {
    try {
        const wrappedreq = new VercelRequest(req);
        const wrappedres = new VercelResponse(res);
        await get(wrappedreq, wrappedres);
    } catch (exc) {
        console.error(`error in signupinit.json.js handler`, {exc});
        res.status(500);
        res.send(exc.toString());
    }
}

module.exports = handler;

// end of signupinit.json.js
