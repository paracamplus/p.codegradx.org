
<style>
 tr.problematic {
   background-color: pink;
 }
</style>

<div>
  
  {#if currentJob}
    <section class='w3-container w3-center w3-modal'
             style='display:block' >
      <div class='w3-modal-content w3-animate-top w3-border'>
        <JobReport bind:job={currentJob} attempts={2} />
      </div>
    </section>
  {/if}

  {#if currentJobProblem}
    <section class='w3-container w3-center w3-modal'
             style='display:block' >
      <div class='w3-modal-content w3-animate-top w3-border'>
        <JobProblemReport bind:job={currentJobProblem} attempts={2} />
      </div>
    </section>
  {/if}

  <table id='batchjobslist'
         bind:this={table}
         class='w3-table w3-center w3-hoverable w3-bordered'>
    <thead class="w3-theme-l3">
      <tr>
        <th on:click={sortColumn('label')}>label</th>
        <th on:click={sortColumn('mark')}>note</th>
        <th on:click={sortColumn('duration')}>durée</th>
        <th on:click={sortColumn('problem')}>problème</th>
      </tr>
    </thead>
    <tbody>
      {#each jobs as job}
      <tr data-jobid={job.jobid}
          class:problematic={!!job.problem}
          on:click={mkShowJob(job)}>
        <td>{job.label}</td>
        <td>{job.mark} / {job.totalMark}</td>
        <td>{job.duration}s</td>
        <td on:click={mkShowJobProblem(job)}>{#if job.problem}Pb{/if}</td>
      </tr>
      {/each}
      {#if totaljobs}
        {#if jobs.length < totaljobs}
         <tr><td colspan='4'>
           <WaitingImage message="Chargement des {totaljobs - jobs.length}
                         copies restantes..." /></td></tr>
         {/if}
      {:else}
        <tr><td colspan='4'>
          <WaitingImage message="Chargement des copies..." /></td></tr>
      {/if}
    </tbody>
  </table>
</div>

<script>
 import JobReport from './JobReport.svelte';
 import JobProblemReport from './JobProblemReport.svelte';
 import WaitingImage from './WaitingImage.svelte';

 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { massageMark } from '../client/marklib.mjs';
  
 export let jobs = [];
 export let totaljobs = undefined;
 let currentJob = undefined;
 let currentJobProblem = undefined;
 let table;

 // Sort jobs with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     jobs = doSortColumn(table, key, jobs, hint);
   };
 }

 function mkShowJob (job) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     if ( event.metaKey || event.ctrlKey || event.altKey ) {
       const href = `/job/${job.jobid}`;
        const element = document.createElement('a');
        element.setAttribute('href', href);
        element.setAttribute('target', '_blank');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
     } else {
       currentJob = job;
     }
   };
 }

 function mkShowJobProblem (job) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     currentJob = undefined;
     currentJobProblem = job;
   };
 }

</script>
