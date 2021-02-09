<style>
 header.bold {
   font-weight: bold;
 }
</style>

<svelte:head>
  <title>CodeGradX/Identification</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Qui êtes vous ?
      <span class='w3-right w3-margin-left w3-xlarge'
            on:click={showHelp}><InformationSign /></span>
    </header>

    {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}
    
    <p>
      Si vous n'avez pas encore créé de compte sur CodeGradX, vous pouvez
      cliquer sur le bouton « Je m'inscris » ou sur « via Google ».
    </p>

    <div class="w3-center w3-margin-top">
      <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
              name="enroll"
              on:click={enroll}>
        Je m'inscris!
      </button>
      <a href='/viagoogle' name="viaGoogle1"
         class="w3-btn w3-theme-d1 w3-round-xxlarge"
         >via Google</a>
    </div>
    
    <p>
      Si vous avez déjà un compte, utilisez l'un des boutons suivants:
    </p>

    <div class="w3-center w3-margin-top">
      <button type="submit" name="signin" 
              class="w3-btn w3-theme-d1 w3-round-xxlarge"
              on:click={authenticate}>
        Je m'identifie!
      </button>
      <a href='/viagoogle' name="viaGoogle2"
         class="w3-btn w3-theme-d1 w3-round-xxlarge"
         >via Google</a>
      <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
              name="lostpassword"
              on:click={lostpassword}>
        J'ai perdu mon mot de passe!
      </button>
    </div>
  </div>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { getConfig, initializePerson } from '../client/lib.mjs';

 let helpshown = false;

 onMount(async () => {
   return initializePerson()
 });

 function enroll (event) {
   sapper.goto('/enroll');
 }
 function authenticate (event) {
   sapper.goto('/login');
 }
 function lostpassword (event) {
   sapper.goto('/lostpassword');
 }

 function showHelp (event) {
   helpshown = true;
 }

</script>
