// Client library.

/** 
    NOTA: this library has dependencies.
*/

import { get } from 'svelte/store';
import { person, config } from '../stores.mjs';
import * as sapper from '@sapper/app';
import { CodeGradX } from 'codegradx';

export function setConfig ($config) {
    config.set($config);
    return $config;
}

export async function configureConfig () {
    const hostname = window.document.location.hostname;
    let $config = get(config);
    if ( $config.from === hostname ) {
        console.log(`already fetched config from ${hostname}`);//DEBUG
        return $config;
    }
    try {
        $config = { hostname };
        const response = await fetch(`/${hostname}.json`);
        if ( response.ok ) {
            const ct = response.headers.get('Content-Type');
            if ( ct && ct.startsWith('application/json') ) {
                $config = await response.json();
                console.log(`fetched config from ${hostname}`);//DEBUG
                // Note to avoid repeating the previous fetch
                $config.from = hostname;
            } else {
                console.log(`No extra configuration`);//DEBUG
            }
        }
    } catch (exc) {
        // ignore
        console.log(`fetch config problem from ${hostname}`, {exc}); //DEBUG
    } finally {
        config.set($config);
        //console.log($config);//DEBUG
    }
    return $config;
}

/**
   An enhanced sapper.goto taking care of the common URL prefix.

   @returns Promise
*/

export function goto (uri) {
    const newUrl = buildGoto(uri);
    window.history.pushState({
        previousUrl: window.document.location.pathname,
        newUrl
    }, null, newUrl );
    return sapper.goto(newUrl);
}

/*
  Build an URL taking care of the common URL prefix.

  @returns {String} - url where to go 
*/

export function buildGoto (uri) {
    let $config = get(config);
    let prefix = $config.urlPrefix || '/';
    prefix = prefix.replace(/\/*$/, '');
    uri = uri.replace(/^\/*/, '');
    return `${prefix}/${uri}`;
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
        // Make sure $person holds a User, not a PartialUser
        if ( ! isUser(json) ) {
            person.set(await CodeGradX.getCurrentUser());
        }
    }
    return undefined;
}

/**
   When accessing a page in the sequence (connect, sendmail, mailsent, 
   signua, universes) try to determine the status of the user and
   redirect it to the appropriate step. 

   returns a Promise. Either a Promise yielding a User or a Promise
   navigating to an appropriate page when the user has not fulfilled
   its registration.

   @returns {Promise<User>}
*/

export async function initializePerson () {
    let $person = get(person);
    if ( ! $person ) {
        try {
            $person = await CodeGradX.getCurrentUser();
            person.set($person);
        } catch (exc) {
            // ignore! the user is not authenticated and will be
            // considered as anonymous
        }
    }
    if ( $person ) {
        // Redirect towards email confirmation or UA signature if needed:
        const href = await determineNextUserState($person);
        const where = document.location.pathname.replace(/^.*(\/\w+)/, '$1');
        if ( href && href !== where ) {
            //console.log(`From ${where}: goto ${href}`);
            return goto(href);
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
    return o &&
        o instanceof CodeGradX.User &&
        o.pseudo &&
        o.cookie;
}

/**
   remember that components (in the html part) are loaded before
   onMount so, from time to time, some objects are not instance of
   the right class even if they have the same fields. TO BE DEEPENED!!!
*/

export function isCampaign (o) {
    return o && o instanceof CodeGradX.Campaign;
}

export function isTeacher (campaign, person) {
    if ( campaign && person ) {
        if ( person._all_campaigns ) {
            let c = person._all_campaigns[campaign.name];
            if ( c ) {
                return !!c.isTeacher;
            }
        } else if ( person._campaigns ) {
            let c = person._campaigns[campaign.name];
            if ( c ) {
                return !!c.isTeacher;
            }
        }
    }
    return false;
}

// end of client/lib.mjs
