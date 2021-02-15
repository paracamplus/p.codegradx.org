<section class='w3-container'>
  {#if exercisesSet && exercisesSet.exercises}
    {#each exercisesSet.exercises as es}
      {#if es instanceof CodeGradX.ExercisesSet}
        <ExercisesSet exercisesSet={es} 
                      on:authenticate />
      {:else if es instanceof CodeGradX.Exercise}
        <div class='w3-container w3-section'>
          <ExerciseTitle exercise={es} 
                         on:authenticate />
        </div>
      {:else}
        <div></div>
      {/if}
    {/each}
  {/if}
</section>

<script>
 import ExercisesSet from './ExercisesSet.svelte';
 import ExerciseTitle from './ExerciseTitle.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/campaignlib';
 import { sleep } from '../common/utils.mjs';
 import { person, campaign } from '../stores.mjs';
 
 let exercisesSet = undefined;
 let error = undefined;
 
 onMount(async () => {
   if ( $campaign ) {
     await fetchExercisesSet($campaign);
   } else {
     error = "Je n'arrive pas à récupérer les exercices afférents!";
     await sleep(5);
     sapper.goto('/universes');
   }
 });

 async function fetchExercisesSet (campaign) {
   return campaign.getExercisesSet().then((es) => {
     exercisesSet = es;
   }).catch((exc) => {
     error = exc.message;
   });
 }

</script>
