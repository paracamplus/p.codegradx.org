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
  <p>
    Si <code class='personName'>{$person.login}</code> est connu
    de CodeGradX, alors un courriel vient de lui être adressé.
    {#if ! $person.confirmedemail}
    Ce courriel contient un lien vous permettant de confirmer
    votre adresse électronique.
    {:else}
    Ce courriel contient un lien vous permettant de vous connecter
    à nouveau à CodeGradX.
    {/if}
    Pensez éventuellement à vérifier votre spam!
  </p>

  <p> Pour rappel </p>
  <ul>
    {#if $person.confirmedemail}
    <li> Vous avez déjà confirmé votre adresse électronique. </li>
    {:else}
    <li> Vous n'avez pas encore confirmé votre adresse électronique. </li>
    {/if}
    
    {#if $person.confirmedua === $person.uaversion}
    <li> Vous avez déjà signé les conditions d'usage. </li>
    {:else}
    <li> Vous n'avez pas encore signé les conditions d'usage. </li>
    {/if}
  </ul>
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
 import { getConfig, sleep } from '../client/lib.mjs';
 import { isUser, initializePerson } from '../client/lib.mjs';

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
