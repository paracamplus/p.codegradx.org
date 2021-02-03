// Client utilities

/**
   Sleep for n seconds
*/

export async function sleep (seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), Math.round(1000 * seconds));
    });
}

/**
   Get cookies.

   @param {IncomingMessage} req
   @return Map(key => value)

*/

export function getCookies (req) {
    let result = new Map();
    let cookies = req.headers.cookie;
    if ( cookies ) {
        cookies = cookies.split(';');
        for ( const cookie of cookies ) {
            const nameValue = cookie.trim().split('=');
            //console.log(nameValue);
            result.set(nameValue[0], decodeURIComponent(nameValue[1]));
        }
        //console.log({cookies, result});//DEBUG
    }
    return result;
}
