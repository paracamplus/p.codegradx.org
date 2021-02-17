<style>
 header.bold {
   font-weight: bold;
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

<Page shortTitle="Modification profil"
      title="Modifier mes informations" >

    {#if $person}
    <p class='smallHint'>
      Vous pouvez librement (mais avec décence) modifier vos nom,
      prénom et pseudo. Si vous changez votre courriel, vous aurez à
      confirmer ce nouveau courriel. Pour le mot de passe, vous avez
      le choix entre des lettres, des chiffres et les caractères
      suivants <code>{chars}</code> mais vous devez néanmoins panacher
      ces trois catégories et aligner au moins 8 caractères.
    </p>

    <div class="w3-margin-top">

      <div class='w3-container w3-padding'>
        <label for='email'>Votre courriel:</label>
        <input type="email" bind:value={newperson.email} name='email'
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               bind:this={inputs.email}
               placeholder="{$person.email}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='pseudo'>Votre pseudo:</label>
        <input type="text" bind:value={newperson.pseudo} name='pseudo'
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               bind:this={inputs.pseudo}
               placeholder="{$person.pseudo}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='firstname'>Votre prénom:</label>
        <input type="text" bind:value={newperson.firstname} name='firstname'
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               bind:this={inputs.firstname}
               placeholder="{$person.firstname}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='lastname'>Votre prénom:</label>
        <input type="text" bind:value={newperson.lastname} name='lastname'
               class="w3-input indent" 
               on:keyup={notifyChange}
               on:invalid={badinput}
               bind:this={inputs.lastname}
               placeholder="{$person.lastname}" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='password1'>Votre mot de passe:</label>
        <input type="password" name='password1'
               bind:value={newperson.password1} 
               class="w3-input indent" 
               on:keyup={notifyChange}
               on:invalid={badinput}
               bind:this={inputs.password1}
               placeholder="***" />
      </div>
      
      <div class='w3-container w3-padding'>
        <label for='password2'>Et encore votre mot de passe:</label>
        <input type="password" name='password2'
               bind:value={newperson.password2}
               class="w3-input indent"
               on:keyup={notifyChange}
               on:invalid={badinput}
               bind:this={inputs.password2}
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

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';
 import { sanitizeName, checkEmail, checkPassword, sanitizePassword, chars }
   from '../common/sanitizers.mjs';

 let error = undefined;
 let saveButton;
 let newperson = {
   email: "mon.email@a.moi",
   firstname: "mon prénom",
   lastname: "mon nom",
   pseudo: "mon pseudo",
   password1: "***",
   password2: "***"
 };
 let inputs = {
   email: undefined,
   firstname: undefined,
   lastname: undefined,
   pseudo: undefined,
   password1: undefined,
   password2: undefined,
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
   checkAllInputs();
 }

 function badinput (event) {
   const elem = event.originalTarget;
   console.log({elem});//DEBUG
   elem.classList.add('bad');
 }

 function checkAllInputs () {
   let result = true;
   let changed = false;
   
   function isChanged (kind) {
     const newvalue = newperson[kind];
     let oldvalue = inputs[kind].placeholder;
     //console.log({kind, newperson, elem});
     return ( newvalue !== oldvalue );
   }
   
   // reset
   error = undefined;
   saveButton.removeAttribute('disabled');
   for ( const elem of Object.values(inputs) ) {
     elem.classList.remove('bad');
   }
   
   let kind = 'firstname';
   let newname = sanitizeName(newperson[kind]);
   if ( newname !== newperson[kind] ) {
     error = "Ce nom semble mal formé !?";
     inputs[kind].classList.add('bad');
     result = false;
   }
   changed = changed || isChanged(kind);
   
   kind = 'lastname';
   newname = sanitizeName(newperson[kind]);
   if ( newname !== newperson[kind] ) {
     error = "Ce nom semble mal formé !?";
     inputs[kind].classList.add('bad');
     result = false;
   }
   changed = changed || isChanged(kind);
   
   kind = 'pseudo';
   newname = sanitizeName(newperson[kind]);
   if ( newname !== newperson[kind] ) {
     error = "Ce nom semble mal formé !?";
     inputs[kind].classList.add('bad');
     result = false;
   }
   changed = changed || isChanged(kind);
   
   kind = 'email';
   if ( ! checkEmail(newperson[kind]) ) {
     error = "Votre courriel semble mal formé !?";
     inputs[kind].classList.add('bad');
     result = false;
   }
   changed = changed || isChanged(kind);

   if ( typeof newperson.password1 !== 'undefined' ||
        typeof newperson.password2 !== 'undefined' ) {
     kind = 'password1';
     const newpassword1 = sanitizePassword(newperson[kind]);
     if ( newpassword1 !== newperson[kind] ) {
       error = "Caractère non supporté !";
       inputs[kind].classList.add('bad');
       result = false;
       changed = true;
     }
     kind = 'password2';
     const newpassword2 = sanitizePassword(newperson[kind]);
     if ( newpassword2 !== newperson[kind] ) {
       error = "Caractère non supporté !";
       inputs[kind].classList.add('bad');
       result = false;
       changed = true;
     }
     if ( newpassword1 !== newpassword2 ) {
       error = "Les mots de passe sont différents !?";
       inputs.password1.classList.add('bad');
       inputs.password2.classList.add('bad');
       result = false;
       changed = true;
     } else {
       if ( ! checkPassword(newpassword1) ) {
         error = "Mot de passe trop faible !";
         inputs.password1.classList.add('bad');
         inputs.password2.classList.add('bad');
         result = false;
         changed = true;
       } else {
         changed = true;
         newperson.password = newpassword1;
       }
     }
   }

   if ( ! changed ) {
     saveButton.setAttribute('disabled', true);
   }
   return result;
 }

 async function modify (event) {
   if ( error || ! checkAllInputs() ) {
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
