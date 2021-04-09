<style>
</style>

<section class='w3-card-4 w3-margin'>
  <header class='w3-xlarge w3-center w3-theme-d2'>
    Conditions d'utilisation
  </header>
  {#if ua}
  <div class='w3-margin w3-padding-bottom'>
    {@html ua}
  </div>
  {:else}
    <p class='waitingMessage'>Chargement des conditions d'utilisation ...</p>
    <WaitingImage />
  {/if}
</section>

<!-- 

Code in script context=module is run on the server and on the client.
 
According to https://github.com/sveltejs/sapper/issues/221
only page-level components can use preload, not child components.
So it is not possible to preload the user agreement.

-->

<script>
 import WaitingImage from './WaitingImage.svelte';
 
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx';
 import { onClient } from '../common/utils.mjs';

 let ua = undefined;

 onClient(async () => {
   ua = await getUA();
 });

 async function getUA () {
   try {
     const state = CodeGradX.getCurrentState();
     const response = await state.sendAXServer('x', {
       path: '/fromp/getua?lang=fr',
       method: 'GET',
       headers: {
         'Accept': 'text/html',
         'Content-Type': 'application/x-www-form-urlencoded'
       }
     });
     if ( response.ok ) {
       return response.entity;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('within getUA', {exc});//DEBUG
     return "Problème d'accès au serveur!";
   }
 }

</script>
