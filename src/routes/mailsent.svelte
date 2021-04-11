<!--
      Information asking to confirm email
-->

<style>
</style>

<Page shortTitle="ConfirmationCourriel"
      title="Connexion à CodeGradX" >

{#if $person}
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

{:else}

  <p> Je ne sais qui vous êtes aussi vous redirigé-je vers la
    page appropriée...
  </p>

{/if}

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import ShowStore from '../components/ShowStore.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { isUser, initializePerson, goto } from '../client/lib.mjs';

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
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
   }
 });

</script>
