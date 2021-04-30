<!--
     Display a list of jobs related to a single exercise.
-->

<style>
 tr.removed {
   background-color: var(--color-hover-gray);
 }
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

  <p class='smallHint'>
    {#if jobs && jobs.length}
    Il y a {total} copies, {jobs.length} sont listées ci-dessous.
    Les copies sur fond rose sont problématiques: cliquer sur Pb donne
    des renseignements bruts sur les circonstances du problème.
    Cliquer sur une ligne affiche le rapport de notation associé (sauf
    si la ligne est grisée), cliquer+CTRL l'affiche dans un onglet différent.
    Cliquer sur un titre trie les lignes.
    {/if}
  </p>
  
  <table class='w3-table w3-center w3-hoverable w3-bordered'>
    <thead class="w3-theme-l3">
      <th on:click={sortColumn('finished', 'date')}>date</th>
      <th on:click={sortColumn('person_id', 'int')}>apprenant</th>
      <th on:click={sortColumn('mark', 'float')}>note / {totalMark}</th>
      <th on:click={sortColumn('problem')}>problème</th>
    </thead>
    <tbody>
      {#if jobs.length > 0}
        {#each jobs as job}
          <tr class:removed={job.removed}
              data-jobid={job.jobid}
              class:problematic={!!job.problem}
              on:click={mkShowJob(job)} >
            <td>{CodeGradX.Date2str(job.finished)}</td>
            <td>{job.person_id}</td>
            <td>{job.mark}</td>
            <td on:click={mkShowJobProblem(job)}>
              {#if job.problem}
              <span title="Afficher les problèmes">Pb</span>{/if}</td>
          </tr>
        {/each}
        {#if rest}
          <tr>
            <td on:click={seeMore}
                class='w3-center'
                colspan='4'>
              <span class='w3-btn w3-round-xxlarge w3-theme-l4'>
                encore {rest} copies restantes ...</span></td>
          </tr>
        {/if}
      {:else}
          <tr>
            <td colspan='4' class='w3-center'>Aucune copie!</td>
          </tr>
      {/if}
    </tbody>
  </table>
</div>

<script>
 import JobReport from './JobReport.svelte';
 import JobProblemReport from './JobProblemReport.svelte';

 import { onMount, createEventDispatcher  } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { massageMark } from '../client/marklib.mjs';
 
 export let jobs = [];
 export let rest;
 export let total = undefined;
 export let exercise = undefined;
 $: totalMark = exercise ? exercise.totalMark : 1;
 let currentJob = undefined;
 let currentJobProblem = undefined;

 
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

 function seeMore (event) {
   dispatch('seeMore', {});
 }

</script>      
