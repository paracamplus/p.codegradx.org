import{S as r,i as t,s as o,D as e,d as s,f as i,h as a,j as n,y as l,k as c,r as f,E as d,F as h,G as m,H as u,C as k}from"./client.914e7c04.js";function p(r){let t,o,h,m,u,k,p,w;return{c(){t=e("svg"),o=e("g"),h=e("g"),m=e("path"),u=e("path"),k=e("rect"),p=e("g"),w=e("path"),this.h()},l(r){t=s(r,"svg",{xmlns:!0,width:!0,height:!0,viewBox:!0},1);var e=i(t);o=s(e,"g",{transform:!0},1);var n=i(o);h=s(n,"g",{transform:!0},1);var l=i(h);m=s(l,"path",{d:!0,transform:!0,id:!0,style:!0},1),i(m).forEach(a),u=s(l,"path",{transform:!0,d:!0,id:!0,style:!0},1),i(u).forEach(a),l.forEach(a),k=s(n,"rect",{style:!0,width:!0,height:!0,x:!0,y:!0,transform:!0},1),i(k).forEach(a),n.forEach(a),p=s(e,"g",{id:!0,style:!0,transform:!0},1);var c=i(p);w=s(c,"path",{style:!0,d:!0},1),i(w).forEach(a),c.forEach(a),e.forEach(a),this.h()},h(){n(m,"d","M 226.41738,-88.491041 A 114.15444,116.22555 0 0 1 106.28808,5.0668218 114.15444,116.22555 0 0 1 0.39503011,-104.88137 114.15444,116.22555 0 0 1 94.622217,-225.33326"),n(m,"transform","scale(1,-1)"),n(m,"id","outercircle"),l(m,"opacity","1"),l(m,"fill",r[0]),l(m,"fill-opacity","1"),l(m,"fill-rule","nonzero"),l(m,"stroke","none"),l(m,"stroke-width","1"),l(m,"stroke-linecap","round"),l(m,"stroke-linejoin","miter"),l(m,"stroke-miterlimit","3.20000005"),l(m,"stroke-dasharray","none"),l(m,"stroke-dashoffset","2.72127938"),l(m,"stroke-opacity","1"),n(u,"transform","scale(1,-1)"),n(u,"d","M 191.7794,-94.153239 A 79.189468,85.609978 0 0 1 108.44514,-25.239935 79.189468,85.609978 0 0 1 34.986639,-106.2261 79.189468,85.609978 0 0 1 100.35248,-194.94915"),n(u,"id","innercircle"),l(u,"opacity","1"),l(u,"fill",r[1]),l(u,"fill-opacity","1"),l(u,"fill-rule","nonzero"),l(u,"stroke","none"),l(u,"stroke-width","1"),l(u,"stroke-linecap","round"),l(u,"stroke-linejoin","miter"),l(u,"stroke-miterlimit","3.20000005"),l(u,"stroke-dasharray","none"),l(u,"stroke-dashoffset","2.72127938"),l(u,"stroke-opacity","1"),n(h,"transform","matrix(1.25,0,0,-1.25,0,336.25)"),l(k,"opacity","1"),l(k,"fill",r[1]),l(k,"fill-opacity","1"),l(k,"fill-rule","nonzero"),l(k,"stroke","none"),l(k,"stroke-width","1"),l(k,"stroke-linecap","round"),l(k,"stroke-linejoin","miter"),l(k,"stroke-miterlimit","3.20000005"),l(k,"stroke-dasharray","none"),l(k,"stroke-dashoffset","2.72127938"),l(k,"stroke-opacity","1"),n(k,"width","134.25633"),n(k,"height","147.17029"),n(k,"x","94.783516"),n(k,"y","-235.13135"),n(k,"transform","matrix(1.25,0,0,1.25,0,336.25)"),n(o,"transform","translate(0,-1)"),l(w,"fill","none"),l(w,"fill-rule","evenodd"),l(w,"stroke",r[0]),l(w,"stroke-width","50"),l(w,"stroke-linecap","round"),l(w,"stroke-linejoin","round"),l(w,"stroke-miterlimit","4"),l(w,"stroke-dasharray","none"),l(w,"stroke-opacity","1"),n(w,"d","m 86.619135,150.58535 c 79.918635,0.36549 149.603795,-0.73096 221.116355,0.36549 0,0 -9.03181,-61.277337 -39.43166,-85.562193 C 237.90398,41.103791 185.29916,25.956138 185.29916,25.956138 l 0.36549,230.253392"),n(p,"id","layer2top"),l(p,"display","inline"),n(p,"transform","translate(0,-1)"),n(t,"xmlns","http://www.w3.org/2000/svg"),n(t,"width",r[2]),n(t,"height",r[3]),n(t,"viewBox","0 0 "+g+" "+y)},m(r,e){c(r,t,e),f(t,o),f(o,h),f(h,m),f(h,u),f(o,k),f(t,p),f(p,w)},p(r,[t]){1&t&&l(m,"fill",r[0]),2&t&&l(u,"fill",r[1]),2&t&&l(k,"fill",r[1]),1&t&&l(w,"stroke",r[0])},i:d,o:d,d(r){r&&a(t)}}}let g=332.73508,y=341.99368;function w(r,t,o){let{size:e="1em"}=t,{fgcolor:s="#ffffff"}=t,{bgcolor:i="#20295b"}=t,a=e,n=e;return r.$$set=r=>{"size"in r&&o(4,e=r.size),"fgcolor"in r&&o(0,s=r.fgcolor),"bgcolor"in r&&o(1,i=r.bgcolor)},[s,i,a,n,e]}class v extends r{constructor(r){super(),t(this,r,w,p,o,{size:4,fgcolor:0,bgcolor:1})}}const x=h(void 0),E={x:{url:"https://x.codegradx.org"}};function z(){return E}async function j(r){return new Promise(((t,o)=>{setTimeout((()=>t(!0)),1e3*r)}))}async function $(r){return r?r.confirmedemail?r.confirmedua<r.uaversion?"/signua":(C(r)||($person=await m.getCurrentUser()),"/universes"):"/sendmail":void 0}async function b(){let r=u(x);if(r||(r=await m.getCurrentUser(),x.set(r)),r){const t=await $(r),o=document.location.pathname.replace(/^.*(\/\w+)/,"$1");if(t&&t!==o)return console.log(`From ${o}: goto ${t}`),k(t)}return Promise.resolve(r)}function C(r){return r&&r instanceof m.User&&r.pseudo}export{v as P,b as a,$ as d,z as g,C as i,x as p,j as s};