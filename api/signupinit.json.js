var e=require("codegradx");const t=["./secrets/","/run/secrets/"],s="fkeyPublic";function o(e=s){return function(e,s){let o;if(process.env[s.toUpperCase()])o=process.env[s.toUpperCase()],o=o.replace(/@/g,"\n");else{const e=require("fs");try{for(const n of t){const t=`${n}/${s}`;if(e.existsSync(t)){o=e.readFileSync(t);break}}}catch(e){throw e}}if(!o)throw new Error(`Missing key ${s}`);try{return e({key:o,format:"pem"})}catch(e){throw e}}(require("crypto").createPublicKey,e)}const n=require("node-fetch");class r{constructor(e){this.request=e,this.url=e.url,this.query=e.query,this.cookies=[];let t="";Object.keys(e.cookies).forEach((s=>{const o=`${s}=${encodeURIComponent(e.cookies[s])}`;t+=`${o};`,this.cookies.push(o)})),this.headers={cookie:t}}}class i{constructor(e){this.statusCode=500,this.response=e,this.statusMessage="Server problem",this.body="",this["Content-Type"]="application/json"}setHeader(e,t){this.response.setHeader(e,t)}statusMessage(e){console.log(`ignore statusMessage(${e})`)}statusCode(e){this.response.status(e)}end(e){this.response.send(e)}}module.exports=function(e,t=5e3){return async function(s,o,n){try{const n=new r(s),c=new i(o);return new Promise(((s,o)=>{setTimeout((()=>o("timeout")),t),s(e(n,c))}))}catch(e){return{statusCode:500,headers:{},body:o.body+e.toString()}}}}((async function(t,s,r){const i=new e.CodeGradX.State;i.servers=i.defaultservers,i.fetch=n,i.sendAXServer("x",{path:"/movecaptchainfo",method:"GET",headers:{Accept:"application/json"}}).then((t=>{if("JSON"!==t.entityKind)throw"bad answer";const n=t.entity.nonce,r=t.entity.wanted,i=e.CodeGradX._str2Date(t.entity.expires).toUTCString(),c=t.entity.images,a=function(e){for(let t=e.length-1;t>0;t--){const s=Math.floor(Math.random()*(t+1)),o=e[s];e[s]=e[t],e[t]=o}return e}(c.map((e=>`/api/digit.js?slug=${e}`)));let u=`${n},${r.join("")},${c.join(",")}`;u=function(e){const t=require("crypto");let s=[];const n=o();function r(e){let o=t.publicEncrypt(n,Buffer.from(e));o=o.toString("base64"),o=encodeURIComponent(o),s.push(o)}for(;e.length>0;)r(e.slice(0,80)),e=e.slice(80);return s.join(",")}(u);let p=`MV=${u}; path=/digit/; expires=${i};`;s.setHeader("Set-Cookie",p),s.setHeader("Content-Type","application/json"),s.end(JSON.stringify({nonce:n,wanted:r,urls:a,expires:i}))})).catch((e=>{console.log("signupinit PB",i.log),console.log("signupinit PB",e);let t=`Problem\nexception: ${e.toString()}\nstate.log is\n${i.log.items.join("\n")}\n`;s.statusCode=500,s.statusMessage="Erroneous movecaptchainfo",s.setHeader("Content-Type","text/plain"),s.end(t)}))}));
