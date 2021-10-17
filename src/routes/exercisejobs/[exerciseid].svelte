<!--
     Page intended for authors to display jobs associated to one exercise

NOTA: many parts of code similar to campaignexercisejobs
-->

<style>
</style>

<Page title="Copies associées à {exerciseTitle}"
      shortTitle="Copies {exerciseTitle}"
      showheader={false} >      

  {#if exerciseTitle}
   <header class='w3-center w3-large'>
     Copies associées à {exerciseTitle}
     {#if exercise}
     <span class='w3-right w3-margin-left w3-xlarge'
           title={"Information sur l'exercice"}
           on:click='{() => showinfo = true}'><InformationSign /></span>
     {/if}
   </header>
  
   {#if showinfo && exercise}
   <ExerciseInfo exercise={exercise}
                 bind:showinfo={showinfo} />
   {/if}
  {/if}

  {#if error}<Problem bind:error={error} />{/if}
  
  {#if showjobs}
   <ExerciseJobsList bind:jobs={jobs}
                     bind:count={count}
                     bind:total={total}
                     bind:rest={rest}
                     seeMore={seeMore} />
  {:else if ! error}
    <WaitingImage message="Chargement des copies associées..." />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import InformationSign from '../../components/InformationSign.svelte';
 import Problem from '../../components/Problem.svelte';
 import ExerciseInfo from '../../components/ExerciseInfo.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import ExerciseJobsList from '../../components/ExerciseJobsList.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/src/exercise';
 import { initializePerson, isUser, goto } from '../../client/lib.mjs';
 import { sleep } from '../../common/utils.mjs';
 import { person, current_exercise, campaign, lastmessage }
    from '../../stores.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { onClient } from '../../common/utils.mjs';

 let error = undefined;
 let exercise = undefined;
 let showinfo = false;
 let exerciseTitle = '...';
 let showjobs = false;
 let jobs = [];
 let uuid = undefined;
 let count = 20;
 let offset = 0;
 let total = undefined;
 let rest = 0;
 
 onClient(async () => {
   const uri = window.document.location.pathname;
   uuid = uri.replace(/\/exercisejobs\/(.+)$/, '$1');
   
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
   }
 });
 
 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person.isauthor ) {
     error = "Navré mais vous n'êtes pas auteur d'exercices!";
     return;
   }
   try {
     if ( $current_exercise ) {
       exercise = $current_exercise;
       uuid = $current_exercise.uuid;
     }
     exerciseTitle = uuid;
     await findRelatedJobs(uuid);
     if ( jobs.length > 0 ) {
       exerciseTitle = jobs[0].exercise_nickname;
       if ( ! exercise ) {
         exercise = new CodeGradX.Exercise({
           uuid,
           nickname: jobs[0].exercise_nickname,
           name: jobs[0].exercise_name
         });
       }
     }
     showjobs = true;
   } catch (exc) {
     console.log('exercisejobs1', {exc});
     error = parseAnomaly(exc);
     showjobs = false;
   }
 });

 async function seeMore (event) {
   await findRelatedJobs(uuid);
 }

 async function findRelatedJobs (uuid) {
   try {
     const state = CodeGradX.getCurrentState();
     const path = `/jobs/exercise/${uuid}`;
     const response = await state.sendAXServer('x', {
       path: `${path}?count=${count}&offset=${offset}`,
       method: 'GET',
       headers: {
         'Accept': 'application/json'
       }
     });
     if ( response.ok ) {
       const json = response.entity;
       total = json.total;
       count = json.count;
       // prepare next offset:
       offset = json.offset + count;
       rest = Math.max(0, total - offset);
       const newjobs = json.jobs.map(js => new CodeGradX.Job(js));
       jobs = jobs.concat(newjobs);
       if ( jobs.length > 0 ) {
         exerciseTitle = json.jobs[0].exercise_nickname;
       }
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('exercisejobs2', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>
