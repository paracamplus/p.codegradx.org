<!--
      Form to declare a lost password
-->

<style>
 input.error {
   background-color: pink;
 }
 input.indent {
   margin-left: 2em;
 }
</style>

<Page shortTitle="Mot de passe inconnu"
      title="Mot de passe inconnu" >
    
  <div class="w3-margin-top">
    <label for="login">Votre courriel:</label>
    <input type="text" bind:value={login} name='login'
           class:error={errorLogin} class="w3-input indent"
           on:keyup={hideproblem}
           on:click={hideproblem}
           placeholder="{defaultlogin}" />
  </div>

  <LastMessage />

  {#if error}<Problem bind:error={error} />{/if}

  <div class="w3-center w3-margin-top">
    <button class="w3-btn w3-theme-d2 w3-round-xxlarge"
            name="lostpassword"
            on:click={lostpassword}>
      {buttonName}
    </button>
  </div>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import Problem from '../components/Problem.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import LastMessage from '../components/LastMessage.svelte';

 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, goto, isUser } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';

 export let defaultlogin = 'mon.email@a.moi';
 export let buttonName = "Quel est mon mot de passe?";
 
 let login = undefined;
 let error = undefined;
 let errorLogin = false;

 function hideproblem (event) {
   error = errorLogin = undefined;
 }

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = error =
       `Bonjour ${$person.pseudo}, je vous épargne cette étape
puisque je vous connais déjà !`;
     goto('/universes');
     return;
   }
   if ( $person ) {
     login = $person.email;
   }
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
     goto('/mailsent');
   } catch (exc) {
     error = "Je n'ai pas réussi à envoyer de courriel à cette adresse !";
   }
 }

</script>
