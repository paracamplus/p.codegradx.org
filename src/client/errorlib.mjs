/**
   Parse server anomaly and produce a string able to be displayed to
   the user.

   @returns {String} 
*/

const messages = {
    e109: "Je ne vois le fichier que vous m'avez envoyé!",
    e115: "Vous n'avez pas le statut d'auteur d'exercices",
    e118: "Je ne peux archiver votre jeu d'exercices!",
    e126: "Je ne vous connais point!",
    e146: "Vous n'êtes pas un apprenant de cet univers!",
    e190: "Êtes-vous sûr du nom de cet univers ?",
    e215: "Cette action ne vous est pas autorisée.",
    XXXYYYZZ: ''
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
    } else if ( o instanceof TypeError || o instanceof ReferenceError ) {
        console.log(o);
        return `Erreur interne au client!`;
    } else if ( o instanceof Error ) {
        console.log(o.message);
        return o.message;
    } else {
        return JSON.stringify(o);
    }
}

// end of errorlib.mjs
