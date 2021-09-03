<!--
      Give choice to sign in or sign up
-->

<style>
</style>

<Page shortTitle="Identification"
      title="Identification"
      showheader={false} >

  <header class='w3-center w3-large'>
    Qui êtes vous ?
    <span class='w3-right w3-margin-left w3-xlarge'
          on:click={showHelp}><InformationSign /></span>
  </header>

  {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}

  <LastMessage />
  
  <p>
      Si vous n'avez pas encore créé de compte sur CodeGradX, vous pouvez
      cliquer sur le bouton « Je m'inscris » ou sur « via Google ».
  </p>

  <div class="w3-center w3-margin-top">
    <a class="w3-btn w3-theme-d2 w3-round-xxlarge"
       name="enroll"
       href={buildGoto('/enroll')}>
      Je m'inscris!
    </a>
    <a href={buildGoto('viagoogle')} name="viaGoogle1"
       class="w3-btn w3-theme-d2 w3-round-xxlarge"
       >via Google</a>
  </div>
  
  <p>
    Si vous avez déjà un compte, utilisez l'un des boutons suivants:
  </p>
  
  <div class="w3-center w3-margin-top">
    <a href={buildGoto('/login')} name="signin" 
       class="w3-btn w3-theme-d2 w3-round-xxlarge">
      Je m'identifie!
    </a>
    <a href={buildGoto('/viagoogle')} name="viaGoogle2"
       class="w3-btn w3-theme-d2 w3-round-xxlarge"
       >via Google</a>
    <a class="w3-btn w3-theme-d2 w3-round-xxlarge"
       name="lostpassword"
       href={buildGoto('/lostpassword')}>
      J'ai perdu mon mot de passe!
    </a>
  </div>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import LastMessage from '../components/LastMessage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, buildGoto, goto, isUser } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';

 let helpshown = false;

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = 
       "Comme j'ai deviné qui vous étiez, je vous emmène directement ici!";
     goto('/universes');
   }
 });

 function showHelp (event) {
   helpshown = true;
 }

</script>
