<style>
 textarea {
   rows: 6;
   width: 80%;
 }
</style>

<div class='w3-container'>
  <p class='smallHint'>
    Chaque ligne doit contenir un courriel suivi optionnellement et
    dans l'ordre, d'un point virgule, d'un pseudo, d'un point virgule,
    d'un nom de famille, d'un point virgule et d'un prénom.
  </p>
  
  <form class='w3-form w3-padding-16 w3-center'>
    <div class=''>
      <textarea bind:value={content}></textarea>
    </div>
    <div>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              on:click={sendStudents} >créer</button>
    </div>
  </form>

  {#if error}<Problem bind:error={error} />{/if}

  {#if showmessages}
  <div class='w3-container'>
    <ul>
      {#each messages as message}
        {#if message.ok}
          <li>{message.email}: <span class='w3-green'>OK</span></li>
        {:else}
          <li>{message.email}: <span class='w3-red'>{message.reason}</span></li>
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
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { campaign } from '../stores.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 
 let content = '';
 let error = undefined;
 let messages = undefined;
 let showmessages = false;
 let waiting = false;

 onMount(() => {
   if ( ! $campaign ) {
     error = "Univers inconnu!";
   }
 });

 async function sendStudents (event) {
   event.stopPropagation();
   event.preventDefault();
   showmessages = false;
   waiting = true;
   try {
     const state = CodeGradX.getCurrentState();
     const response = await state.sendAXServer('x', {
       path: `/campaign/newpersons/${$campaign.name}`,
       method: "POST",
       headers: {
         "Content-Type": "application/octet-stream",
         Accept: 'application/json'
       },
       entity: content
     });
     if ( response.ok ) {
       waiting = false;
       messages = response.entity.messages;
       let problem = false;
       for ( const message of messages ) {
         problem |= ! message.ok;
       }
       if ( ! problem ) {
         content = '';
         dispatch('students', {});
       } else {
         showmessages = true;
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
