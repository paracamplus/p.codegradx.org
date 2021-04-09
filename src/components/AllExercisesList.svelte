<!--
    This page is for teachers
-->

<style>
</style>

{#if showExercisesList}
<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        title="Clore la liste"
        on:click={() => showExercisesList = false}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        title="Rafraîchir la liste"
        on:click={refreshExercisesList}><RefreshSign /></span>
</div>

<p class='smallHint'>
  Il y a {exercises.length} exercices. Cliquer sur une ligne affiche
  les réponses exprimées par les apprenants de l'univers {$campaign.name}.
</p>

<table class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('uuid')}>UUID</th>
      <th on:click={sortColumn('nickname')}>surnom</th>
      <th on:click={sortColumn('name')}>nom</th>
      <th on:click={sortColumn('start', 'date')}>création</th>
    </tr>
  </thead>
  <tbody>
    {#each exercises as exercise}
    <tr on:click={mkShowJobsPerExercise(exercise)}
        data-uuid={exercise.uuid}>
      <td>{CodeGradX.normalizeUUID(exercise.uuid)}</td>
      <td>{exercise.nickname}</td>
      <td>{exercise.name}</td>
      <td>{exercise.start}</td>
    </tr>
    {:else}
    <tr><td colspan='6'><WaitingImage /></td></tr>
    {/each}
  </tbody>
</table>
{/if}

{#if error}<Problem bind:error={error} />{/if}

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import Problem from '../components/Problem.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { campaign } from '../stores.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { shorten } from '../client/utils.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { goto } from '../client/lib.mjs';

 export let showExercisesList = false;
 export let entryPointName = 'listExercises';
 export let entryKeyName = 'exercises';
 let exercises = [];
 let error = undefined;

 onMount(async () => {
   await refreshExercisesList();
 });

 // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     exercises = doSortColumn(key, exercises, hint);
   };
 }

 async function refreshExercisesList (event) {
   const state = CodeGradX.getCurrentState();
   try {
     const response = await state.sendAXServer('x', {
       path: `/campaign/${entryPointName}/${$campaign.name}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       exercises = response.entity[entryKeyName];
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('AllExercisesList', {exc});
     showExercisesList = false;
     error = parseAnomaly(exc);
   }
 }

 const keyNames = `uuid name nickname start`;
 
 async function downloadExercisesList (event) {
   event.stopPropagation();
   event.preventDefault();
   const filename = `${entryPointName}-${$campaign.name}.csv`;
   const keys = keyNames.split(/ /);
   let answer = keys.join(';') + '\n';
   exercises.forEach(exercise => {
     keys.forEach(key => {
       answer += exercise[key] + ';';
     });
     answer += '\n';
   });
   let result = 'data:text/plain;charset=utf-8,' +
                encodeURIComponent(answer);
   const element = document.createElement('a');
   element.setAttribute('href', result);
   element.setAttribute('download', filename);
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
 }

 function mkShowJobsPerExercise (exercise) {
   return function (event) {
     goto(`/campaignexercisejobs/${$campaign.name}/${exercise.uuid}`);
   };
 }

</script>
