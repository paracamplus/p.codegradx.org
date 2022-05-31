<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        data-close="Hall of Fame"
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshHallOfFame}><RefreshSign /></span>
</div>

{#if error}<Problem bind:error={error} />{/if}

<table bind:this={table}
       class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('started', 'date')}>date</th>
      <th on:click={sortColumn('mark')}>score</th>
      <th on:click={sortColumn('person_pseudo')}>équipe</th>
    </tr>
  </thead>
  <tbody>
    {#if loaded}
      {#each items as item}
      <tr>
        <td>{CodeGradX.Date2str(item.started)}</td>
        <td>{item.mark}</td>
        <td>{item.person_pseudo}</td>
      </tr>
      {:else}
      <tr>
        <td colspan='3' class='w3-center'>aucun score!</td></tr>
      {/each}
    {:else}
      <tr><td colspan='3'>
        <WaitingImage message="Chargement des scores..." /></td></tr>
    {/if}
  </tbody>
</table>

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import Problem from '../components/Problem.svelte';
 
 import { onMount, createEventDispatcher, onDestroy } from 'svelte';
 const dispatch = createEventDispatcher();
 import { campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { sleep } from '../common/utils.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 export let delay = 30; // seconds
 export let from = undefined;
 let items = [];
 let loaded = false;
 let error = undefined;
 let table;
  
 onMount(async () => {
   await refreshHallOfFame();
   if ( delay ) {
     await pursueRefreshments(delay);
   }
 });

 onDestroy(() => {
   delay = 0;
 });

 async function pursueRefreshments (delay) {
   if ( delay ) {
     await sleep(delay);
     await refreshHallOfFame();
     await pursueRefreshments(delay);
   }
 }

  // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     items = doSortColumn(table, key, items, hint);
   };
 }

 async function refreshHallOfFame (event) {
   loaded = false;
   const state = CodeGradX.getCurrentState();
   try {
     const response = await state.sendAXServer('x', {
       path: `/campaign/halloffame/${$campaign.name}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       items = response.entity.map(massageHallOfFameItem);
       if ( from ) {
         items = items.filter(item => {
           const t = CodeGradX._str2Date(item.date).valueOf();
           //console.log(`Compare ${from} and ${t} = ${item.date}`); // DEBUG
           return (t >= from);
         });
       }
       loaded = true;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('refreshHallOfFame', {exc});
     error = parseAnomaly(exc);
   }
 }
 
 function massageHallOfFameItem (item) {
   return item;
 }

</script>
