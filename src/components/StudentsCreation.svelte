<style>
 textarea {
   rows: 6;
   width: 80%;
 }
 .remark {
   padding-left: 1em;
   padding-right: 1em;
 }
</style>

<div class='w3-container'>
  <p class='smallHint'>
    Chaque ligne doit contenir un courriel suivi optionnellement et
    dans l'ordre, d'un point virgule, d'un pseudo, d'un point virgule,
    d'un nom de famille, d'un point virgule et d'un prénom.
  </p>

  {#if byfile}
  <FileChooser on:chosenfile={sendStudentsFile}
               labelChoose="Choisir fichier d'apprenants"
               labelChosen="Envoyer fichier d'apprenants" />
  {:else}
  <form class='w3-form w3-padding-16 w3-center'>
    <div class=''>
      <textarea bind:value={content}></textarea>
    </div>
    <div>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              on:click={sendStudents} >créer apprenants</button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              on:click={selectStudentsFile} > sélectionner fichier </button>
    </div>
  </form>
  {/if}

  {#if error}<Problem bind:error={error} />{/if}

  {#if showmessages}
  <div class='w3-container'>
    <ul>
      {#each messages as message}
        {#if message.ok}
          <li>{message.email}: <span class='w3-green remark'>OK</span></li>
        {:else}
          <li>{message.email}: <span class='w3-red remark'>{message.reason}</span></li>
        {/if}
      {/each}
    </ul>
  </div>
  {:else if waiting}
    <WaitingImage message="Incorporation des nouveaux apprenants..." />
  {/if}

</div>

<script>
 import Problem from './Problem.svelte';
 import WaitingImage from './WaitingImage.svelte';
 import FileChooser from './FileChooser.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { campaign } from '../stores.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 
 let content = '';
 let byfile = false;
 let error = undefined;
 let messages = undefined;
 let showmessages = false;
 let waiting = false;

 onMount(() => {
   if ( ! $campaign ) {
     error = "Univers inconnu!";
   }
 });

 function selectStudentsFile (event) {
   byfile = ! byfile;
 }
 
 async function sendStudentsFile (event) {
   const { chosenfile, FileChooserForm } = event.detail;
   const fd = new FormData(FileChooserForm);
   const basefilename = chosenfile.replace(new RegExp("^.*/"), '');
   error = undefined;
   await doSendStudentsFile(fd, undefined);
 }
 
 async function sendStudents (event) {
   event.stopPropagation();
   event.preventDefault();
   showmessages = false;
   waiting = true;
   await doSendStudentsFile(content, "application/octet-stream");
 }

 async function doSendStudentsFile (content, contentType) {
   try {
     const state = CodeGradX.getCurrentState();
     const headers = {
       Accept: 'application/json'
     };
     if (contentType) {
       headers['Content-Type'] = contentType;
     }
     const response = await state.sendAXServer('x', {
       path: `/campaign/newpersons/${$campaign.name}`,
       method: "POST",
       headers,
       entity: content
     });
     if ( response.ok ) {
       waiting = false;
       messages = response.entity.messages;
       let problem = false;
       for ( const message of messages ) {
         problem |= ! message.ok;
       }
       showmessages = true;
       if ( ! problem ) {
         content = '';
         dispatch('students', {});
       }
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('studentscreation', {exc});
     error = parseAnomaly(exc);
   }
   waiting = false;
 }

 /**

Some examples:

a
b;c

a@b.fr
c@b.fr;cc;
c@b.fr;cc

lambda@no.bo.dy;pseudo;lastname;firstname

  */
 
</script>
