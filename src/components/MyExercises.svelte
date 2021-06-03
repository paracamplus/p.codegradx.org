<!--
    This page is for authors, it displays the exercises created by this author.
-->

<style>
</style>

<p class='smallHint'>Cliquer sur une ligne affiche le rapport de
  déploiement et permet également d'accéder aux copies associées à cet
  exercice. Cliquer sur les titres du tableau permet de le trier.
</p>

<table id='myexerciseslist'
       bind:this={table}
       class='w3-table w3-center w3-hoverable w3-bordered'>
  <thead>
    <tr class="w3-theme-l3">
      <th on:click={sortColumn('nickname')}>Surnom</th>
      <th class='w3-hide-small' on:click={sortColumn('name')}>Nom</th>
      <th class='w3-hide-small' on:click={sortColumn('uuid')}>Identifiant</th>
      <th on:click={sortColumn('start')}>Créé</th>
    </tr>
  </thead>
  <tbody>
    {#each exercises as exercise}
    <tr on:click={mkShowExerciseReports(exercise)}
        data-uuid={CodeGradX.normalizeUUID(exercise.uuid)}
        title="Voir le rapport de déploiement" >
      <td>{exercise.nickname}</td>
      <td class='w3-hide-small'>{exercise.name}</td>
      <td class='w3-hide-small'>{CodeGradX.normalizeUUID(exercise.uuid)}</td>
      <td>{CodeGradX.Date2str(exercise.start)}</td>
    </tr>
    {:else}
    <tr>
      <td colspan='4' class='w3-center'>Aucun exercice!</td>
    </tr>
    {/each}
  </tbody>
</table>

<script>
 import JobsSign from './JobsSign.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { CodeGradX } from 'codegradx/exercise';
 import { current_exercise } from '../stores.mjs';
 import { goto } from '../client/lib.mjs';

 export let exercises = [];
 let table;
 
 // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     exercises = doSortColumn(table, key, exercises, hint);
   };
 }

 function mkShowExerciseReports (exercise) {
   return function (event) {
     $current_exercise = exercise;
     goto(`/myexercise/${exercise.uuid}`);
   };
 }

</script>

