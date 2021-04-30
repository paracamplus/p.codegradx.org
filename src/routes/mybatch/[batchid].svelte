<!-- 
     For teachers, display one batch and associated jobs
-->

<Page title='Lot {batchTitle}'
      shorttitle='batch' >

  {#if error}<Problem bind:error={error} />{/if}

  {#if batch}
  <div class='w3-container'>
    <ul>
      <li>Début de notation: {CodeGradX.Date2str(batch.archived)}</li>
      {#if exercise && exercise.name}
      <li>Exercice: {exercise.name}</li>
      {/if}
      {#if batch.totaljobs}
        {#if batch.finishedjobs > 1}
          <li> {batch.finishedjobs} copies notées sur {batch.totaljobs} </li>
        {:else}
          <li> {batch.finishedjobs} copie notée sur {batch.totaljobs} </li>
        {/if}
      {/if}
      {#if totalDuration}
        <li>Durée totale de la notation: {totalDuration}s</li>
      {/if}
    </ul>
  </div>

  <p class='smallHint'>
    {#if jobs && jobs.length}
    Il y a {jobs.length} copies listées ci-dessous parmi le total de
    {batch.totaljobs} copies.
    Les copies sur fond rose sont problématiques: cliquer sur Pb donne
    des renseignements bruts sur les circonstances du problème.
    Cliquer sur une ligne affiche le rapport de notation associé (sauf
    si la ligne est grisée), cliquer+CTRL l'affiche dans un onglet différent.
    Cliquer sur un titre trie les lignes.
    {/if}
  </p>

  {#if batch.finishedjobs < batch.totaljobs}
  <div class='w3-container'>
    <span class='w3-right'>
      {#if pursue}
      <span title='Je continue à chercher les copies notées...'>...</span>
      {:else}
      <span title="Rafraîchir la liste"
            on:click={continueBatch}><RefreshSign /></span>
      {/if}
    </span>
  </div>
  {/if}

  <BatchJobsList bind:jobs={jobs} bind:totaljobs={totaljobs} />

  {:else}
  <WaitingImage message="Chargement des informations..." />
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import BatchJobsList from '../../components/BatchJobsList.svelte';
 import Problem from '../../components/Problem.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import RefreshSign from '../../components/RefreshSign.svelte';
 
 import { onMount, onDestroy } from 'svelte';
 import { onClient } from '../../common/utils.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { CodeGradX } from 'codegradx/src/batch';
 import queryString from 'query-string';
 import { sleep } from '../../common/utils.mjs';
 import { current_exercise } from '../../stores.mjs';

 let batchid = undefined;
 let batchTitle = '...';
 let batch = undefined;
 let exercise = {};
 let jobs = [];
 let error = undefined;
 let pursue = 30;
 let totalDuration = 0;
 let totaljobs = undefined;

 onClient(async () => {
   const uri = window.document.location.pathname;
   batchid = uri.replace(/^(.*\/)?mybatch\/([^\/]+)/, '$2');
   batchid = CodeGradX.normalizeUUID(batchid);
   batchTitle = batchid;
   batch = new CodeGradX.Batch({
     batchid,
     archived: new Date()
   });
   //console.log('mybatch0', {batch}); // DEBUG
 });

 onMount(async () => {
   exercise = $current_exercise || {};
   await refreshBatchReport();
   await pursueBatch();
 });

 onDestroy(() => {
   pursue = 0;
 });

 async function refreshBatchReport () {
   try {
     const report = await batch.getReport({});
     //console.log('mybatch1', {batch: report}); // DEBUG
     Object.assign(batch, new CodeGradX.Batch(report));
     Object.assign(exercise, batch.exercise);
     batch.archived = CodeGradX._str2Date(`${batch.archived}`);
     batchTitle = batch.label || batchTitle;
     totaljobs = batch.totaljobs;
     jobs = Object.values(batch.jobs);
     const tstart = batch.archived.valueOf();
     let td = 0;
     jobs.forEach(job => {
       if ( job.problem && job.problem === '0' ) {
         job.problem = false;
       }
       const t = job.finished.valueOf();
       const delta = t - tstart;
       td = Math.max(td, delta);
     });
     if ( batch.finishedjobs === batch.totaljobs ) {
       totalDuration = Math.round(td/1000);
     }
   } catch (exc) {
     console.log('mybatch1', {exc});
     error = parseAnomaly(exc);
   }
 }

 async function pursueBatch () {
   while ( pursue-- && batch.finishedjobs < batch.totaljobs ) {
     await sleep(5);
     //console.log('mybatch2', {batch}); // DEBUG
     await refreshBatchReport();
   }
 }

 async function continueBatch (event) {
   pursue = 30;
   await pursueBatch();
 }
 
</script>
