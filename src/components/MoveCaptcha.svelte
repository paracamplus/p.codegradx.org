<!-- -*- coding: utf-8 -*- -->

{#if urls.length === 0 }
<div></div>

{:else}

<div id='movecaptcha' class='w3-container w3-center'>
  { installHooks(), '' }
  <p> Déplacez les chiffres dans les cases vides afin de former la
    suite {#each wanted as w}{w} {/each}.
  </p>
  
  {#if progress}<div class='w3-green'>{progress}</div>{/if}
  
  <div class='images'>
    <!-- first row- -->
    <div></div>
    <div class='image'><img alt='11' src='/_digits/white.png' /></div>
    <div class='image'><img alt='12' src='/_digits/white.png' /></div>
    <div class='image'><img alt='13' src='/_digits/white.png' /></div>
    <div class='image'><img alt='14' src='/_digits/white.png' /></div>
    <div class='image'><img alt='15' src='/_digits/white.png' /></div>
    <div></div>
    
    <div></div>
    <div class='image'><img alt='21' src='/_digits/white.png' /></div>
    <div class='image'><img alt='22' src='/_digits/white.png' /></div>
    <div class='image'><img alt='23' src='/_digits/white.png' /></div>
    <div class='image'><img alt='24' src='/_digits/white.png' /></div>
    <div class='image'><img alt='25' src='/_digits/white.png' /></div>
    <div></div>
  </div>

  <div class='targets'>
    <div></div>
    <div class='target'><img alt='a1' src='/_digits/white.png'/></div>
    <div class='target'><img alt='a2' src='/_digits/white.png'/></div>
    <div class='target'><img alt='a3' src='/_digits/white.png'/></div>
    <div class='target'><img alt='a4' src='/_digits/white.png'/></div>
    <div></div>
  </div>
</div>

{/if}

{#if error}<Problem bind:error={error} />{/if}
  

<style>
 div.targets {
   margin-top: 4em;
   display: grid;
   grid-template-columns: auto 3em 3em 3em 3em auto;
   justify-items: center;
   grid-column-gap: 1em;
 }
 div.targets div.target {
   width: 3em;
   background-color: #eee;
 }
 div.targets div.target img {
   width: 3em;
   height: 3em;
 }
 
 div.images {
   margin-top: 1em;
   display: grid;
   grid-template-columns: auto 3em 3em 3em 3em 3em auto;
   grid-template-rows: 3em 3em;
   justify-items: center;
   grid-column-gap: 1em;
   grid-row-gap: 1em;
 }
 div.images div.image {
   width: 3em;
   background-color: white;
 }
 div.images div.image img {
   width: 3em;
   height: 3em;
 }
 :global( img.targeted ) {
   border: solid #334191 4px;
 }
</style>

<script>
 import Problem from '../components/Problem.svelte';
 
 import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { finalcrypt } from '../cryptlib.mjs';

 const message = {
   building: "Construction d'une Captcha...",
   finished: `Navré mais les 2 minutes pendant lesquelles 
vous pouviez résoudre la captcha sont écoulées.`,
   badcaptcha: "Je n'arrive pas à construire la Captcha"
 };

 let captcha = undefined;
 let nonce = undefined;
 let wanted = [];
 let urls = [];
 let expires = undefined;

 const prefixurl = '/digit';
 const whiteImage = '/_digits/white.png';
 let targetsArray = [];
 let error = undefined;
 let progress = message.building;
 $: end = computeEnd(expires);

 onMount(() => {
   error = undefined;
   getInfo(true);
 });

 async function getInfo (bool) {
   if ( bool ) {
     try {
       const response = await fetch('/api/signupinit.json');
       //console.log(response);//DEBUG
       if ( response.ok ) {
         response.entity = await response.json();
         //console.log('signup', response.entity);//DEBUG
         nonce = response.entity.nonce;
         wanted = response.entity.wanted;
         urls = response.entity.urls;
         expires = response.entity.expires;
       } else {
         throw response;
       }
     } catch(exc) {
       console.log('signup', 'getInfo', exc);
       error = message.badcaptcha;
       progress = undefined;
     }
   }
 }

 function computeEnd (expires) {
   if ( typeof document !== 'undefined' ) {
     installHooks();
     return Date.parse(expires);
   }
 }
 
 async function refreshCaptcha (event) {
   error = undefined;
   await getInfo(true);
 }

 function installHooks () {
   error = undefined;
   // Leave time to #movecaptcha to be created:
   setTimeout(doInstallHooks, 1000);
   end = Date.parse(expires);
 }

 function doInstallHooks () {
   const movecaptcha = document.getElementById('movecaptcha');
   const images = movecaptcha.getElementsByClassName('image');
   for ( let i=0 ; i<images.length ; i++) {
     const divimage = images.item(i);
     const image = divimage.firstElementChild;
     image.setAttribute('src', urls[i]);
     image.addEventListener('dragstart', (event) => {
       error = undefined;
       event.dataTransfer.setData("text/plain", event.target.src);
       event.dataTransfer.effectAllowed = 'copy';
       return true;
     });
   }
   
   const targets = movecaptcha.getElementsByClassName('target');
   targetsArray = [];
   for ( let i=0 ; i<targets.length ; i++ ) {
     const target = targets.item(i);
     const targetImage = target.firstElementChild;
     targetsArray.push(targetImage);
     targetImage.setAttribute('src', whiteImage);
     target.addEventListener("dragenter", illuminate);
     target.addEventListener("dragover", (event) => {
       event.preventDefault();
     });
     target.addEventListener("dragleave", tarnish);
     target.addEventListener("drop", drop);
   }
   captcha = captcha || {
     getResponse,
     refresh: refreshCaptcha,
     getCount: filledBoxes
   };
   progress = undefined;
   dispatch('ready', captcha);
 }

 function illuminate (event) {
   event.preventDefault();
   if ( Date.now() < end ) {
     const target = event.target;
     const classes = target.getAttribute('class') + ' targeted';
     target.setAttribute('class', classes);
   } else {
     error = message.finished;
     event.preventDefault();
     event.stopPropagation();
     dispatch('timeout', {
       captcha,
     });
   }
 }
 function tarnish (event) {
   event.preventDefault();
   const target = event.target;
   const classes = target.getAttribute('class').replace(/ targeted/, '');
   target.setAttribute('class', classes);
 }
 function drop (event) {
   if ( Date.now() < end ) {
     tarnish(event);
     event.target.setAttribute('src', event.dataTransfer.getData("text/plain"));
     dispatch('change', {
       captcha,
       count: filledBoxes()
     });
     if ( isComplete() ) {
       dispatch('complete', {
         captcha,
         complete: true
       });
     }
   } else {
     error = message.finished;
     event.preventDefault();
     event.stopPropagation();
     dispatch('timeout', {
       captcha,
     });
   }
 }

 // Return the number of filled boxes:
 function filledBoxes () {
   let count = 0;
   targetsArray.forEach(target => {
     const src = target.getAttribute('src');
     if ( ! target.getAttribute('src').match(/white[.]png/) ) {
       count++;
     }
   });
   return count;
 }

 // semi-predicate returning the set of images filling boxes:
 function isComplete () {
   let results = [];
   if ( targetsArray.some(target => {
     const src = target.getAttribute('src');
     results.push(src.replace(/^.*\/(\w+)[.]png$/, '$1'));
     return target.getAttribute('src').match(/white[.]png/);
   }) ) {
     return false;
   } else {
     return results;
   }
 }

 // Return the result of the solved captcha:
 function getResponse () {
   if ( Date.now() < end ) {
     let results = isComplete();
     //console.log('results', results);//DEBUG
     if ( results ) {
       let content = btoa(`${nonce},${results.join(',')}`);
       return `movecaptcha,${content}`;
     } else {
       return false;
     }
   } else {
     error = message.finished;
     dispatch('timeout', {
       captcha,
     });
     return false;
   }
 }

</script>

