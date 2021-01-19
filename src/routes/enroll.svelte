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
  <title>CodeGradX/Inscription</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Inscription à CodeGradX
      <span class='w3-right w3-margin-left w3-xlarge'
            on:click={showHelp}>&#x1f6c8;</span>
    </header>

    {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}

    <p class='smallHint'>
      Indiquez votre courriel (qui deviendra votre nom de connexion
      définitif et immuable) puis résolvez la Captcha.
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

  <MoveCaptcha on:ready={setCaptcha}
               on:change={captchaChanged}
               on:timeout={captchaTimeout}
               on:complete={setCaptchaComplete} />

  <div class="w3-center w3-margin-top">
    <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
            name="enroll"
            on:click={enroll}>
      Je m'inscris!
    </button>
    {#if showRefresh}
    <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
            title="Rafraîchir la captcha..."
            on:click={captchaRefresh} >
      <RefreshSign color='white' size='2em' />
    </button>
    {/if}
  </div>

  {#if error}<Problem bind:error={error} />{/if}

</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import MoveCaptcha from '../components/MoveCaptcha.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
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
 let captcha = null;
 let captchaComplete = false;
 let filledBoxes = 0;
 let showRefresh = false;

 function hideproblem (event) {
   error = errorLogin = undefined;
 }

 onMount(async () => {
   return initializePerson();
 });

 async function enroll (event) {
   hideproblem();
   if ( ! login || login === '' ) {
     errorLogin = error = "Quel est votre courriel ?";
     return;
   }
   // A real email is required to enroll someone!
   if ( ! checkEmail(login) ) {
     errorLogin = error = "Votre courriel a l'air mal formé!";
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
           sapper.goto(`/resume/${$person.token}`);
         } catch (exc) {
           error = "Mauvaise réponse!";
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
     errorLogin = error = "Votre courriel a l'air mal formé!";
   }
 }
 
 function setCaptcha (event) {
   // Means that the captcha is visible although, perhaps, not yet solved.
   // event.detail is a captcha object with a getResponse method.
   captcha = event.detail;
   filledBoxes = 0;
   captchaComplete = false;
   showRefresh = false;
 }

 function setCaptchaComplete (event) {
   // Means that the captcha was filled (and perhaps solved):
   // event.detail is a boolean.
   let o = event.detail;
   captcha = o.captcha;
   captchaComplete = o.complete;
 }

 function captchaTimeout (event) {
   let o = event.detail;
   captcha = o.captcha;
   showRefresh = true;
   if ( ! checkEmail(login) ) {
     errorLogin = error = "Votre courriel a l'air mal formé!";
   }
 }

 function captchaRefresh (event) {
   if ( captcha ) {
     captcha.refresh();
   }
   showRefresh = false;
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
