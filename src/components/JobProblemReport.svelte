<style>
 div.report {
   max-width: 100vw;
   background-color: var(--color-hover-gray);
   padding: 0.5em;
 }
</style>

{#if job}
<div class='w3-container'>
  <h3>Rapport de problèmes de notation 
    {#if job.label}<code>{job.label}</code>{/if}
    <span class='w3-right w3-margin-left'
          on:click={() => job = undefined}>&#x2716;</span>
  </h3>

  <p class='smallHint'>
    Ce rapport (brut) est destiné aux auteurs d'un exercice. Il contient
    notamment le <code>stderr</code> des scripts de notation. 
  </p>
  
  <div style="text-align: left;">
    {#if showProblemReport}
      <div class='report'>{@html problem}</div>
    {:else}
      {#if ! error}
        <p class='waitingMessage'>
          Chargement du rapport de problèmes notation...</p>
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
 
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/src/job';
 import { massagePRE } from '../client/utils.mjs';

 export let job;
 let error = undefined;
 let showProblemReport = false;
 let problem = undefined;
 
 onMount(async () => {
   //console.log({job});
   if ( job.problem ) {
     try {
       const js = await CodeGradX.parsexml(job.problem._cdata);
       job.problem = js;
       problem = massagePRE(JSON.stringify(job.problem, null, 2));
       showProblemReport = true;
       return;
     } catch (exc) {
       // ignore
     }
   }
   try {
     await job.getProblemReport({ attempts: 2 });
     problem = job.XMLproblemReport;
     showProblemReport = true;
   } catch (exc) {
     console.log("jobProblemReport", exc);
     if ( exc.message.match(/waitedTooMuch/i) ) {
       error = 'Désolé mais je ne trouve pas ce rapport de notation!';
     } else {
       error = exc.toString();
     }
   }
 });

</script>
