import{S as e,i as s,s as a,v as n,c as t,e as r,p as c,w as o,h as i,x as d,g as l,d as u,f as m,q as p,j as f,k as g,m as $,r as v,z as h,E as w,t as x,n as E,o as b,A as C,B as j,G as q,N as A,C as S}from"./client.2a673209.js";import{a as y,p as z}from"./lib.98d03415.js";import{H as G,B as T}from"./Bottom.f5e64682.js";import{U}from"./UA.58cddfcc.js";function V(e){let s,a,C,j,q,A,S,y,z,V,k,B,P,X,N,I,J,O,D,H,F,K,L;return a=new G({}),X=new U({}),H=new T({}),{c(){s=n(),t(a.$$.fragment),C=n(),j=r("section"),q=r("p"),A=c("Votre adresse électronique est maintenant confirmée."),S=n(),y=r("p"),z=c("Vous pouvez maintenant finaliser votre inscription en prenant\n    connaissance des dispositions légales quant à votre usage de\n    l'infrastructure CodeGradX. Si vous êtes d'accord avec ces conditions\n    d'usage, n'oubliez pas de les accepter en bas de page."),V=n(),k=r("p"),B=c("Accepter ces conditions d'usage c'est, en très gros, accepter de\n    donner ses programmes à la science afin d'aider les auteurs\n    à améliorer leurs exercices."),P=n(),t(X.$$.fragment),N=n(),I=r("div"),J=r("button"),O=c("J'accepte ces conditions!"),D=n(),t(H.$$.fragment),this.h()},l(e){o('[data-svelte="svelte-pq4mt8"]',document.head).forEach(i),s=d(e),l(a.$$.fragment,e),C=d(e),j=u(e,"SECTION",{class:!0});var n=m(j);q=u(n,"P",{});var t=m(q);A=p(t,"Votre adresse électronique est maintenant confirmée."),t.forEach(i),S=d(n),y=u(n,"P",{});var r=m(y);z=p(r,"Vous pouvez maintenant finaliser votre inscription en prenant\n    connaissance des dispositions légales quant à votre usage de\n    l'infrastructure CodeGradX. Si vous êtes d'accord avec ces conditions\n    d'usage, n'oubliez pas de les accepter en bas de page."),r.forEach(i),V=d(n),k=u(n,"P",{});var c=m(k);B=p(c,"Accepter ces conditions d'usage c'est, en très gros, accepter de\n    donner ses programmes à la science afin d'aider les auteurs\n    à améliorer leurs exercices."),c.forEach(i),n.forEach(i),P=d(e),l(X.$$.fragment,e),N=d(e),I=u(e,"DIV",{class:!0});var f=m(I);J=u(f,"BUTTON",{class:!0});var g=m(J);O=p(g,"J'accepte ces conditions!"),g.forEach(i),f.forEach(i),D=d(e),l(H.$$.fragment,e),this.h()},h(){document.title="CodeGradX/ConditionsUsage",f(j,"class","w3-container"),f(J,"class","w3-btn w3-theme-d1 w3-round-xxlarge"),f(I,"class","w3-container w3-center w3-margin-bottom")},m(n,t){g(n,s,t),$(a,n,t),g(n,C,t),g(n,j,t),v(j,q),v(q,A),v(j,S),v(j,y),v(y,z),v(j,V),v(j,k),v(k,B),g(n,P,t),$(X,n,t),g(n,N,t),g(n,I,t),v(I,J),v(J,O),g(n,D,t),$(H,n,t),F=!0,K||(L=h(J,"click",e[0]),K=!0)},p:w,i(e){F||(x(a.$$.fragment,e),x(X.$$.fragment,e),x(H.$$.fragment,e),F=!0)},o(e){E(a.$$.fragment,e),E(X.$$.fragment,e),E(H.$$.fragment,e),F=!1},d(e){e&&i(s),b(a,e),e&&i(C),e&&i(j),e&&i(P),b(X,e),e&&i(N),e&&i(I),e&&i(D),b(H,e),K=!1,L()}}}function k(e,s,a){let n;return C(e,z,(e=>a(1,n=e))),j((async()=>y())),[async function(e){try{const e=await q.getCurrentState().sendAXServer("x",{path:`/fromp/sign/${n.token}`,method:"GET",headers:{Accept:"application/json","Content-Type":"application/x-www-form-urlencoded"}});return e.ok?(A(z,n=new q.User(e.entity),n),S("/universes")):"Problème d'accès au serveur!"}catch(e){console.log({exc:e})}}]}export default class extends e{constructor(e){super(),s(this,e,k,V,a,{})}}
