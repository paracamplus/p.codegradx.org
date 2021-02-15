<style>
 header.bold {
   font-weight: bolder;
 }
</style>

<svelte:head>
  <title>CodeGradX/Exercice</title>
</svelte:head>

<Header />

<div class='w3-container'>
  <div class='w3-margin-top w3-padding'>

  {#if showExercise}
   <header class='w3-center w3-large bold'>
     Exercice {$current_exercise.nickname}
     <span class='w3-right w3-margin-left w3-xlarge'
           title={"Information sur l'exercice"}
           on:click='{() => showinfo = true}'><InformationSign /></span>
   </header>
   
   {#if showinfo}
   <ExerciseInfo exercise={$current_exercise}
                 bind:showinfo={showinfo} />
   {/if}

   <Stem exercise={$current_exercise} />

   <Equipment exercise={$current_exercise} />

   <Answer exercise={$current_exercise}
           on:jobPromise={handleJobPromise} />

   {#if job}<JobReport bind:job={job} />{/if}

  {:else}
   <p> Chargement de l'exercice ... </p>
   <WaitingImage />
  {/if}
 </div>
</div>

<Bottom />

<script>
 import Header from '../../components/Header.svelte';
 import InformationSign from '../../components/InformationSign.svelte';
 import Problem from '../../components/Problem.svelte';
 import ExerciseInfo from '../../components/ExerciseInfo.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import Stem from '../../components/Stem.svelte';
 import Equipment from '../../components/Equipment.svelte';
 import Answer from '../../components/Answer.svelte';
 import JobReport from '../../components/JobReport.svelte';
 import Bottom from '../../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/exercise';
 import { initializePerson } from '../../client/lib.mjs';
 import { sleep } from '../../common/utils.mjs';
 import { fade } from 'svelte/transition';
 import { person, current_exercise, campaign } from '../../stores.mjs';

 let error = undefined;
 let showinfo = false;
 let job = undefined;
 let showExercise = false;
 
 onMount(async () => {
   $person = await initializePerson();
   try {
     if ( ! $current_exercise ) {
       let uri = window.document.location.pathname;
       const safecookie = uri.replace(/\/exercise\/(U.{50,})$/, '$1');
       const exercise = new CodeGradX.Exercise({safecookie});
       $current_exercise = exercise;
     }
     await $current_exercise.getDescription();
     //console.log($current_exercise);//DEBUG
     showExercise = true;
   } catch (exc) {
     console.log('exercise', exc);
     error = exc.toString();
   }

   if ( ! $current_exercise ) {
     if ( $campaign ) {
       error = "Je ne vois pas de quel exercice vous parlez ?";
       await sleep(3);
       sapper.goto(`/campaign/${$campaign.name}`);
     } else {
       error = "Quel univers voulez-vous explorer ?";
       await sleep(3);
       sapper.goto('/universes');
     }
   }
 });

 async function handleJobPromise (event) {
   const { jobPromise } = event.detail;
   if ( jobPromise ) {
     job = await jobPromise;
   } else {
     job = undefined;
   }
 }

</script>
