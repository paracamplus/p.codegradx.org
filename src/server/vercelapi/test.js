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

async function handler (req, res) {
    try {
        console.log(`entering test handler`);
        res.status(255);
        res.json({
            body: req.body,
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