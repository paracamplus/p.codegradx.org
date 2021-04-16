<style>
 span.mark {
   padding: 0.25em;
   border: solid 1px var(--color-theme-d4);
   margin-left: 2em;
 }
 :global(pre) {
   background-color: var(--color-hover-gray);
   padding-left: 0.5em;
   padding-right: 0.5em;
 }
 :global(pre .fw4ex_lineNumber) {
   font-size: 50%;
   color: var(--color-theme-d4);
 }
 :global(.fw4ex_error) {
   color: red;
 }
 :global(.fw4ex_error pre) {
   color: red;
 }
 :global(.fw4ex_warning) {
   color: orange;
 }
 :global(.fw4ex_warning pre) {
   color: orange;
 }
 :global(.fw4ex_section2) {
   padding: 0.5em;
   border: dotted 1px grey;
   margin-bottom: 1ex;
 }
 :global(.fw4ex_mark) {
   color: white;
   background-color: var(--color-theme-d4);
   padding: 0.3em;
 }
</style>

{#if job}
<div class='w3-container'>
  <h3>Rapport de notation {#if job.label}<code>{job.label}</code>{/if}
    <span class='w3-right w3-margin-left'
          on:click={close}>&#x2716;</span>
    {#if showReport}
    <span class='w3-right w3-margin-left'
          title="Information administrative"
          on:click={() => showinfo = true}>
          <InformationSign /></span>
    <span class='w3-right mark'>
      {massageMark(job.mark, 100, job.totalMark)} /
      {massageMark(job.totalMark, 100, job.totalMark)}</span>
    {/if}
  </h3>

  {#if showinfo}
  <JobInfo job={job}
           bind:showinfo={showinfo} />
  {/if}
  
  <div style="text-align: left;">
    {#if showReport}
      {@html job.HTMLreport}
    {:else}
      {#if ! error}
      <p class='waitingMessage'>Chargement du rapport de notation...</p>
      <WaitingImage />
      {/if}
    {/if}
  </div>
  <Problem bind:error={error} />
</div>
{/if}

<script>
 import Problem from './Problem.svelte';
 import WaitingImage from './WaitingImage.svelte';
 import InformationSign from './InformationSign.svelte';
 import JobInfo from './JobInfo.svelte';
 
 import { onMount, createEventDispatcher  } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx/src/job';
 import { massageMark } from '../client/marklib.mjs';

 export let job;
 export let attempts = undefined;
 let error = undefined;
 let showReport = false;
 let showinfo = false;
 
 onMount(async () => {
   //console.log({job});
   try {
     const parameters = {};
     if ( attempts ) {
       parameters.attempts = +(attempts);
     }
     await job.getReport(parameters);
     showReport = true;
   } catch (exc) {
     console.log("jobReport", {exc});
     if ( exc.message.match(/waitedTooMuch/i) ) {
       error = 'Désolé mais je ne trouve pas ce rapport de notation!';
     } else {
       error = exc.toString();
     }
   }
 });

 function close (event) {
   const uri = window.document.location.pathname;
   if ( uri.match(/\/job\//) ) {
     window.close();
   } else {
     dispatch('close');
     job = undefined;
   }
 }

</script>
