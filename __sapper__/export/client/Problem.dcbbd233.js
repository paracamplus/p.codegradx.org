import{S as s,i as r,s as a,e,p as t,d as n,f as c,q as o,h as l,j as i,k as u,r as d,u as p,O as h,E as f}from"./client.914e7c04.js";function m(s){let r,a;return{c(){r=e("div"),a=t(s[0]),this.h()},l(e){r=n(e,"DIV",{class:!0});var t=c(r);a=o(t,s[0]),t.forEach(l),this.h()},h(){i(r,"class","w3-panel w3-red")},m(s,e){u(s,r,e),d(r,a)},p(s,r){1&r&&p(a,s[0])},d(s){s&&l(r)}}}function j(s){let r,a=s[0]&&m(s);return{c(){a&&a.c(),r=h()},l(s){a&&a.l(s),r=h()},m(s,e){a&&a.m(s,e),u(s,r,e)},p(s,[e]){s[0]?a?a.p(s,e):(a=m(s),a.c(),a.m(r.parentNode,r)):a&&(a.d(1),a=null)},i:f,o:f,d(s){a&&a.d(s),s&&l(r)}}}function v(s,r,a){let{error:e}=r;return s.$$set=s=>{"error"in s&&a(0,e=s.error)},[e]}class w extends s{constructor(s){super(),r(this,s,v,j,a,{error:0})}}export{w as P};