<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshNotifications}><RefreshSign /></span>
</div>
<table class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('date', 'date')}>date</th>
      <th on:click={sortColumn('category')}>catégorie</th>
      <th on:click={sortColumn('origin')}>origine</th>
      <th on:click={sortColumn('payload')}>données</th>
    </tr>
  </thead>
  <tbody>
    {#if loaded}
      {#each items as item}
      <tr>
        <td>{item.date}</td>
        <td>{item.category}</td>
        <td>{item.origin}</td>
        <td>{item.payload}</td>
      </tr>
      {:else}
      <tr>
        <td colspan='4' class='w3-center'>aucune notification</td></tr>
      {/each}
      {:else}
      <tr><td colspan='4' class='waitingMessage'>
        Chargement des notifications</td></tr>
      <tr><td colspan='4'><WaitingImage /></td></tr>
    {/if}
  </tbody>
</table>

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { campaign } from '../stores.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { shorten } from '../client/utils.mjs';
 import { goto } from '../client/lib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 let items = [];
 let loaded = false;
  
 onMount(async () => {
   await refreshNotifications();
 });

  // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     items = doSortColumn(key, items, hint);
   };
 }

 async function refreshNotifications (event) {
   loaded = false;
   const state = CodeGradX.getCurrentState();
   try {
     const response = await state.sendAXServer('x', {
       path: `/notification/campaign/${$campaign.name}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       items = response.entity;
       loaded = true;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('refreshNotifications', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>
