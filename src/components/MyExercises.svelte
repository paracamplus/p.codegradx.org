<!--
    This page is for authors, it displays the exercises created by this author.
-->

<style>
</style>

<p class='smallHint'>Cliquer sur une ligne affiche le rapport de
  déploiement, cliquer sur l'icône multi-rectangulaire affiche les
  copies des apprenants ayant tenté cet exercice. Cliquer sur les
  titres du tableau permet de le trier.
</p>
<table class='w3-table w3-center w3-hoverable w3-bordered'>
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
        title="Voir le rapport de déploiement" >
      <td>{exercise.nickname}
        <span class='w3-right'
              on:click={mkShowRelatedJobs(exercise)}
              title="Voir les copies associées">
          <JobsSign size="1.25em" />
        </span>
      </td>
      <td class='w3-hide-small'>{exercise.name}</td>
      <td class='w3-hide-small'>{exercise.uuid}</td>
      <td>{exercise.start}</td>
    </tr>
    {:else}
    <tr>
      <td colspan='4'>Aucun exercice!</td>
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
 
 // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     exercises = doSortColumn(key, exercises, hint);
   };
 }

 function mkShowExerciseReports (exercise) {
   return function (event) {
     $current_exercise = exercise;
     goto(`/myexercise/${exercise.uuid}`);
   };
 }

 function mkShowRelatedJobs (exercise) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     $current_exercise = exercise;
     goto(`/exercisejobs/${exercise.uuid}`);
   };
 }

</script>

