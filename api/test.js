// test for Vercel

/**
   Request is {
      query:         // query string or {}
      cookies:       // cookies or {}
      body:          // body or null
   }

   Response is {
      status(code)   // set status code
      send(body)     // send string, object or buffer
      json(obj)      // send json object
      redirect(url)  // 
      redirect(status, url)
   }

   See https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-request-and-response-objects

*/

const fs = require('fs');

async function handler (req, res) {
    try {
        console.log(`entering test handler`);

        let info = 'Content of /var/task';
        info += fs.readdirSync('/var/task/').join(', ');
        info += '\n\n';
        // No secrets here!
        //info += 'Content of /var/task/secrets/';
        //info += fs.readdirSync('/var/task/secrets/').join(', ');
        //info += '\n\n';
        
        res.status(255);
        res.json({
            body: info,
            cookies: req.cookies,
            query: req.query
        });
        console.log(`exit from test handler`);
    } catch (exc) {
        console.error(`error in test handler`);
        res.status(500);
        res.send(exc.toString());
    }
}

module.exports = handler;

// end of test.js
