<section class='w3-container'>
  
  <Problem bind:error={error} />

  {#if showresults}
    <p class='smallHint'>
      Vous pouvez cliquer sur un exercice pour améliorer votre score.
      Le score est vert quand supérieur à 95%, orange quand supérieur
      à 80%, rouge quand l'exercice a été, au moins une fois, tenté.
    </p>

    {#if summary}
    <p> Parmi les {summary.total} exercices proposés, vous avez
      {#if summary.bad > 0}débuté {summary.bad} exercices,{/if}
      {#if summary.good > 0}résolu partiellement {summary.good} exercices,{/if}
      {#if summary.verygood}résolu {summary.verygood} exercices{/if}.
    {/if}
    
    <ResultsSet bind:exercisesSet={exercisesSet}
                bind:results={results} />
  {:else if ! error}
     <WaitingImage message="Chargement de vos résultats..." />
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
 let summary = undefined;

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
     summary = computeSummary(results);
     summary.total = computeNumberOfExercises(campaign);
   } catch (exc) {
     console.log('Results refresh', {exc});
     error = parseAnomaly(exc);
   }
 }

 // Cf. ResultTitle
 function computeSummary (results) {
   console.log('results', {results}); // DEBUG
   let verygood = 0;
   let good = 0;
   let bad = 0;
   results.forEach(item => {
     const mark = item.mark;
     if ( 0 !== mark && mark < 0.75 ) {
       bad++;
     } else if ( 0.75 <= mark && mark < 0.95 ) {
       good++;
     } else if ( 0.95 <= mark ) {
       verygood++;
     }
   });
   return { bad, good, verygood };
 }

 function computeNumberOfExercises (campaign) {
   let counter = 0;
   function count (exercises) {
     if ( Array.isArray(exercises) ) {
       exercises.forEach(count);
     } else if ( exercises instanceof CodeGradX.ExercisesSet ) {
       count(exercises.exercises);
     } else if ( exercises instanceof CodeGradX.Exercise ) {
       counter++;
     }
   }
   count(campaign.exercisesSet);
   return counter;
 }
  
</script>
