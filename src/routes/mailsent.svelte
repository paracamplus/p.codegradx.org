<style>
 .personName {
   color: #334191;
   padding: 0.1em 0.5em 0.1em 0.5em;
   border-radius: 0.5em;
   border: solid 1px #334191;
 }
</style>

<svelte:head>
  <title>CodeGradX/ConfirmationCourriel</title>
</svelte:head>

<Header />

{#if $person}
<section class='w3-container'>
 <div class='w3-margin-top w3-padding'>
   <header class='w3-center w3-large bold'>
     Connexion à CodeGradX
   </header>
   <p>
     Si <code class='personName'>{$person.login}</code> est connu
     de CodeGradX, alors un courriel vient de lui être adressé.
     {#if ! $person.confirmedemail}
     Ce courriel contient un lien vous permettant de confirmer
     votre adresse électronique. Pensez ensuite à vous munir
     d'un mot de passe.
     {:else}
     Ce courriel contient un lien vous permettant de vous connecter
     à nouveau à CodeGradX.
     {/if}
     Pensez éventuellement à vérifier votre spam! 
   </p>

 </div>
</section>

{:else}
<section class='w3-container'>
  <p> Je ne sais qui vous êtes aussi vous redirige-je vers la
    page appropriée...
  </p>
</section>
{/if}

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import ShowStore from '../components/ShowStore.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { sleep } from '../common/utils.mjs';
 import { getConfig, isUser, initializePerson } from '../client/lib.mjs';

 let path = undefined;

 async function XXXreconnect (event) {
   // Redirect to the /universes page with renewed credentials:
   try {
     await CodeGradX.getCurrentState().sendAXServer('x', {
       path: path,
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/x-www-form-urlencoded'
       }
     });
   } catch (exc) {
     console.log({exc});//DEBUG
   }
 }

 onMount(async () => {
   if ( ! $person ) {
     // In case the User has already completed its enrollment and has
     // a valid safeCookie:
     $person = await CodeGradX.getCurrentUser();
     // assert(isUser($person))
   }
   // If coming from /connect, then $person is a partial user:
   if ( ! $person ) {
     await sleep(1);
     sapper.goto('/connect');
   }
 });

</script>
