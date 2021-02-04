// Sanitize fields

export function sanitizeName (s) {
    s = s.replace(/[^\w-]/g, '');
    return s;
}

const re = /^\w+([.-_]?\w+)*@(\w+([\.-]?\w+)*[.])+\w{2,}$/;

export function checkEmail (s) {
    return re.test(s);
}

export const chars = ':~!?@#$%^&*()_=+,./-';
const reSpecialChars = new RegExp(`[${chars}]`);
const reRejectedChars = new RegExp(`[^a-z0-9${chars}]`, 'i');

export function checkPassword (password) {
    if ( password.length < 12 ) {
        return false;
    }
    if ( ! password.match(/[A-Z]/) ) {
        return false;
    }
    if ( ! password.match(/[a-z]/) ) {
        return false;
    }
    if ( ! password.match(/[0-9]/) ) {
        return false;
    }
    if ( ! password.match(reSpecialChars) ) {
        return false;
    }
    return true;
}

export function sanitizePassword (s) {
    if ( s ) {
        s = s.replace(reRejectedChars, '');
    }
    return s;
}

// end of sanitizers.mjs
