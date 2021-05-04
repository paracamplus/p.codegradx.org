<!--
    This page is for teachers
-->

<style>
</style>

{#if error}<Problem bind:error={error} />{/if}

{#if showExercisesList}
<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        title="Clore la liste"
        data-close="AllExercisesList"
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        title="Rafraîchir la liste"
        on:click={refreshExercisesList}><RefreshSign /></span>
</div>

<p class='smallHint'>
  Il y a {exercises.length} exercices. Cliquer sur une ligne permet
  d'afficher les réponses exprimées par les apprenants de l'univers
  {$campaign.name} ou d'envoyer un lot de copies à noter.
</p>

<table id='allexerciseslist'
       bind:this={table}
       class='w3-table w3-center w3-hoverable'>
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
    <ExerciseLine exercise={exercise}
                  showMenu={exercise.exerciseid === currentlyopened.exerciseid}
                  on:openmenu={mkCloseAllMenuBut(exercise)} />
    {:else}
    <tr><td colspan='4'>Aucun exercice!</td></tr>
    {/each}
  </tbody>
</table>

{:else}
 <WaitingImage message="Chargement des exercices..." />
{/if}

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import Problem from '../components/Problem.svelte';
 import ExerciseLine from '../components/ExerciseLine.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { person, campaign } from '../stores.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/campaignlib';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { initializePerson, goto } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';
 import { fetchCampaign, flattenExercisesSet } from '../client/campaignlib.mjs';

 export let showExercisesList = false;
 export let entryPointName = 'listExercises';
 export let entryKeyName = 'exercises';
 let objexercises = {};
 let exercises = [];
 let error = undefined;
 let currentlyopened = { exerciseid: 'xx' };
 let table;

 /* In objexercises, exercise have a safecookie. 
    allexercises list all exercises without safecookie.
  */
 
 onClient(async () => {
   try {
     $person = await initializePerson();
     $campaign = await fetchCampaign($person, $campaign.name);
     const exercisesSet = await $campaign.getExercisesSet();
     objexercises = flattenExercisesSet(exercisesSet);
     //console.log({objexercises}); // DEBUG
     exercises = Object.values(objexercises);
   } catch (exc) {
     console.log('AllExercisesList', {exc});
     error = parseAnomaly(exc);
   }
 });

 onMount(async () => {
   //console.log($campaign);//DEBUG
   await refreshExercisesList();
 });

 // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     exercises = doSortColumn(table, key, exercises, hint);
   };
 }

 function mkCloseAllMenuBut (exercise) {
   currentlyopened = exercise;
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
       const allexercises = response.entity[entryKeyName]
                                    .map(e => new CodeGradX.Exercise(e));
       exercises = merge(exercises, allexercises);
       showExercisesList = true;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('AllExercisesList', {exc});
     //showExercisesList = false;
     error = parseAnomaly(exc);
   }
 }

 function merge (exercises, allexercises) {
   const newexercises = [];
   for ( const exercise of allexercises ) {
     if ( objexercises[exercise.exerciseid] ) {
       Object.assign(objexercises[exercise.exerciseid], exercise);
       newexercises.push(objexercises[exercise.exerciseid]);
     } else {
       newexercises.push(exercise);
     }
   }
   return newexercises;
 }

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

</script>
