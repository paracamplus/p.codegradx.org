<!-- -*- coding: utf-8 -*- -->

{#if urls.length === 0 }
  <WaitingImage message="Construction d'une Captcha..." />
{:else}

<div id='movecaptcha' class='w3-container w3-center'>
  { installHooks(), '' }
  <p> À la souris, déplacez les chiffres dans les cases vides afin de
    former la suite {#each wanted as w}{w} {/each}. Sur tablette,
    tapotez un chiffre puis tapotez la case où l'insérer.
  </p>
  
  {#if progress}<div class='waitingMessage'>{progress}</div>{/if}
  
  <div class='images'>
    <!-- first row- -->
    <div></div>
    <div class='image'><img alt='11' src='{badImage}' /></div>
    <div class='image'><img alt='12' src='{badImage}' /></div>
    <div class='image'><img alt='13' src='{badImage}' /></div>
    <div class='image'><img alt='14' src='{badImage}' /></div>
    <div class='image'><img alt='15' src='{badImage}' /></div>
    <div></div>
    
    <div></div>
    <div class='image'><img alt='21' src='{badImage}' /></div>
    <div class='image'><img alt='22' src='{badImage}' /></div>
    <div class='image'><img alt='23' src='{badImage}' /></div>
    <div class='image'><img alt='24' src='{badImage}' /></div>
    <div class='image'><img alt='25' src='{badImage}' /></div>
    <div></div>
  </div>

  <div class='targets'>
    <div></div>
    <div class='target'><img alt='a1' src='{whiteImage}'/></div>
    <div class='target'><img alt='a2' src='{whiteImage}'/></div>
    <div class='target'><img alt='a3' src='{whiteImage}'/></div>
    <div class='target'><img alt='a4' src='{whiteImage}'/></div>
    <div></div>
  </div>
</div>

{#if eventscount }
<ul>
  {#each events as e}<li>{JSON.stringify(e)}</li>{/each}
</ul>
{/if}

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
   background-color: var(--color-hover-gray);
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
   border: solid var(--color-theme-d2) 4px;
 }
</style>

<script>
 import Problem from '../components/Problem.svelte';
 import WaitingImage from '../components/WaitingImage.svelte';
 
 import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { finalcrypt } from '../server/cryptlib.mjs';
 import { sleep } from '../common/utils.mjs';
 import queryString from 'query-string';

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

 let events = []; // DEBUG
 let eventscount = 0; // DEBUG eventscount = events.length 

 const whiteImage = '/_digits/white.png';
 const badImage = '/_digits/bad.png';
 let targets = [];
 let error = undefined;
 let progress = undefined;
 let end = undefined;
 let debug = false; //DEBUG

 onMount(async () => {
   const search = queryString.parse(window.document.location.search);
   if ( search.debug ) {
     debug = true;
   }
   await refreshCaptcha(null);
 });

 async function refreshCaptcha (event) {
   error = undefined;
   progress = message.building;
   await getInfo();
   await installHooks();
 }

 async function getInfo () {
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
       end = Date.parse(expires);
     } else {
       throw response;
     }
   } catch(exc) {
     console.log('signup', 'getInfo', {exc});
     error = "Je n'arrive pas à construire la Captcha"
     progress = undefined;
   }
 }

 class Captcha {
   constructor (js) {
     Object.assign(this, js);
   }
 }

 function showevent (event, msg) {
   if ( debug ) {
     const e = {
       type: event.type,
       pointerType: event.pointerType,
       button: event.button,
       buttons: event.buttons,
       targetName: event.target.getAttribute('alt'),
       timeStamp: event.timeStamp
     };
     if (msg) events.unshift({msg});
     eventscount = events.unshift(e);
     events = events.concat([]);
     console.log(msg, event);
   }
 }

 /** There are vast differences between browsers and OS. However the
     following sequence seems to be common among mouse-based gestures.

  // entering the image:
  pointerover
  pointerenter
  // press mouse button down
  pointerdown
  // start to move the image
  dragstart
  // entering the target
  dragenter
  // stop pressing mouse button
  dragleave
  // moving within the target
  pointerover
  pointerenter
  // exit from the target
  pointerout
  pointerleave

*/

 function prepareDragAndDropHooks (images, targets) {
   for ( const image of images ) {
     image.addEventListener('pointerover', showevent);
     image.addEventListener('pointerdown', showevent);
     image.addEventListener('touchstart', (event) => {
       // Touching an image:
       showevent(event);
       error = undefined;
       const url = event.target.src;
       function dropImage (event) {
         showevent(event);
         drop(event, url);
         for ( const target of targets ) {
           target.removeEventListener('touchstart', dropImage);
         }
       }
       for ( const target of targets ) {
         target.addEventListener('touchstart', dropImage);
       }
     });
     image.addEventListener('dragstart', (event) => {
       // Start moving the image:
       showevent(event);
       error = undefined;
       const url = event.target.src;
       event.dataTransfer.setData("text/plain", url);
       event.dataTransfer.effectAllowed = 'copy';
       function dropImage (event) {
         showevent(event);
         drop(event, url);
         for ( const target of targets ) {
           target.removeEventListener('dragleave', dropImage);
         }
       }
       for ( const target of targets ) {
         target.addEventListener('dragleave', dropImage);
       }
       return true;
     });
     //image.addEventListener('touchstart', showevent);
     //image.addEventListener('touchmove', showevent);
     image.addEventListener('touchend', showevent);
     image.addEventListener('touchcancel', showevent);
     //image.addEventListener('pointerdown', showevent);
     //image.addEventListener('pointermove', showevent);
     image.addEventListener('pointerup', showevent);
     image.addEventListener('pointercancel', showevent);
     //image.addEventListener('pointerout', showevent);
     //image.addEventListener('pointerleave', showevent);
     image.addEventListener('gotpointercapture', showevent);
     image.addEventListener('lostpointercapture', showevent);
   }
   for ( const target of targets ) {
     //target.addEventListener("dragenter", illuminate);
     target.addEventListener("pointerover", illuminate);
     target.addEventListener("pointerenter", illuminate);
     target.addEventListener('pointerout', tarnish);
     target.addEventListener('pointerleave', tarnish);
     /*target.addEventListener("dragover", (event) => {   // USELESS
       showevent(event);
       event.preventDefault();
     });*/
     //target.addEventListener("dragleave", tarnish);
     target.addEventListener("drop", drop);
     //target.setPointerCapture(pointerID???);
     target.addEventListener('touchstart', showevent);
     //target.addEventListener('touchmove', showevent);
     target.addEventListener('touchend', showevent);
     target.addEventListener('touchcancel', showevent);
     //target.addEventListener('pointerover', showevent);
     //target.addEventListener('pointerenter', showevent);
     //target.addEventListener('pointerdown', showevent);
     //target.addEventListener('pointermove', showevent);
     target.addEventListener('pointerup', showevent);
     target.addEventListener('pointercancel', showevent);
     //target.addEventListener('pointerout', showevent);
     //target.addEventListener('pointerleave', showevent);
     target.addEventListener('gotpointercapture', showevent);
     target.addEventListener('lostpointercapture', showevent);
   }
 }

 async function installHooks () {
   let problematic = false;
   function loaderror () {
     error = "Chargement d'images defectueux!";
     problematic = true;
     this.setAttribute('src', badImage);
     dispatch('ready', null);
   }
   let imagesToLoad = 0;
   let loadedImages = 0;
   function loadsuccess () {
     loadedImages++;
   }

   // Fetch and stuff images...
   let movecaptcha = undefined;
   while ( true ) {
     movecaptcha = document.getElementById('movecaptcha');
     if ( movecaptcha ) break;
     await sleep(0.5);
   }
   const divimages = movecaptcha.getElementsByClassName('image');
   const images = [];
   for ( let i=0 ; i<divimages.length ; i++) {
     const divimage = divimages.item(i);
     const image = divimage.firstElementChild;
     images.push(image);
     image.onerror = loaderror;
     image.onload = loadsuccess;
     imagesToLoad++;
     image.setAttribute('src', urls[i]);
   }

   // Organize target images...
   const divtargets = movecaptcha.getElementsByClassName('target');
   targets = [];
   for ( let i=0 ; i<divtargets.length ; i++ ) {
     const target = divtargets.item(i);
     const targetImage = target.firstElementChild;
     targets.push(targetImage);
     targetImage.onerror = loaderror;
     targetImage.onload = loadsuccess;
     imagesToLoad++;
     targetImage.setAttribute('src', whiteImage);
   }

   prepareDragAndDropHooks(images, targets);
   
   progress = undefined;

   while ( ! problematic && loadedImages < imagesToLoad ) {
     await sleep(0.5);
   }
   if ( ! problematic ) {
     captcha = captcha || new Captcha({
       getResponse,
       refresh: refreshCaptcha,
       getCount: filledBoxes,
       loadedImages       
     });
     progress = undefined;
     dispatch('ready', captcha);
   }
 }

 function illuminate (event) {
   showevent(event);
   //event.preventDefault();
   if ( Date.now() < end ) {
     const target = event.target;
     target.classList.add('targeted');
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
   showevent(event);
   //event.preventDefault();
   const target = event.target;
   target.classList.remove('targeted');
 }
 function drop (event, url) {
   showevent(event);
   tarnish(event);
   if ( ! url ) {
     url = event.dataTransfer.getData("text/plain");
   }
   setTargetImage(event.target, url);
   //event.preventDefault();
   //event.stopPropagation();
 }
 function setTargetImage (target, url) {
   if ( Date.now() < end ) {
     target.setAttribute('src', url);
     // leave time to target to display the new URL:
     setTimeout(() => {
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
     }, 0);
   } else {
     error = message.finished;
     dispatch('timeout', {
       captcha,
     });
   }
 }

 // Return the number of filled boxes:
 function filledBoxes () {
   let count = 0;
   targets.forEach(target => {
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
   if ( targets.some(target => {
     const src = target.getAttribute('src');
     results.push(src.replace(/^.*\?slug=(\w+)$/, '$1'));
     return target.getAttribute('src').match(/white[.]png/);
   }) ) {
     return false;
   } else {
     //console.log({results});//DEBUG
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

