<style>
</style>

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
  {:else if ! error}
     <div class='waitingMessage'>Chargement de la liste d'exercices...</div>
     <WaitingImage />
  {:else}
     <Problem bind:error={error} />
  {/if}
</section>

<script>
 import ExercisesSet from './ExercisesSet.svelte';
 import ExerciseTitle from './ExerciseTitle.svelte';
 import WaitingImage from './WaitingImage.svelte';
 import Problem from './Problem.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/campaignlib';
 import { sleep } from '../common/utils.mjs';
 import { campaign, lastmessage } from '../stores.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { goto } from '../client/lib.mjs';
 
 let exercisesSet = undefined;
 let error = undefined;
 
 onMount(async () => {
   if ( $campaign ) {
     exercisesSet = await fetchExercisesSet($campaign);
   } else {
     //error = "Je n'arrive pas à récupérer les exercices afférents!";
     //await sleep(5);
     $lastmessage = `Je n'ai pu récupérer les exercices de
${$campaign.name}, veuillez choisir un autre univers!`;
     goto('/universes');
   }
 });

 async function fetchExercisesSet (campaign) {
   try {
     return campaign.getExercisesSet();
   } catch (exc) {
     error = parseAnomaly(exc);
   }
 }

</script>
