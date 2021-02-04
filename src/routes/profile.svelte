<style>
 header.bold {
   font-weight: bold;
 }
 p.smallHint {
   color: #aaa;
 }
 input.indent {
   margin-left: 2em;
 }
 :global(input.bad) {
   background-color: pink;
   border: solid 1px red;
 }
 :global(input:invalid) {
   background-color: pink;
   border: solid 1px red;
 }
</style>

<svelte:head>
  <title>CodeGradX/Modification Profil</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Modifier mes informations
    </header>

    {#if $person}
    <p class='smallHint'>
      Vous pouvez librement (mais avec décence) modifier vos nom,
      prénom et pseudo. Si vous changez votre courriel, vous aurez à
      confirmer ce nouveau courriel. Pour le mot de passe, vous avez
      le choix entre des lettres, des chiffres et les caractères
      suivants <code>{chars}</code> mais vous devez néanmoins panacher
      ces trois catégories.
    </p>

    <div class="w3-margin-top">

      <div class='w3-container w3-padding'>
        <label for='email'>Votre courriel:</label>
        <input type="email" bind:value={newperson.email} name='email'
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               placeholder="{$person.email}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='pseudo'>Votre pseudo:</label>
        <input type="text" bind:value={newperson.pseudo} name='pseudo'
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               placeholder="{$person.pseudo}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='firstname'>Votre prénom:</label>
        <input type="text" bind:value={newperson.firstname} name='firstname'
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               placeholder="{$person.firstname}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='lastname'>Votre prénom:</label>
        <input type="text" bind:value={newperson.lastname} name='lastname'
               class="w3-input indent" 
               on:keyup={notifyChange}
               on:invalid={badinput}
               placeholder="{$person.lastname}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='password1'>Votre mot de passe:</label>
        <input type="password" bind:value={password1} name='password1'
               class="w3-input indent" 
               on:keyup={notifyChange}
               on:invalid={badinput}
               placeholder="***" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='password2'>Et encore votre mot de passe:</label>
        <input type="password" bind:value={password2} name='password2'
               class="w3-input indent" 
               on:keyup={notifyChange}
               on:invalid={badinput}
               placeholder="***" />
      </div>
      
      {#if error}<Problem bind:error={error} />{/if}
      
      <div class='w3-center w3-margin-top'>
        <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
                bind:this={saveButton}
                disabled
                title="Sauvegarder mes modifications"
                on:click={modify} >Sauvegarder
        </button>
      </div>
    </div>
        
    {:else}
    {#if error}<Problem bind:error={error} />{/if}
    {/if}

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
 import { initializePerson } from '../client/lib.mjs';
 import { sanitizeName, checkEmail, checkPassword, sanitizePassword, chars }
   from '../common/sanitizers.mjs';

 let error = undefined;
 let saveButton;
 let password1 = undefined;
 let password2 = undefined;
 let newperson = {
   email: "mon.email@a.moi",
   firstname: "mon prénom",
   lastname: "mon nom",
   pseudo: "mon pseudo"
 };

 onMount(async () => {
   if ( ! $person ) {
     $person = await CodeGradX.getCurrentUser();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
   }
   newperson = fillDefaultValues($person);
 });

 function fillDefaultValues ($person) {
   newperson = {
     email: $person.email,
     firstname: $person.firstname,
     lastname: $person.lastname,
     pseudo: $person.pseudo
   };
   return newperson;
 }

 function notifyChange (event) {
   error = undefined;
   const elem = event.originalTarget;
   elem.classList.remove('bad');
   saveButton.setAttribute('disabled', true);
   const kind = event.originalTarget.attributes.name.value;
   
   function isChanged (kind) {
     const newvalue = newperson[kind];
     let oldvalue = elem.placeholder;
     //console.log({kind, newperson, elem});
     return ( newvalue !== oldvalue );
   }
   
   if ( kind.match(/^(firstname|lastname|pseudo)$/) ) {
     const newname = sanitizeName(newperson[kind]);
     if ( newname !== newperson[kind] ) {
       error = "Ce nom semble mal formé !?";
       elem.classList.add('bad');
       return;
     }
     isChanged(kind) && saveButton.removeAttribute('disabled');
     
   } else if ( kind.match(/^email$/) ) {
     if ( ! checkEmail(newperson.email) ) {
       error = "Votre courriel semble mal formé !?";
       elem.classList.add('bad');
       return;
     }
     isChanged(kind) && saveButton.removeAttribute('disabled');
     
   } else if ( kind.match(/^password[12]$/) ) {
     if ( typeof password1 === 'undefined' &&
          typeof password2 === 'undefined' ) {
       return;
     }
     const newpassword1 = sanitizePassword(password1);
     if ( newpassword1 !== password1 ) {
       error = "Caractère non supporté !";
       elem.classList.add('bad');
       return;
     }
     const newpassword2 = sanitizePassword(password2);
     if ( newpassword2 !== password2 ) {
       error = "Caractère non supporté !";
       elem.classList.add('bad');
       return;
     }
     if ( password1 !== password2 ) {
       error = "Les mots de passe sont différents !?";
       elem.classList.add('bad');
       return;
     }
     if ( ! checkPassword(password1) ) {
       error = "Mot de passe faible !";
       elem.classList.add('bad');
       return;
     }
     newperson.password = password1;
     saveButton.removeAttribute('disabled');
   }
 }

 function badinput (event) {
   const elem = event.originalTarget;
   console.log({elem});//DEBUG
   elem.classList.add('bad');
 }

 async function modify (event) {
   if ( error ) {
     error = "Corrigez d'abord les anomalies!";
     return;
   }
   try {
     const state = CodeGradX.getCurrentState();
     const myuser = await state.userSelfModify(newperson);
     if ( myuser ) {
       $person = myuser;
       newperson = fillDefaultValues($person);
     }
   } catch (exc) {
     error = exc;
     //state.log
   }
 }

</script>
