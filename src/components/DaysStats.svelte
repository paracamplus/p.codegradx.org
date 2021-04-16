<style>
 div.innerTable {
   margin-left: 2em;
   margin-right: 1em;
 }
 span.adjustBadge {
   position: relative;
   top: 0.75em;
   right: -0.5em;
 }
 tr.hover-item:hover {
   background-color: var(--color-hover-gray);
 }
 tr.hover-subitem:hover {
   background-color: var(--color-hover-gray);
 }
</style>

{#if currentJob}
<section class='w3-container w3-center w3-modal'
         style='display:block' >
  <div class='w3-modal-content w3-animate-top w3-border'>
    <JobReport bind:job={currentJob} attempts={2} />
  </div>
</section>
{/if}

<p class='smallHint'>
  Cliquer sur un titre trie la table. Cliquer sur une ligne affiche les
  copies de la journée.
</p>

<div>
  <span class='w3-right w3-xxlarge w3-margin-left'
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={downloadDaysStats}><DownloadSign /></span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshDaysStats}><RefreshSign /></span>
</div>
<table class='w3-table w3-center'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('date', 'date')}>date</th>
      <th on:click={sortColumn('students')}>#apprenants</th>
      <th on:click={sortColumn('exercises')}>#exercices</th>
      <th on:click={sortColumn('attempts')}>#essais</th>
      <th on:click={sortColumn('successes')}>#succès</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
    <tr class='hover-item' on:click={mkShowOneDayStat(item)}>
      <td>{CodeGradX.Date2str(item.date).replace(/Z.*$/, '')}</td>
      <td>{item.students}</td>
      <td>{item.exercises}</td>
      <td>{item.attempts}</td>
      <td>{item.successes}</td>
    </tr>
    {#if subitemDate && subitemDate === item.date}
    <tr>
      <td colspan='5'>
        <div class='w3-center innerTable'>
          <span class='w3-right w3-badge w3-xlarge adjustBadge'
                on:click={() => subitemDate = undefined} >&#x2716;</span>
          <table class='w3-table w3-hoverable w3-border'>
            <thead class="w3-theme-l3">
              <tr>
                <th>heure</th>
                <th>pseudo</th>
                <th>exercice</th>
                <th>note</th>
                <th>problème</th>
              </tr>
            </thead>
            <tbody>
              {#each subitems as subitem}
              <tr class='hover-subitem' on:click={mkShowJob(subitem.uuid)}
                  data-jobid={subitem.uuid}>
                <td>{subitem.finished.replace(/^.* (.*)$/, '$1')}</td>
                <td title={subitem.fullName}>{subitem.studentPseudo}</td>
                <td title={subitem.fullExercise}>{subitem.exerciseNickName}</td>
                <td>{massageMark(subitem.mark)}</td>
                <td>{#if subitem.problem}Pb{/if}</td>
              </tr>
              {:else}
              {#if showSubItems}
                <tr><td colspan='5'>Aucune entrée!</td></tr>
              {:else}
                <tr><td colspan='5'><WaitingImage height='50px'/></td></tr>
              {/if}
              {/each}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
    {/if}
    {:else}
    <tr><td colspan='5'><WaitingImage /></td></tr>
    {/each}
  </tbody>
</table>

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import JobReport from '../components/JobReport.svelte';
 import DownloadSign from '../components/DownloadSign.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { campaign } from '../stores.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { shorten } from '../client/utils.mjs';
 import { massageMark } from '../client/marklib.mjs';
 import { goto } from '../client/lib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 let items = [];
 let entryPointName = 'perDay';
 let subitemDate = undefined;
 let subitems = [];
 let showSubItems = false;
 let currentJob = undefined;
  
 onMount(async () => {
   await refreshDaysStats();
 });

  // Sort days with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     subitemDate = showSubItems = false;
     items = doSortColumn(key, items, hint);
   };
 }

 async function refreshDaysStats (event) {
   subitemDate = showSubItems = false;
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
     console.log('daysStats', {exc});
     error = parseAnomaly(exc);
   }
 }

 const keyNames = `date students exercises attempts successes`;
 
 async function downloadDaysStats (event) {
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

 function mkShowOneDayStat (item) {
   return async function (event) {
     //console.log(item);//DEBUG
     const state = CodeGradX.getCurrentState();
     showSubItems = false;
     subitemDate = item.date;
     subitems = [];
     try {
       const response = await state.sendAXServer('x', {
         path: `/statistics/perDetailDay/${$campaign.name}/${item.date}`,
         method: 'GET',
         headers: {
           Accept: 'application/json'
         }
       });
       subitems = response.entity.jobs;
       subitems.forEach(subitem => {
         subitem.fullName =
           `${subitem.studentLastName} \
            ${subitem.studentFirstName}`;
         subitem.fullExercise =
           `${subitem.exerciseLongName} \
            ${CodeGradX.normalizeUUID(subitem.exerciseUUID)}`;
       });
       showSubItems = true;
     } catch (exc) {
       console.log('daysStatsOneDay', {exc});
     }
   };
 }

 function mkShowJob (jobid) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     if ( event.metaKey || event.ctrlKey || event.altKey ) {
       const href = `/job/${job.jobid}`;
       const element = document.createElement('a');
       element.setAttribute('href', href);
       element.setAttribute('target', '_blank');
       element.style.display = 'none';
       document.body.appendChild(element);
       element.click();
       document.body.removeChild(element);
     } else {
       const pathdir = '/s' + jobid.replace(/-/g, '').replace(/(.)/g, '/$1');
       currentJob = new CodeGradX.Job({ jobid, pathdir });;
     }
   };
 }

</script>


