import{S as s,i as a,s as e,b as t,a as n,e as r,c,d as i,f as o,g as l,h as u,j as d,k as h,m as v,l as f,t as m,n as p,o as $,p as g,q as z,r as x,u as E,v as w,w as D,x as j,y,z as C,A as b,B as I,C as V}from"./client.538507c0.js";import{P as k,i as q,a as B,p as G}from"./lib.ded58b2e.js";function P(s){let a,e,g,z;function x(a){s[1].call(null,a)}let E={};return void 0!==s[0]&&(E.size=s[0]),e=new k({props:E}),t.push((()=>n(e,"size",x))),{c(){a=r("div"),c(e.$$.fragment),this.h()},l(s){a=i(s,"DIV",{class:!0});var t=o(a);l(e.$$.fragment,t),t.forEach(u),this.h()},h(){d(a,"class","w3-container w3-center")},m(s,t){h(s,a,t),v(e,a,null),z=!0},p(s,[a]){const t={};!g&&1&a&&(g=!0,t.size=s[0],f((()=>g=!1))),e.$set(t)},i(s){z||(m(e.$$.fragment,s),z=!0)},o(s){p(e.$$.fragment,s),z=!1},d(s){s&&u(a),$(e)}}}function X(s,a,e){let{size:t="1em"}=a;return s.$$set=s=>{"size"in s&&e(0,t=s.size)},[t,function(s){t=s,e(0,t)}]}class A extends s{constructor(s){super(),a(this,s,X,P,e,{size:0})}}function N(s){let a,e,t,n,c=s[0].pseudo+"";return{c(){a=r("p"),e=g("Bonjour "),t=g(c),n=g(","),this.h()},l(s){a=i(s,"P",{class:!0});var r=o(a);e=z(r,"Bonjour "),t=z(r,c),n=z(r,","),r.forEach(u),this.h()},h(){d(a,"class","text svelte-1ic78iv")},m(s,r){h(s,a,r),x(a,e),x(a,t),x(a,n)},p(s,a){1&a&&c!==(c=s[0].pseudo+"")&&E(t,c)},d(s){s&&u(a)}}}function R(s){let a,e,t,n,f,E,b,I,V,k,B,G,P,X,R,S=q(s[0]);I=new A({props:{size:"25%"}});let T=S&&N(s);return{c(){a=w(),e=r("div"),t=r("center"),n=r("div"),f=g("CodeGradX"),E=w(),b=r("div"),c(I.$$.fragment),V=w(),T&&T.c(),k=w(),B=r("p"),G=g("Découvrez ses exercices de programmation à notation\n      automatique..."),this.h()},l(s){D('[data-svelte="svelte-1xs3cta"]',document.head).forEach(u),a=j(s),e=i(s,"DIV",{class:!0});var r=o(e);t=i(r,"CENTER",{});var c=o(t);n=i(c,"DIV",{class:!0,style:!0});var d=o(n);f=z(d,"CodeGradX"),d.forEach(u),E=j(c),b=i(c,"DIV",{style:!0});var h=o(b);l(I.$$.fragment,h),h.forEach(u),V=j(c),T&&T.l(c),k=j(c),B=i(c,"P",{class:!0});var v=o(B);G=z(v,"Découvrez ses exercices de programmation à notation\n      automatique..."),v.forEach(u),c.forEach(u),r.forEach(u),this.h()},h(){document.title="CodeGradX",d(n,"class","text svelte-1ic78iv"),y(n,"padding-top","10vh"),y(b,"margin-top","10vh"),d(B,"class","text svelte-1ic78iv"),d(e,"class","w3-container background svelte-1ic78iv")},m(r,c){h(r,a,c),h(r,e,c),x(e,t),x(t,n),x(n,f),x(t,E),x(t,b),v(I,b,null),x(t,V),T&&T.m(t,null),x(t,k),x(t,B),x(B,G),P=!0,X||(R=C(e,"click",s[1]),X=!0)},p(s,[a]){1&a&&(S=q(s[0])),S?T?T.p(s,a):(T=N(s),T.c(),T.m(t,k)):T&&(T.d(1),T=null)},i(s){P||(m(I.$$.fragment,s),P=!0)},o(s){p(I.$$.fragment,s),P=!1},d(s){s&&u(a),s&&u(e),$(I),T&&T.d(),X=!1,R()}}}function S(s,a,e){let t;return b(s,G,(s=>e(0,t=s))),I((async()=>B().then((async()=>V("/universes"))))),[t,function(s){V("/universes")}]}export default class extends s{constructor(s){super(),a(this,s,S,R,e,{})}}