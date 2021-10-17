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
              bind:count={count}
              bind:total={total}
              bind:rest={rest}
              seeMore={seeMore} />
  {:else if ! error}
    <WaitingImage message="Chargement de mon historique..." />
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
 import { CodeGradX } from 'codegradx/src/campaign';
 import { CodeGradX as cx } from 'codegradx/src/campaignlib';
 import { initializePerson, goto, isUser } from '../../client/lib.mjs';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { onClient } from '../../common/utils.mjs';

 let error = undefined;
 let jobs = [];
 let offset = 0;
 let count = 20;
 let rest = 0;
 let total = 0;
 let showStudentJobs = false;
 let campaignName = '';
 let campaignTitle = '';

 onClient(async () => {
   const uri = window.document.location.pathname;
   campaignName = uri.replace(/^(.*\/)?history\/([^\/]+)/, '$2');
   campaignTitle = 'dans ' + campaignName;
   
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
       jobs = [].concat(jobs, newjobs);
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
