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
    <span class='w3-right w3-margin-left'
          data-close="JobsList"
          on:click={close}>&#x2716;</span>
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
    <WaitingImage message="Chargement des copies associées..." />
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
 import { initializePerson, goto, isUser } from '../../../client/lib.mjs';
 import { person, current_exercise, campaign, lastmessage } 
    from '../../../stores.mjs';
 import { doSortColumn } from '../../../client/sortlib.mjs';
 import { parseAnomaly } from '../../../client/errorlib.mjs';
 import { fetchCampaign } from '../../../client/campaignlib.mjs';
 import { onClient } from '../../../common/utils.mjs';

 let error = undefined;
 let exercise = undefined;
 let showinfo = false;
 let campaignName = undefined;
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
   campaignName = uri
        .replace(/\/campaignexercisejobs\/(.+)\/(.+)$/, '$1');
   uuid = uri.replace(/\/campaignexercisejobs\/(.+)\/(.+)$/, '$2');
   exerciseTitle = CodeGradX.normalizeUUID(uuid);
   
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     await goto('/connect');
     return;
   } else {
     $person = maybeperson;
   }
 });

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     $lastmessage = error = "Veuillez d'abord choisir un univers! ...";
     goto('/universes');
     return;
   }
   if ( ! uuid && $current_exercise ) {
     exercise = $current_exercise;
     uuid = $current_exercise.uuid;
   }
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

 function close (event) {
   const uri = window.document.location.pathname;
   if ( uri.match(/\/campaignexercisejobs\//) ) {
     window.close();
   } else {
     showinfo = false;
   }
   
   /*
   const listener = window.addEventListener('popstate', (event) => {
     console.log('popstate1', {event}); // DEBUG
     setTimeout(() => {
       console.log('popstate2', {event}); // DEBUG
       window.removeEventListener('popstate', listener);
       const previousUrl = event.state.previousUrl;
       goto(previousUrl);
     }, 0);
   });
   window.history.back();
   */
 }

</script>
