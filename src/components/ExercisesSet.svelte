<style>
</style>

{#if exercisesSet}
  <div class='w3-card-4 w3-margin'>
    <div class='w3-container w3-theme-l4 w3-margin-top bold'>
       {@html exercisesSet.title || ''}
    </div>
    <div class='w3-container'>
      {#if exercisesSet.prologue}
      <p class='prologue'>{@html exercisesSet.prologue}</p>
      {/if}

      <div class='w3-container w3-section'>
      {#each exercisesSet.exercises as exercise}
        {#if exercise instanceof CodeGradX.ExercisesSet}
          <svelte:self exercisesSet={exercise} 
                       on:authenticate />
  
        {:else if exercise instanceof CodeGradX.Exercise}
          <ExerciseTitle exercise={exercise}
                         on:authenticate />

        {:else}
          <div></div>
        {/if}
      {/each}
      </div>
  
      {#if exercisesSet.epilogue}
        <p class='epilogue'>{@html exercisesSet.epilogue}</p>
      {/if}
    </div>
  </div>
{/if}

<script>
 import ExerciseTitle from './ExerciseTitle.svelte';
 import { CodeGradX } from 'codegradx/campaign';

 export let exercisesSet = null;
</script>

