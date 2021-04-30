<style>
</style>

<p class='smallHint'>
  Cliquer sur un titre trie la table. Cliquer sur une ligne affiche les
  copies de l'apprenant concerné, CTRL-clic l'affiche dans un autre onglet.
</p>

<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        data-close="ExercisesStats"
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={downloadExercisesStats}><DownloadSign /></span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshExercisesStats}><RefreshSign /></span>
</div>
<table class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th class='w3-hide-small'
          on:click={sortColumn('exerciseUUID')}>UUID</th>
      <th on:click={sortColumn('exerciseNickName')}>surnom</th>
      <th on:click={sortColumn('exerciseLongName')}>nom</th>
      <th on:click={sortColumn('students')}>#apprenants</th>
      <th on:click={sortColumn('attempts')}>#essais</th>
      <th on:click={sortColumn('successes')}>#succès</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
    <tr on:click={mkShowJobs(item)}>
      <td class='w3-hide-small'>{CodeGradX.normalizeUUID(item.exerciseUUID)}</td>
      <td>{item.exerciseNickName}</td>
      <td>{item.exerciseLongName}</td>
      <td>{item.students}</td>
      <td>{item.attempts}</td>
      <td>{item.successes}</td>
    </tr>
    {:else}
    <tr><td colspan='6'><WaitingImage /></td></tr>
    {/each}
  </tbody>
</table>

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import DownloadSign from '../components/DownloadSign.svelte';
 
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
 let entryPointName = 'perExercise';
  
 onMount(async () => {
   await refreshExercisesStats();
 });

  // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     items = doSortColumn(key, items, hint);
   };
 }

 async function refreshExercisesStats (event) {
   const state = CodeGradX.getCurrentState();
   try {
     const response = await state.sendAXServer('x', {
       path: `/statistics/${entryPointName}/${$campaign.name}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       items = response.entity;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('exercisesStats', {exc});
     error = parseAnomaly(exc);
   }
 }

 const keyNames =
    `exerciseUUID exerciseNickName exerciseLongName ` +
    `students attempts successes`;
 
 async function downloadExercisesStats (event) {
   event.stopPropagation();
   event.preventDefault();
   const filename = `statistics-${entryPointName}-${$campaign.name}.csv`;
   const keys = keyNames.split(/ /);
   let answer = keys.join(';') + '\n';
   items.forEach(item => {
     keys.forEach(key => {
       answer += item[key] + ';';
     });
     answer += '\n';
   });
   let result = 'data:text/plain;charset=utf-8,' +
                encodeURIComponent(answer);
   const element = document.createElement('a');
   element.setAttribute('href', result);
   element.setAttribute('download', filename);
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
 }

 function mkShowJobs (item) {
   const href = `/campaignexercisejobs/${$campaign.name}/${item.exerciseUUID}`;
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     if ( event.metaKey || event.ctrlKey || event.altKey ) {
       const element = document.createElement('a');
       element.setAttribute('href', href);
       element.setAttribute('target', '_blank');
       element.style.display = 'none';
       document.body.appendChild(element);
       element.click();
       document.body.removeChild(element);
     } else {
       goto(href);
     }
   };
 }

</script>

