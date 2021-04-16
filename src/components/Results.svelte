<section class='w3-container'>
  
  <Problem bind:error={error} />

  {#if showresults}
    <p class='smallHint'>
      Vous pouvez cliquer sur un exercice pour améliorer votre score.
      Le score est vert quand supérieur à 95%, orange quand supérieur
      à 80%, rouge quand l'exercice a été, au moins une fois, tenté.
    </p>
    <ResultsSet bind:exercisesSet={exercisesSet}
                bind:results={results} />
  {:else if ! error}
     <div class='waitingMessage'>Chargement de vos résultats...</div>
     <WaitingImage />
  {/if}
  
</section>

<script>
 import Problem from '../components/Problem.svelte';
 import ResultsSet from '../components/ResultsSet.svelte';
 import WaitingImage from '../components/WaitingImage.svelte';
 
 import { onMount } from 'svelte';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { CodeGradX } from 'codegradx/campaignlib';
 import { CodeGradX as _ } from 'codegradx/src/userlib';
 
 export let person = undefined;
 export let campaign = undefined;
 let error = undefined;
 let exercisesSet = undefined;
 let results = []; // Array of {name, nickname, mark, attempts}
 let showresults = false;

  onMount(async () => {
   if ( person && campaign ) {
     await refresh(person, campaign);
   } else {
     error = "Erreur interne!";
   }
  });

 async function refresh (person, campaign) {
   showresults = false;
   try {
     exercisesSet = await campaign.getExercisesSet();
     const user = await person.getProgress(campaign);
     results = user.results;
     showresults = true;
   } catch (exc) {
     console.log('Results refresh', {exc});
     error = parseAnomaly(exc);
   }
 }
  
</script>
