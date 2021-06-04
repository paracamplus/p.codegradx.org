<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        data-close="Notifications"
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshNotifications}><RefreshSign /></span>
</div>

{#if error}<Problem bind:error={error} />{/if}

<table id='notificationslist'
       bind:this={table}
       class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('date', 'date')}>date</th>
      <th on:click={sortColumn('category')}>catégorie</th>
      <th on:click={sortColumn('content')}>fait</th>
    </tr>
  </thead>
  <tbody>
    {#if loaded}
      {#each items as item}
      <tr>
        <td>{CodeGradX.Date2str(item.date)}</td>
        <td>{item.category}</td>
        <td>{#if item.comment}{@html item.comment}
            {:else}{item.content}{/if}</td>
      </tr>
      {:else}
      <tr>
        <td colspan='3' class='w3-center'>aucune notification</td></tr>
      {/each}
    {:else}
      <tr><td colspan='3'>
        <WaitingImage message="Chargement des notifications" /></td></tr>
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
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { sleep } from '../common/utils.mjs';
 import { goto, buildGoto } from '../client/lib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 /*
     from   - optional - only displays notification after this date (epoch)
     delay  - optional - number of seconds to wait before refreshing.
              Don't refresh if null
  */
 
 export let from = undefined;
 export let delay = undefined;
 let items = [];
 let loaded = false;
 let error = undefined;
 let table;
  
 onMount(async () => {
   await refreshNotifications();
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
     await refreshNotifications();
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

 async function refreshNotifications (event) {
   loaded = false;
   const state = CodeGradX.getCurrentState();
   try {
     const response = await state.sendAXServer('x', {
       path: `/notification/author`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       items = response.entity.map(massageNotification);
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
     console.log('refreshNotifications', {exc});
     error = parseAnomaly(exc);
   }
 }

 function massageNotification (item) {
   if ( item.category === 'job' ) {
     const joburl = buildGoto(`/job/${CodeGradX.normalizeUUID(item.job)}`);
     item.comment = `
<span class='personName'>${item.pseudo}</span>
a obtenu ${item.mark} / ${item.totalmark}
sur l'exercise ${item.nickname || CodeGradX.normalizeUUID(item.exercise)}
avec sa <a href='${joburl}'>réponse</a>.
        `; //'
   } else if ( item.category === 'exercise' ) {
     const exerciseurl = buildGoto(`/myexercise/${item.exercise}`);
     item.comment = `
<span class='personName'>${item.pseudo}</span>
est en train de soumettre un <a href='${exerciseurl}'>nouvel exercice</a>
${CodeGradX.normalizeUUID(item.exercise)} ...
`;
   }
   return item;
 }

</script>
