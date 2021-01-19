<style>
 header.bold {
   font-weight: bold;
 }
 input.error {
   background-color: pink;
 }
 p.smallHint {
   color: #aaa;
 }
</style>

<svelte:head>
  <title>CodeGradX/Identification</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-card-4 w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Qui êtes vous ?
      <span class='w3-right w3-margin-left w3-xlarge'
            on:click={showHelp}>&#x1f6c8;</span>
    </header>

    {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}
    
    <p class='smallHint'>
      Renseignez votre nom de connexion et votre mot de passe:
    </p>
    <div class="w3-margin-top">
      <label for="login">Votre courriel:</label>
      <input type="text" bind:value={login} name='login'
             class:error={errorLogin} class="w3-input"
             on:keyup={hideproblem}
             on:click={hideproblem}
             placeholder="{defaultlogin}" />
    </div>
    <div class="w3-margin-top" >
      <label for="password">Votre mot de passe:</label>
      <input type="password" bind:value={password} name='password'
             class:error={errorPassword} class="w3-input"
             on:keyup={hideproblem}
             on:click={hideproblem}
             placeholder="{defaultpassword}" />
    </div>
  </div>

  {#if error}<Problem bind:error={error} />{/if}

  <div class="w3-center w3-margin-top">
    <button type="submit" name="signin" 
            class="w3-btn w3-theme-d1 w3-round-xxlarge"
            on:click={authenticate}>
      Je m'identifie!
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
 let password = undefined;
 let defaultlogin = 'mon.email@a.moi';
 let defaultpassword = '***';
 let error = undefined;
 let errorLogin = false;
 let errorPassword = false;
 let helpshown = false;

 function hideproblem (event) {
   error = errorLogin = errorPassword = undefined;
 }

 onMount(async () => {
   return initializePerson();
 });

 async function authenticate (event) {
   hideproblem();
   let showError = ''
   if ( ! login || login === '' ) {
     errorLogin = error = "Quel est votre courriel ?";
     showError += error;
   }
   if ( ! password || password === '' ) {
     errorPassword = error = "Quel est votre mot de passe ?";
     showError += ' ' + error;
   }
   if ( showError ) {
     error = showError;
     return;
   }
   try {
     $person = await CodeGradX
           .getCurrentState()
           .getAuthenticatedUser(login, password);
     if ( $person ) {
       sapper.goto('/universes');
     }
   } catch (exc) {
     error = 'Courriel ou mot de passe incorrect!';
   }
 }

 function showHelp (event) {
   helpshown = true;
 }

</script>
