<!--
      This page displays a Job. It requires to be authenticated but
      it is sufficient to know the UUID of the job.
-->

<style>
</style>

<Page title={`Rapport de notation ${jobTitle}`}
      shortTitle="réponse" >

  {#if currentJob}
  <section class='w3-container w3-center'>
    <div>
      <JobReport bind:job={currentJob}
                 attempts={2} />
    </div>
  </section>
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import ExerciseInfo from '../../components/ExerciseInfo.svelte';
 import InformationSign from '../../components/InformationSign.svelte';
 import JobReport from '../../components/JobReport.svelte';

 import { onMount } from 'svelte';
 import { person } from '../../stores.mjs';
 import { initializePerson } from '../../client/lib.mjs';
 import { CodeGradX } from 'codegradx/exercise';

 let currentJob = undefined;
 let error = undefined;
 let jobTitle = '...';

 onMount(async () => {
   const uri = window.document.location.pathname;
   const jobid = uri.replace(/^(.*\/)?job\/([^\/]+)/, '$2');
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
     return;
   }
   jobTitle = jobid;
   const pathdir = '/s' + jobid.replace(/-/g, '').replace(/(.)/g, '/$1');
   try {
     currentJob = new CodeGradX.Job({ jobid, pathdir });
   } catch (exc) {
     console.log('job', {exc});
     error = "Je n'arrive pas à trouver le rapport de notation!";
   }
 });

</script>
