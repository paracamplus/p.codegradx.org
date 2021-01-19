// Client library

import { get } from 'svelte/store';
import { person } from '../stores.mjs';
import * as sapper from '@sapper/app';
import { CodeGradX } from 'codegradx';

let dev = false;

const config = {
    x: {
        url: 'https://x.codegradx.org'
    }
};

export function getConfig () {
    return config;
}

/**
   Sleep for n seconds
*/

export async function sleep (seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), 1000 * seconds);
    });
}

/**
   Determine what the user has to complete.

   json is a User or a PartialUser. They both have the
   confirmedemail and confirmedua and uaversion fields.
*/

export async function determineNextUserState (json) {
    if ( json ) {
        if ( ! json.confirmedemail ) {
            return '/sendmail';
        }
        if ( json.confirmedua < json.uaversion ) {
            return '/signua';
        }
        // Make sure $person holds a User, not a PartiaUser
        if ( ! isUser(json) ) {
            $person = await CodeGradX.getCurrentUser();
        }
        return '/universes';
    } else {
        return undefined;
    }
}

/**
   When accessing a page in the sequence (connect, sendmail, mailsent, 
   signua, universes) try to determine the status of the user and
   redirect it to the appropriate step.

   @return {Promise<User>}
*/

export async function initializePerson () {
    let $person = get(person);
    if ( ! $person ) {
        $person = await CodeGradX.getCurrentUser();
        person.set($person);
    }
    if ( $person ) {
        const href = await determineNextUserState($person);
        const where = document.location.pathname.replace(/^.*(\/\w+)/, '$1');
        if ( href && href !== where ) {
            console.log(`From ${where}: goto ${href}`);
            return sapper.goto(href);
        }
    }
    return Promise.resolve($person);
}

/**
   $person might be undefined or an instance of CodeGradX.User or
   an object (a PartialUser). One constant difference between User
   and PartialUser is the presence of the 'pseudo' field.

 */

export function isUser (o) {
    return o && o instanceof CodeGradX.User && o.pseudo;
} 

// end of client/lib.mjs
