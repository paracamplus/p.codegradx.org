{#if exercisesSet}
  <div class='w3-card-4 w3-margin'>
    <header class='w3-container w3-theme-l4 w3-margin-top'>
       {@html exercisesSet.title || ''}
    </header>
    <div class='w3-container'>
      {#if exercisesSet.prologue}
      <p class='prologue'>{@html exercisesSet.prologue}</p>
      {/if}

      <div class='w3-container w3-section'>
      {#each exercisesSet.exercises as exercise}
        {#if exercise instanceof CodeGradX.ExercisesSet}
          <svelte:self exercisesSet={exercise} 
                       campaign={campaign}
                       on:authenticate />
  
        {:else if exercise instanceof CodeGradX.Exercise}
          <Exercise exercise={exercise}
                    campaign={campaign}
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
 import Exercise from './Exercise.svelte';
 import { CodeGradX } from 'codegradx/campaign';

 export let exercisesSet = null;
 export let campaign = undefined;
</script>

