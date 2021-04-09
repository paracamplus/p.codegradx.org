<style>
</style>

{#if showExercisesStats}
<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        on:click={() => showExercisesStats = false}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={downloadExercisesStats}><DownloadSign /></span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshExercisesStats}><RefreshSign /></span>
</div>
<table class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('exerciseUUID')}>UUID</th>
      <th on:click={sortColumn('exerciseNickName')}>surnom</th>
      <th on:click={sortColumn('exerciseLongName')}>nom</th>
      <th on:click={sortColumn('students')}>#apprenants</th>
      <th on:click={sortColumn('attempts')}>#essais</th>
      <th on:click={sortColumn('successes')}>#succès</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
    <tr>
      <td>{item.exerciseUUID}</td>
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
{/if}

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import DownloadSign from '../components/DownloadSign.svelte';
 
 import { onMount } from 'svelte';
 import { campaign } from '../stores.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { shorten } from '../client/utils.mjs';

 export let showExercisesStats = false;
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
     items = response.entity;
   } catch (exc) {
     console.log('exercisesStats', {exc});
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

</script>

