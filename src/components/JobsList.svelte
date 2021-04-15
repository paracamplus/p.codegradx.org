<!--
       Display a list of jobs related to various exercises
       for one user in one campaign.
-->

<style>
 tr.hidden {
   background-color: var(--color-hover-gray);
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

  <p class='smallHint'>
    Cliquer sur une ligne affiche le rapport de notation associé (sauf
    peut-être si la ligne est grisée),
    cliquer+CTRL l'affiche dans un onglet différent.
    Cliquer sur un titre trie les lignes.
  </p>

  <p> Il y a {jobs.length} copies différentes affichées ci-dessous{#if rest} 
    et encore, au plus, {rest} copies non encore affichées{/if}.
  </p>

  <table class='w3-table w3-center w3-hoverable w3-bordered'>
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
            <td>{massageMark(job.mark, factor, job.totalMark)}
              {#if job.totalMark}
                / {massageMark(job.totalMark, factor, job.totalMark)}
              {/if}</td>
            <td title={job.uuid}
                class='w3-hide-small'>{CodeGradX.Date2str(job.archived)}</td>
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
          <tr><td colspan='4'>
            <p class='w3-center'> rien du tout! </p>
          </td></tr>
      {/if}
    </tbody>
  </table>
</div>

<script>
 import JobReport from './JobReport.svelte';

 import { onMount, createEventDispatcher  } from 'svelte';
 const dispatch = createEventDispatcher();
 import { doSortColumn } from '../client/sortlib.mjs';
 import { massageMark } from '../client/marklib.mjs';
 import { CodeGradX } from 'codegradx';
 
 let currentJob = undefined;
 export let jobs = [];
 export let factor = 100;
 export let rest;
 
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

 function seeMore (event) {
   dispatch('seeMore', {});
 }

</script>
