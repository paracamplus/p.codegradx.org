<!--
     Page intended for teachers to display students' jobs
-->

<style>
</style>

<Page title={`Historique ${studentTitle} ${campaignTitle}`}
      shortTitle="Historique" >

  {#if error}<Problem bind:error={error} />{/if}

  {#if showStudentJobs}
    <JobsList bind:jobs={jobs}
              bind:count={count}
              bind:total={total}
              bind:rest={rest}
              seeMore={seeMore} />
  {:else if ! error}
    <WaitingImage message="Chargement de l'historique..." />
  {/if}
    
</Page>

<script>
 import Page from '../../../components/Page.svelte';
 import Problem from '../../../components/Problem.svelte';
 import WaitingImage from '../../../components/WaitingImage.svelte';
 import JobsList from '../../../components/JobsList.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, campaign, lastmessage } from '../../../stores.mjs';
 import { CodeGradX } from 'codegradx/src/campaign';
 import { CodeGradX as cx } from 'codegradx/src/campaignlib';
 import { initializePerson, isTeacher, goto, isUser }
   from '../../../client/lib.mjs';
 import { fetchCampaign } from '../../../client/campaignlib.mjs';
 import { onClient } from '../../../common/utils.mjs';
 import { parseAnomaly } from '../../../client/errorlib.mjs';

 let error = undefined;
 let jobs = [];
 let count = 20;
 let offset = 0;
 let total = undefined;
 let rest = 0;
 let showStudentJobs = false;
 let studentid = undefined;
 let campaignName = '';
 let campaignTitle = '';
 let studentTitle = '';
 let student = undefined;

 onClient(async () => {
   const uri = window.document.location.pathname;
   campaignName = uri
        .replace(/^(.*\/)?studentjobs\/([^\/]+)\/([^\/]+)/, '$2');
   campaignTitle = `dans ${campaignName}`;
   studentid = uri.replace(/^(.*\/)?studentjobs\/([^\/]+)\/([^\/]+)/, '$3');
   
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
     return;
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
   if ( ! isTeacher($campaign, $person) ) {
     error = "Vous n'êtes pas un enseignant de cet univers!";
     return;
   }
   await refreshStudentHistory($campaign, studentid);
 });

 async function seeMore () {
   await refreshStudentHistory($campaign, studentid);
 }

 async function refreshStudentHistory (campaign, studentid) {
   try {
     const state = CodeGradX.getCurrentState();
     const url = `/campaign/listJobsPerStudent/${campaign.name}/${studentid}`;
     const response = await state.sendAXServer('x', {
       path: `${url}?count=${count}&offset=${offset}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
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
       //console.log('studentjobs', {jobs});//DEBUG
       if ( ! student ) {
         student = new CodeGradX.User(json.student);
         studentTitle = 'de ' + student.pseudo;
       }
       showStudentJobs = true;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('studentjobs refreshHistory', {exc});
     error = parseAnomaly(exc);
   }
 }

 function close (event) {
   const uri = window.document.location.pathname;
   if ( uri.match(/\/studentjobs\//) ) {
     window.close();
   } else {
     showStudentJobs = false;
   }
 }
 
</script>
