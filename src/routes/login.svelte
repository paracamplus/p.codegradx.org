<!--
        Authentication form (login, password) 
-->

<style>
 input.error {
   background-color: pink;
 }
 input.indent {
   margin-left: 2em;
 }
</style>

<Page shortTitle="Identification"
      title="Qui êtes vous ?"
      showheader={false} >

  <header class='w3-center w3-large'>
    Qui êtes vous ?
    <span class='w3-right w3-margin-left w3-xlarge'
          on:click={showHelp}><InformationSign /></span>
  </header>

  {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}
    
  <p class='smallHint'>
    Renseignez votre nom de connexion et votre mot de passe:
  </p>

  <div class="w3-margin-top">
      <label for="login">Votre courriel:</label>
      <input type="text" bind:value={login} name='login'
             class:error={errorLogin} class="w3-input indent"
             on:keyup={hideproblem}
             on:click={hideproblem}
             placeholder="{defaultlogin}" />
  </div>
  <div class="w3-margin-top" >
      <label for="password">Votre mot de passe:</label>
      <input type="password" bind:value={password} name='password'
             class:error={errorPassword} class="w3-input indent"
             on:keyup={hideproblem}
             on:click={hideproblem}
             placeholder="{defaultpassword}" />
  </div>

  {#if error}<Problem bind:error={error} />{/if}

  <div class="w3-center w3-margin-top">
    <button type="submit" name="signin" 
            class="w3-btn w3-theme-d2 w3-round-xxlarge"
            on:click={authenticate}>
      Je me connecte!
    </button>
    {#if showlostpassword}
      <button class="w3-btn w3-theme-d2 w3-round-xxlarge"
              name="lostpassword"
              on:click={lostpassword}>
        J'ai perdu mon mot de passe!
      </button>
    {/if}
  </div>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import Problem from '../components/Problem.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, goto, isUser } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';

 let login = undefined;
 let password = undefined;
 let defaultlogin = 'mon.email@a.moi';
 let defaultpassword = '***';
 let error = undefined;
 let errorLogin = false;
 let errorPassword = false;
 let helpshown = false;
 let showlostpassword = false;

 function hideproblem (event) {
   error = errorLogin = errorPassword = undefined;
 }

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = error = `Comme j'ai deviné qui vous étiez, 
je vous emporte directement vers une page plus appropriée!`; //'
     goto('/universes');
   }
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
     const newperson = await CodeGradX
           .getCurrentState()
           .getAuthenticatedUser(login, password);
     if ( newperson ) {
       $person = newperson;
       if ( ! newperson.confirmedemail ) {
         goto('/sendmail');
       } else if ( newperson.confirmedua < newperson.uaversion ) {
         goto('/signua');
       } else {
         goto('/universes');
       }
     }
   } catch (exc) {
     error = 'Courriel ou mot de passe incorrect!';
     showlostpassword = true;
   }
 }

 function showHelp (event) {
   helpshown = true;
 }
 
 function lostpassword (event) {
   goto('/lostpassword');
 }

</script>
