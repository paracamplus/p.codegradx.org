<style>
</style>

{#if showStudentsStats}
<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        on:click={() => showStudentsStats = false}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={downloadStudentsStats}><DownloadSign /></span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshStudentsStats}><RefreshSign /></span>
</div>
<table class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('lastname')}>nom</th>
      <th on:click={sortColumn('firstname')}>prénom</th>
      <th on:click={sortColumn('pseudo')}>pseudo</th>
      <th on:click={sortColumn('exercises')}>#exercices</th>
      <th on:click={sortColumn('attempts')}>#essais</th>
      <th on:click={sortColumn('successes')}>#succès</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
    <tr>
      <td>{@html shorten(htmlencode(item.studentLastName))}</td>
      <td>{@html shorten(htmlencode(item.studentFirstName))}</td>
      <td>{@html shorten(htmlencode(item.studentPseudo))}</td>
      <td>{item.exercises}</td>
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

 export let showStudentsStats = false;
 let items = [];
 let entryPointName = 'perStudent';
  
 onMount(async () => {
   await refreshStudentsStats();
 });

  // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     items = doSortColumn(key, items, hint);
   };
 }

 async function refreshStudentsStats (event) {
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
     console.log('studentsStats', {exc});
   }
 }

 const keyNames =
    `studentLastName studentFirstName studentPseudo studentEmail ` +
    `exercises attempts successes`;
 
 async function downloadStudentsStats (event) {
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
