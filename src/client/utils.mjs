//

import { htmlencode } from 'codegradx/src/htmlencode';

export function shorten (s, len=15) {
    const re = new RegExp(`^(.{${len}}).*\$`);
    s = s.replace(re, '$1');
    if ( s.length >= len ) {
        s = `${s}...`;
    }
    return s;
}

 /** 
     The global report may have very long lines. So instead of using
     a PRE context, we use a DIV so words are wrapped but we convert
     end-of-lines into BR.
  */
 export function massagePRE (text) {
     let s = htmlencode(text);
     s = s.replace(/ /g, '&nbsp;')
         .replace(/\n/g, '<br />');
     return `<div>${s}</div>`;
 }

// end of utils.mjs
