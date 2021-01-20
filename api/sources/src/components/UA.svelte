<style>
</style>

{#if ua}
<section class='w3-card-4 w3-margin'>
  <header class='w3-xlarge w3-center w3-theme-d2'>
    Conditions d'utilisation
  </header>
  <div class='w3-margin w3-padding-bottom'>
    {@html ua}
  </div>
</section>
{/if}

<script>
 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';

 let ua = undefined;

 onMount(async () => {
   return initializePerson()
     .then(async () => {
        ua = await getUA();
   });
 });

 async function getUA () {
   try {
     const response = await CodeGradX.getCurrentState().sendAXServer('x', {
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
       return "Problème d'accès au serveur!";
     }
   } catch (exc) {
     console.log({exc});//DEBUG
   }
}

</script>
