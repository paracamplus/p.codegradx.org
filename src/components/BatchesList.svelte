
<style>
</style>

{#if error}<Problem bind:error={error} />{/if}

{#if showBatchesList}
<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        title="Clore la liste"
        data-close="AllBatchesList"
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        title="Rafraîchir la liste"
        on:click={refreshBatchesList}><RefreshSign /></span>
</div>

<p class='smallHint'>
  Il y a {batches.length} lots. Cliquer sur une ligne permet
  d'afficher les réponses dans ce lot de copies.
</p>

<table id='batcheslist'
       bind:this={table}
       class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('uuid')}>UUID</th>
      <th on:click={sortColumn('archived', 'date')}>création</th>
    </tr>
  </thead>
  <tbody>
    {#each batches as batch}
    <tr on:click={mkShowBatch(batch)}>
      <td>{CodeGradX.normalizeUUID(batch.uuid)}</td>
      <td>{batch.archived}</td>
    </tr>
    {:else}
      {#if answered}
      <tr><td colspan='4' class='w3-center'>Aucun lot!</td></tr>
      {:else}
      <tr><td colspan='4'>
        <WaitingImage message="Chargement des données..." />
      </td></tr>
      {/if}
    {/each}
  </tbody>
</table>

{:else}
 <WaitingImage message="Chargement des lots..." />
{/if}

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import Problem from '../components/Problem.svelte';

 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { person, campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx/campaignlib';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { initializePerson, goto } from '../client/lib.mjs';
 import { onClient } from '../common/utils.mjs';
 import { fetchCampaign } from '../client/campaignlib.mjs';

 export let showBatchesList = false;
 export let entryPointName = 'listBatches';
 export let entryKeyName = 'batches';
 let batches = [];
 let answered = false;
 let error = undefined;
 let table;
 
 // Sort batches with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     batches = doSortColumn(table, key, batches, hint);
   };
 }

 onMount(async () => {
   try {
     $person = await initializePerson();
     $campaign = await fetchCampaign($person, $campaign.name);
     batches = await refreshBatchesList();
   } catch (exc) {
     console.log('AllBatchesList', {exc});
     error = parseAnomaly(exc);
   }
 });

 async function refreshBatchesList (event) {
   const state = CodeGradX.getCurrentState();
   try {
     answered = false;
     const response = await state.sendAXServer('x', {
       path: `/campaign/${entryPointName}/${$campaign.name}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       batches = response.entity[entryKeyName]
                         .map(e => new CodeGradX.Batch(e));
       showBatchesList = true;
       answered = true;
       return batches;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('AllBatchesList', {exc});
     error = parseAnomaly(exc);
   }
 }

 function mkShowBatch (batch) {
   return function (event) {
     error = undefined;
     goto(`/mybatch/${batch.uuid}`);
   };
 }

</script>
