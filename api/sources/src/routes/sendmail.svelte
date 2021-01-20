<svelte:head>
  <title>CodeGradX/ConfirmationCourriel</title>
</svelte:head>

<Header />

{#if $person}
<section class='w3-container'>
  {#if sendmail}
  <p>
    Vous n'avez pas encore confirmé votre adresse électronique:
    Cliquez sur le bouton ci-dessous pour que vous soit envoyé
    un courriel adressé à <code>{$person.login}</code>.
    Ce courriel contiendra un lien vous permettant de progresser dans
    votre inscription à CodeGradX. 
  </p>
  <div class='w3-center'>
    <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
            on:click={lostpassword} >
      M'envoyer un courriel
    </button>
  </div>
  
  {:else}
  <p>
    Un courriel vient de vous être adressé. Vous pourrez cliquer sur le
    bouton ci-dessous après avoir confirmé votre adresse électronique.
  </p>
  <div class='w3-center'>
    <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
            on:click={resume} >
      Je continue
    </button>
  </div>
  {/if}

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
 import { getConfig, sleep, initializePerson } from '../client/lib.mjs';

 let href = '/connect';
 let sendmail = true;
 
 onMount(async () => {
   return initializePerson()
   .then(async () => {
     //return sapper.goto('/connect');
   });
 });

 async function lostpassword (event) {
   try {
     const login = $person.login;
     if ( ! login || login === '' ) {
       errorLogin = error = "Quel est votre courriel ?";
       return;
     }
     $person = await CodeGradX
           .getCurrentState()
           .userGetLink(login);
     sendmail = false;
   } catch (exc) {
     error = "Je ne vois pas qui vous êtes !";
   }
 }

 async function resume (event) {
   try {
     // Redirect to the /universes page with renewed credentials:
     let url = `/fromp/reconnect/${$person.token}` +
               `?site=${window.location.origin}/universes`;
     await CodeGradX.getCurrentState().sendAXServer('x', {
       path: url,
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
 
</script>
