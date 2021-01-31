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
            on:click={showHelp}>&#x1f6c8;</span>
    </header>

    {#if helpshown}<ConnectDoc />{/if}
    
    <p>
      Si vous n'avez pas encore créé de compte sur CodeGradX, vous pouvez
      cliquer sur le bouton « Je m'inscris » ou sur « via Google ». Dans
      ce dernier cas, c'est votre courriel connu par Google qui deviendra
      votre identifiant.
    </p>

    <div class="w3-center w3-margin-top">
      <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
              name="enroll"
              on:click={enroll}>
        Je m'inscris!
      </button>
      <a href={oauth2url} name="viaGoogle"
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
      <a href={oauth2url} name="viaGoogle"
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
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { getConfig, initializePerson } from '../client/lib.mjs';

 let oauth2url = '/to/be/filled';
 let helpshown = false;

 onMount(async () => {
   return initializePerson()
     .then(async () => {
     // compute the url "via Google":
     oauth2url = getConfig().x.url;
     oauth2url += `/googleopenid`;
     oauth2url += `?homeUrl=${origin}`;
     oauth2url += `&nofinalredir=1`;
     oauth2url += `&origin=${origin}`;
   });
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
