<!--
      This page displays the jobs made by the user in the current campaign
-->

<style>
</style>

<Page title="Mon historique {campaignTitle}"
      shortTitle="Historique/{campaignName}">

  {#if error}<Problem bind:error={error} />{/if}

  {#if showStudentJobs}
    <JobsList bind:jobs={jobs}
              bind:rest={rest}
              on:seeMore={seeMore} />
  {:else if ! error}
    <p class='waitingMessage'>Chargement de l'historique...</p>
    <WaitingImage height='50px' />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import JobsList from '../../components/JobsList.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, campaign, lastmessage } from '../../stores.mjs';
 import { CodeGradX } from 'codegradx/campaign';
 import { CodeGradX as cx } from 'codegradx/campaignlib';
 import { initializePerson, goto } from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';

 let error = undefined;
 let jobs = [];
 let showStudentJobs = false;
 let campaignName = '';
 let campaignTitle = '';
 let total = undefined;
 let offset = 0;
 let count = 20;
 let rest = 0;

 onMount(async () => {
   const uri = window.document.location.pathname;
   campaignName = uri.replace(/^(.*\/)?history\/([^\/]+)/, '$2');
   campaignTitle = 'dans ' + campaignName;
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
     return;
   }
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     $lastmessage = error = "Veuillez d'abord choisir un univers! ...";
     goto('/universes');
     return;
   }
   campaignTitle = `dans ${$campaign.name}`;
   await refreshHistory($person, $campaign);
 });

 async function seeMore () {
   await refreshHistory($person, $campaign);
 }

 async function refreshHistory (person, campaign) {
   showStudentJobs = false;
   try {
     const state = CodeGradX.getCurrentState();
     const path = `/history/campaign/${campaign.name}`;
     const response = await state.sendAXServer('x', {
       path: `${path}?count=${count}&offset=${offset}`,
       method: 'GET',
       headers: {
         Accept: "application/json"
       }
     });
     if ( response.ok ) {
       const json = response.entity;
       total = json.total;
       count = json.count;
       // prepare next offset:
       offset = json.offset + count;
       rest = Math.max(0, total - offset);
       const newjobs = json.jobs.map(CodeGradX.Job.js2job);
       jobs = jobs.concat(newjobs);
       showStudentJobs = true;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('history refreshHistory', {exc});
     error = parseAnomaly(exc);
   }
 }
 
</script>
