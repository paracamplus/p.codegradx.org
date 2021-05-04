<style>
 div.innerTable {
   margin-left: 2em;
   margin-right: 1em;
 }
 tr.hover-item:hover {
   background-color: var(--color-hover-gray);
 }
 tr.no-hover:hover {
   background-color: white;
 }
</style>

<tr on:click={mkShowExerciseMenu(exercise)}
    class='hover-item'
    data-uuid={exercise.uuid}>
  <td>{CodeGradX.normalizeUUID(exercise.uuid)}</td>
  <td>{exercise.nickname}</td>
  <td>{exercise.name}</td>
  <td>{CodeGradX.Date2str(exercise.start)}</td>
</tr>

{#if showMenu}
<tr class='no-hover'>
  <td colspan='4'>
    <div class='w3-container innerTable'>
      {#if exercise.safecookie}
      <span class='w3-btn w3-round-xxlarge w3-theme-l4'
            title="Voir énoncé"
            on:click={mkShowStem(exercise)} >voir énoncé</span>
      {/if}
      <span class='w3-btn w3-round-xxlarge w3-theme-l4'
            title="Voir copies"
            on:click={mkShowJobsPerExercise(exercise)} >voir copies</span>
      {#if exercise.safecookie}
      <span class='w3-btn w3-round-xxlarge w3-theme-l4'
            title="Noter lot de copies"
            on:click={() => sendBatch = ! sendBatch} >noter lot</span>
      {/if}
    </div>

    {#if sendBatch}
    <div class='w3-container'>
      <FileChooser on:chosenfile={sendBatchFile}
                   labelChoose="Choisir lot de copies"
                   labelChosen="Envoyer lot" />
    </div>
    {/if}

    {#if error}<Problem bind:error={error} />{/if}
    
  </td>
</tr>
{/if}

<script>
 import FileChooser from './FileChooser.svelte';
 import Problem from './Problem.svelte';
 
 import { createEventDispatcher  } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx/src/batch';
 import { campaign, current_exercise } from '../stores.mjs';
 import { goto } from '../client/lib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 export let exercise = undefined;
 export let showMenu = false;
 let sendBatch = false;
 let error = undefined;

 function mkShowExerciseMenu (exercise) {
   return function (event) {
     showMenu = ! showMenu;
     if ( showMenu ) {
       dispatch('openmenu', {exercise});
     }
   }
 }

 function mkShowJobsPerExercise (exercise) {
   return function (event) {
     error = undefined;
     const href = `/campaignexercisejobs/${$campaign.name}/${exercise.uuid}`;
     if ( true ) {
       event.stopPropagation();
       event.preventDefault();
       const element = document.createElement('a');
       element.setAttribute('href', href);
       element.setAttribute('target', '_blank');
       element.style.display = 'none';
       document.body.appendChild(element);
       element.click();
       document.body.removeChild(element);
     } else {
       goto(href);
     }
   };
 }

 function mkShowStem (exercise) {
   return function (event) {
     error = undefined;
     goto(`/exercise/${exercise.safecookie}`);
   };
 }

 async function sendBatchFile (event) {
   const { chosenfile, FileChooserForm } = event.detail;
   error = undefined;
   if ( ! navigator.onLine ) {
     throw "Pas d'accès à Internet!";
   }
   $current_exercise = exercise;
   try {
     const batch = await exercise.sendBatchFromDOM(FileChooserForm, chosenfile);
     //console.log('sendBatchFile', {batch}); // DEBUG
     goto(`/mybatch/${batch.batchid}`);
   } catch (exc) {
     console.log('teacher sendBatchFile', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>
