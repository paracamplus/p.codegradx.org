<!--
     Enrolment page for new user
-->

<style>
 input.error {
   background-color: pink;
 }
 input.indent {
   margin-left: 2em;
 }
</style>

<Page shortTitle='Inscription'
      title="Inscription à CodeGradX"
      showheader={false}>

  <section class='w3-container w3-margin-top w3-padding'>
    <header class='w3-center w3-margin-bottom'>
      Inscription à CodeGradX
      <span class='w3-right w3-margin-left w3-xlarge'
            on:click={showHelp}><InformationSign /></span>
    </header>

    {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}

    <p class='smallHint'>
      Indiquez votre courriel (qui deviendra votre nom de connexion
      définitif et immuable) puis résolvez la Captcha.
    </p>

    <div class="w3-margin-top">
      <label for="login">Votre courriel:</label>
      <input type="text" bind:value={login} name='login'
             class:error={error} class="w3-input indent"
             on:keyup={hideproblem}
             on:change={hideproblem}
             on:click={hideproblem}
             placeholder="{defaultlogin}" />
    </div>

  {#if goodcaptcha}
  <MoveCaptcha on:ready={setCaptcha}
               on:change={captchaChanged}
               on:timeout={captchaTimeout}
               on:complete={setCaptchaComplete} />

  <div class="w3-center w3-margin-top">
    <button class="w3-btn w3-theme-d2 w3-round-xxlarge"
            name="enroll" disabled
            bind:this={enrollButton}
            on:click={enroll}>
      Je m'inscris!
    </button>
    {#if showRefresh}
    <button class="w3-btn w3-theme-d2 w3-round-xxlarge"
            title="Rafraîchir la captcha..."
            on:click={captchaRefresh} >
      <RefreshSign color='white' size='2em' />
    </button>
    {/if}
  </div>
  {/if}

  {#if error}<Problem bind:error={error} />{/if}

</section>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import InformationSign from '../components/InformationSign.svelte';
 import MoveCaptcha from '../components/MoveCaptcha.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, goto, isUser } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';

 let login = undefined;
 let defaultlogin = 'mon.email@a.moi';
 let error = undefined;
 let helpshown = false;
 let enrollButton;
 let captcha = null;
 let captchaComplete = false;
 let goodcaptcha = true;
 let filledBoxes = 0;
 let showRefresh = false;

 function hideproblem (event) {
   error = undefined;
 }

 onClient(async () => {
   const maybeperson = await initializePerson();
   //console.log('enroll', {maybeperson});//DEBUG
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage =
       "Comme j'ai vu qui vous êtes, je vous emporte directement ici!";
     goto('/universes');
   }
 });

 async function enroll (event) {
   hideproblem();
   if ( ! login || login === '' ) {
     error = "Quel est votre courriel ?";
     return;
   }
   // A real email is required to enroll someone!
   if ( ! checkEmail(login) ) {
     error = "Votre courriel a l'air mal formé!";
     return;
   }
   let state = CodeGradX.getCurrentState();
   try {
     if ( captchaComplete ) {
       let captchaResponse = captcha.getResponse();
       if ( captchaResponse ) {
         //console.log(captchaResponse);//DEBUG
         try {
           $person = await state.userEnroll(login, captchaResponse);
           // $person is partial user with only:
           // confirmedemail, confirmedua, uaversion, login, logins, expires
           //console.log('enroll', {person: $person});//DEBUG
           goto(`/resume/${$person.token}`);
         } catch (exc) {
           error = "Mauvaise réponse!";
           captchaRefresh(null);
         }
       } else {
         throw new Error("void captchaResponse");
       }
     } else {
       error = "Vous n'avez pas fini de résoudre la Captcha!";
     }
   } catch (exc) {
     console.log({exc});
     console.log(state.log);
     throw exc;
   }
 }

 function captchaChanged (event) {
   // A change occurred in the captcha
   let o = event.detail;
   captcha = o.captcha;
   filledBoxes = o.count;
   hideproblem();
   if ( ! checkEmail(login) ) {
     error = "Votre courriel a l'air mal formé!";
   }
 }
 
 function setCaptcha (event) {
   // Means that the captcha is visible although, perhaps, not yet solved.
   // event.detail is a captcha object with a getResponse method.
   captcha = event.detail;
   if ( captcha ) {
     filledBoxes = 0;
     captchaComplete = false;
     showRefresh = false;
   } else {
     goodcaptcha = false;
     error = "Je ne peux réussir à construire la Captcha!";
   }
 }

 function setCaptchaComplete (event) {
   // Means that the captcha was filled (and perhaps solved):
   // event.detail is a boolean.
   let o = event.detail;
   captcha = o.captcha;
   captchaComplete = o.complete;
   enrollButton.removeAttribute('disabled');
 }

 function captchaTimeout (event) {
   let o = event.detail;
   captcha = o.captcha;
   showRefresh = true;
   if ( ! checkEmail(login) ) {
     error = "Votre courriel a l'air mal formé!";
   }
 }

 function captchaRefresh (event) {
   if ( captcha ) {
     captcha.refresh();
   }
   showRefresh = false;
   enrollButton.setAttribute('disabled', true);
 }

 function showHelp (event) {
   helpshown = true;
 }

 const emailregexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/;

 function checkEmail (s) {
   s = s || '';
   s = s.replace(/[^a-z@._]/g, '');
   return s.match(emailregexp);
 }

</script>
