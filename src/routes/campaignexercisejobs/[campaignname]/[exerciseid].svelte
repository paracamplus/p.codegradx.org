<!--
     This page is for teachers, it displays the answers to an exercise.

NOTA: many parts of code similar to exercisejobs
-->

<style>
</style>

<Page title="Copies associées à {exerciseTitle}"
      shortTitle="Copies {exerciseTitle}"
      showheader={false} >      

  {#if exerciseTitle}
   <header class='w3-center w3-large bold'>
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

  {#if showjobs}
   <ExerciseJobsList bind:jobs={jobs}
                     bind:total={total}
                     bind:rest={rest}
                     bind:exercise={exercise}
                     on:seeMore={seeMore} />
  {:else if ! error}
    <p class='waitingMessage'>Chargement des copies associées...</p>
    <WaitingImage />
  {/if}

  {#if error}<Problem bind:error={error} />{/if}
  
</Page>

<script>
 import Page from '../../../components/Page.svelte';
 import InformationSign from '../../../components/InformationSign.svelte';
 import Problem from '../../../components/Problem.svelte';
 import ExerciseInfo from '../../../components/ExerciseInfo.svelte';
 import WaitingImage from '../../../components/WaitingImage.svelte';
 import ExerciseJobsList from '../../../components/ExerciseJobsList.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/exercise';
 import { CodeGradX as _ } from 'codegradx/campaign';
 import { initializePerson } from '../../../client/lib.mjs';
 import { sleep } from '../../../common/utils.mjs';
 import { person, current_exercise, campaign } from '../../../stores.mjs';
 import { doSortColumn } from '../../../client/sortlib.mjs';
 import { parseAnomaly } from '../../../client/errorlib.mjs';
 import { fetchCampaign } from '../../../client/campaignlib.mjs';

 let error = undefined;
 let exercise = undefined;
 let showinfo = false;
 let exerciseTitle = '...';
 let showjobs = false;
 let jobs = [];
 let uuid = undefined;
 let count = 10;
 let offset = 0;
 let total = undefined;
 let rest = 0;
 
 onMount(async () => {
   const uri = window.document.location.pathname;
   const campaignName = uri
        .replace(/\/campaignexercisejobs\/(.+)\/(.+)$/, '$1');
   uuid = uri.replace(/\/campaignexercisejobs\/(.+)\/(.+)$/, '$2');
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
     return;
   } else if ( ! $person.isauthor ) {
     error = "Navré mais vous n'êtes pas auteur d'exercices!";
     return;
   }
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     error = "Veuillez d'abord choisir un univers! ...";
     await sleep(3);
     goto('/universes');
   }
   if ( $current_exercise ) {
     exercise = $current_exercise;
     uuid = $current_exercise.uuid;
   }
   exerciseTitle = uuid;
   try {
     await findRelatedJobs(uuid);
     showjobs = true;
   } catch (exc) {
     console.log('exercisejobs1', {exc});
     error = parseAnomaly(exc);
   }
 });

 async function seeMore (event) {
   await findRelatedJobs(uuid);
 }

 async function findRelatedJobs (uuid) {
   try {
     const state = CodeGradX.getCurrentState();
     const path = `/campaign/listJobsPerExercise/${$campaign.name}/${uuid}`;
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
       rest = Math.max(0, total - offset)
       const newjobs = json.jobs.map(js => new CodeGradX.Job(js));
       jobs = jobs.concat(newjobs);
       if ( ! exercise ) {
         exercise = new CodeGradX.Exercise(json.exercise);
       }
       $current_exercise = exercise;
       exerciseTitle = exercise.nickname;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('exercisejobs2', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>
