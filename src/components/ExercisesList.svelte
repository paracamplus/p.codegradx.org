<section class='w3-container'>
  {#if exercisesSet && exercisesSet.exercises}
    {#each exercisesSet.exercises as es}
      {#if es instanceof CodeGradX.ExercisesSet}
        <ExercisesSet exercisesSet={es} 
                      campaign={campaign}
                      on:authenticate />
      {:else if es instanceof CodeGradX.Exercise}
        <div class='w3-container w3-section'>
          <Exercise exercise={es} 
                    campaign={campaign}
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
 import Exercise from './Exercise.svelte';

 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/campaignlib';
 
 export let campaign;
 let exercisesSet = undefined;
 let error = undefined;
 
 onMount(async () => {
   if ( campaign ) {
     await fetchExercisesSet(campaign);
   } else {
     error = "Je n'arrive pas à récupérer les exercices afférents!";
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
