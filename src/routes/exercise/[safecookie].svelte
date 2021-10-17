<!--
  Display a stem and provide means to answer the exercise.
-->

<style>
</style>

<Page shortTitle="Exercice/"
      title="Exercice {exerciseTitle}"
      showheader={false} >

  {#if error}<Problem bind:error={error} />{/if}
   
  {#if showAuthentication && ! $person}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href={buildGoto('connect')}>
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}

  {#if showExercise}
   <header class='w3-center w3-large'>
     Exercice {exerciseTitle}
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

  {:else if ! error && ! showAuthentication}
    <WaitingImage message="Chargement de l'exercice ..." />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import InformationSign from '../../components/InformationSign.svelte';
 import Problem from '../../components/Problem.svelte';
 import ExerciseInfo from '../../components/ExerciseInfo.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import Stem from '../../components/Stem.svelte';
 import Equipment from '../../components/Equipment.svelte';
 import Answer from '../../components/Answer.svelte';
 import JobReport from '../../components/JobReport.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/src/exercise';
 import { initializePerson, goto, buildGoto, isUser }
    from '../../client/lib.mjs';
 import { person, current_exercise, campaign, lastmessage }
   from '../../stores.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { onClient } from '../../common/utils.mjs';

 let error = undefined;
 let showinfo = false;
 let job = undefined;
 let showExercise = false;
 let exerciseTitle = '...';
 let showAuthentication = false;

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = 
       "Pour pratiquer cet exercice, vous devez d'abord vous identifier!";
     goto('/connect');
   }
 });
 
 onMount(async () => {
   const uri = window.document.location.pathname;
   const safecookie = uri.replace(/\/exercise\/(U.{50,})$/, '$1');
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Pour pratiquer cet exercice, vous devez d'abord vous identifier!";
     showAuthentication = true;
     return;
   }
   let exercise = undefined;
   if ( ! $current_exercise ) {
     $current_exercise = new CodeGradX.Exercise({safecookie});
   }
   try {
     await $current_exercise.getDescription();
     //console.log($current_exercise);//DEBUG
     exerciseTitle = $current_exercise.nickname;
     showExercise = true;
   } catch (exc) {
     console.log('exercise', {exc});
     error = parseAnomaly(exc);
     return;
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
