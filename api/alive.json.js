module.exports=function(t,e=5e3){return async function(n,o,i){try{return new Promise(((i,r)=>{setTimeout((()=>r("timeout")),e),i(t(n,o))}))}catch(t){return{statusCode:500,headers:{},body:o.body+t.toString()}}}}((async function(t,e,n){e.setHeader("Content-Type","application/json"),e.end(JSON.stringify({kind:"alive",epoch:Date.now(),now:(new Date).toUTCString()}))}));