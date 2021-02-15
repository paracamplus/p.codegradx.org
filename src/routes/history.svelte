<Page title={`Mon historique ${$campaign ? `dans ${$campaign.name}` : ''}`}
      shortTitle="Profil">

  <Problem bind:error={error} />

  {#if currentJob}
  <section class='w3-container w3-center w3-modal'
           style='display:block' >
    <div class='w3-modal-content w3-animate-top w3-border'>
      <JobReport bind:job={currentJob} />
    </div>
  </section>
  {/if}

  <table id='jobsHistory'
         class='w3-table w3-center w3-hoverable w3-bordered'>
    <thead>
      <tr class="w3-theme-l3">
        <th on:click={sortColumn('exercise_nickname')}>surnom</th>
        <th on:click={sortColumn('exercise_name')}
            class='w3-hide-small w3-hide-medium'>
          nom</th>
        <th on:click={sortColumn('mark', 'float')}>note</th>
        <th on:click={sortColumn('archived', 'date')}
            class='w3-hide-small'>
          date</th>
    </thead>
    <tbody>
      {#if jobs.length > 0}
         {#each reverse(jobs) as job}
          <tr class:hidden={job.removed}
              on:click={mkShowJob(job)}>
            <td>{job.exercise_nickname}</td>
            <td class='w3-hide-small w3-hide-medium'>{job.exercise_name}</td>
            <td>{Math.round(factor * job.mark)} /
              {Math.round(factor * job.totalMark)}</td>
            <td class='w3-hide-small'>{job.archived}</td>
          </tr>
         {/each}
      {:else}
          <tr><td colspan='4'>
            <p> Chargement de l'historique en cours...</p>
            <WaitingImage />
          </td></tr>
      {/if}
    </tbody>
  </table>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import WaitingImage from '../components/WaitingImage.svelte';
 import JobReport from '../components/JobReport.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx/campaign';
 import { CodeGradX as cx } from 'codegradx/campaignlib';
 import { initializePerson } from '../client/lib.mjs';
 import { doSortColumn } from '../client/sortlib.mjs';
 import queryString from 'query-string';

 let error = undefined;
 let jobs = [];
 let factor = 100;
 let currentJob = undefined;

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
   }
   await refreshHistory($person);
 });

 async function findCampaign (person) {
   if ( $campaign ) {
     return $campaign;
   }
   try {
     $campaign = await person.getCurrentCampaign();
     return $campaign;
   } catch (exc) {
     // ignore, a campaign may be mentioned in the query string:
   }
   const campaignName = queryString.parse(window.location.search).campaign;
   if ( campaignName ) {
     try {
       $campaign = await person.getCampaign(campaignName);
       return $campaign;
     } catch (exc) {
       // ignore
     }
   }
   return undefined;
 }
   
 async function refreshHistory (person) {
   try {
     $campaign = await findCampaign(person);
     if ( $campaign ) {
       jobs = await $campaign.getJobs();
     } else {
       error = "Veuillez d'abord choisir un univers!";
     }
   } catch (exc) {
     console.log('refreshHistory', exc);
     error = "Je ne peux accéder à votre historique!";
   }
   //console.log({jobs});//DEBUG
 }
 
 function reverse (array) {
   const result = [];
   for ( let i=0 ; i<array.length ; i++ ) {
     result[i] = array[array.length - 1 - i];
   }
   return result;
 }

 // Sort jobs with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     jobs = doSortColumn(key, jobs, hint);
   };
 }

 function mkShowJob (job) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     currentJob = job;
   };
 }

</script>
