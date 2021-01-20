<style>
 header.bold {
   font-weight: bold;
 }
 input.error {
   background-color: pink;
 }
</style>

<svelte:head>
  <title>CodeGradX/Mot de passe perdu</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Mot de passe perdu
      <span class='w3-right w3-margin-left w3-xlarge'
            on:click={showHelp}>&#x1f6c8;</span>
    </header>
    
    <p class='smallHint'>
      
    </p>
    <div class="w3-margin-top">
      <label for="login">Votre courriel:</label>
      <input type="text" bind:value={login} name='login'
             class:error={errorLogin} class="w3-input"
             on:keyup={hideproblem}
             on:click={hideproblem}
             placeholder="{defaultlogin}" />
    </div>
  </div>

  {#if error}<Problem bind:error={error} />{/if}

  <div class="w3-center w3-margin-top">
    <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
            name="lostpassword"
            on:click={lostpassword}>
      J'ai perdu mon mot de passe!
    </button>
  </div>

</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { getConfig, initializePerson } from '../client/lib.mjs';

 let login = undefined;
 let defaultlogin = 'mon.email@a.moi';
 let error = undefined;
 let errorLogin = false;
 let helpshown = false;

 function hideproblem (event) {
   error = errorLogin = undefined;
 }

 onMount(async () => {
   return initializePerson();
 });
 
 async function lostpassword (event) {
   hideproblem();
   if ( ! login || login === '' ) {
     errorLogin = error = "Quel est votre courriel ?";
     return;
   }
   try {
     $person = await CodeGradX
           .getCurrentState()
           .userGetLink(login);
     // mailsent will have to handle $person and its specific state
     // that is, emailConfirmed or not, UAsigned or not. The token
     // $person.token may be a *-mailconfirm or *-reconnect.
     sapper.goto('/mailsent');
   } catch (exc) {
     error = "Je ne vois pas qui vous êtes !";
   }
 }

 function showHelp (event) {
   helpshown = true;
 }

</script>
