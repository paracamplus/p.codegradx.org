/**
   Parse server anomaly and produce a string able to be displayed to
   the user.

   @returns {String} 
*/

const messages = {
    e215: "Cette action ne vous est pas autorisée.",
    e190: "Êtes-vous sûr du nom de cet univers ?"
};

export function parseAnomaly (o) {
    if ( typeof o === 'string' ) {
        return o;
    }
    if ( o instanceof Response ) {
        if ( o.entityKind && o.entityKind === 'JSON' ) {
            const { kind, errcode, httpcode, reason } = o.entity;
            for ( const key of Object.keys(messages) ) {
                if ( reason.match(key) ) {
                    return messages[key];
                }
            }
            return reason;
        }
        if ( o.status === 500 ) {
            return o.statusText;
        }
        return "o is a Response";
    }
    if ( o instanceof TypeError || o instanceof ReferenceError ) {
        console.log(o);
        return `Erreur interne au client!`;
    }
    return JSON.stringify(o);
}

// end of errorlib.mjs
