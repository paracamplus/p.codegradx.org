// Wrapper classes

/**
   Convert Vercel req, res into Nodejs IncomingMessage and ServerResponse
   In fact this is not necessary since Vercel uses the native Nodejs
   classes but only add some helper functions:

   Vercel Request helper {
      query:         // query string or {}
      cookies:       // cookies or {}
      body:          // body or null
   }

   See https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-request-and-response-objects

   Contenu de /var/task/:
      /var/task/node_modules/
      /var/task/api/

   Vercel Response helper {
      status(code)   // set status code
      send(body)     // send string, object or buffer
      json(obj)      // send json object
      redirect(url)  // 
      redirect(status, url)
   }
*/

/**
   Forward a GET request with limited duration towards another GET method.
   Use this when wrapping svelte methods to become vercel compatible.

   @param {fn} async function 
   @return async function
*/

export function wrapLimited (fn, duration=5000) {
    return async function (req, res, next) {
        try {
            //console.log({req, res});//DEBUG
            //const Req = new Request(req);
            //const Res = new Response(res);
            return new Promise((resolve, reject) => {
                setTimeout(() => reject('timeout'), duration);
                resolve(fn(req, res));
            });
        } catch (exc) {
            return {
                statusCode: 500,
                headers: {},
                body: res.body + exc.toString()
            };
        }
    }
}

// end of api/vercelclasses.js
