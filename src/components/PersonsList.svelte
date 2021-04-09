<style>
 div.innerTable {
   margin-left: 2em;
   margin-right: 1em;
 }
</style>

{#if showPersonsList}
  {#if entryKeyName === 'students'}
    <p class='smallHint'>
      Cliquer sur un titre trie la table. Cliquer sur une ligne affiche un
      menu contextuel qui permet de visualiser les copies d'un apprenant,
      de promouvoir un apprenant en enseignant ou de désinscrire un apprenant
      d'un univers.
    </p>
  {/if}
  {#if entryKeyName === 'teachers'}
    <p class='smallHint'>
      Cliquer sur un titre trie la table. Cliquer sur une ligne affiche un
      menu contextuel qui permet de visualiser les copies d'un enseignant,
      de rétrograder un enseignant en simple apprenant.
    </p>
  {/if}

<div class='w3-margin-top'>
  {#if persons.length}
    {total} personnes en tout,
    {persons.length} affichées ci-dessous dont
    {persons.filter(item => item.confirmedemail).length} avec courriel confirmé,
    et {persons.filter(item => item.confirmedua).length} avec UA confirmé.
  {/if}
  <span class='w3-right w3-xxlarge w3-margin-left'
        on:click={() => showPersonsList = false}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={downloadPersonsList}><DownloadSign /></span>
  <span class='w3-right w3-xlarge w3-margin-left'
        on:click={refreshPersonsList}><RefreshSign /></span>
</div>
<table class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th></th>
      <th on:click={sortColumn('pseudo')}>pseudo</th>
      <th on:click={sortColumn('lastname')}>nom</th>
      <th on:click={sortColumn('firstname')}>prénom</th>
      <th on:click={sortColumn('email')}>courriel</th>
      <th on:click={sortColumn('confirmedua')}>UA</th>
      <th on:click={sortColumn('start', 'date')}>inscription</th>
    </tr>
  </thead>
  <tbody>
    {#if persons.length > 0}
      {#each persons as person}
      <tr data-personid={person.personid}>
        <td on:click={mkShowPersonMenu(person)}>
          <MenuSign color='black'/></td>
        <td>{@html shorten(htmlencode(person.pseudo))}</td>
        <td>{@html shorten(htmlencode(person.lastname))}</td>
        <td>{@html shorten(htmlencode(person.firstname))}</td>
        <td>{#if person.confirmedemail}
              <a href='mailto:{person.email}'>
                {@html htmlencode(person.email)}</a>
            {:else}
              <span title='à confirmer'>
                {@html htmlencode(person.email)}</span>
            {/if}</td>
        <td>{person.confirmedua}</td>
        <td>{CodeGradX.Date2str(person.start)}</td>
      </tr>
    
      {#if otherPerson && otherPerson.personid === person.personid }
      <tr data-personid={person.personid}>
        <td colspan='7'>
          <div class='w3-container innerTable'>
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title={`Historique des réponses de ${person.pseudo}`}
                  on:click={mkHistory(person)} >historique</span>
            {#if entryKeyName === 'students'}
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title={`Transformer ${person.pseudo} en enseignant`}
                  on:click={mkPromote(person)} >promouvoir</span>
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title={`Retirer ${person.pseudo} des apprenants`}
                  on:click={mkDemote(person)} >retirer</span>
            {:else if entryKeyName === 'teachers'}
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title={`Transformer ${person.pseudo} en apprenant`}
                  on:click={mkDemote(person)} >rétrograder</span>          
            {/if}
          </div>
        </td>
      </tr>
      {/if}
      {/each}
      {#if rest}
      <tr>
        <td on:click={seeMore}
            class='w3-center'
            colspan='4'>
          <span class='w3-btn w3-round-xxlarge w3-theme-l4'>
            encore {rest} copies restantes ...</span></td>
      </tr>
      {/if}
    {:else}
      <tr><td colspan='7'>
        <p class='w3-center'>aucune copie!</p></td></tr>
    {/if}
  </tbody>
</table>

{/if}

{#if error}<Problem bind:error={error} />{/if}

<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import DownloadSign from '../components/DownloadSign.svelte';
 //import CloseSign from '../components/CloseSign.svelte';
 import MenuSign from '../components/MenuSign.svelte';
 import Problem from '../components/Problem.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { shorten } from '../client/utils.mjs';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { goto } from '../client/lib.mjs';

 export let showPersonsList = false;
 export let entryPointName = undefined;
 export let entryKeyName = undefined;
 let persons = [];
 let otherPerson = undefined;
 let error = undefined;
 let total = undefined;
 let offset = 0;
 let count = 20;
 let rest = 0;

 onMount(async () => {
   await refreshPersonsList();
 });

  // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     persons = doSortColumn(key, persons, hint);
   };
 }

 function seeMore (event) {
   refreshPersonsList(event);
 }

 async function refreshPersonsList (event) {
   const state = CodeGradX.getCurrentState();
   try {
     const path = `/campaign/${entryPointName}/${$campaign.name}`;
     const response = await state.sendAXServer('x', {
       path: `${path}?count=${count}&offset=${offset}`,
       method: 'GET',
       headers: {
         Accept: 'application/json'
       }
     });
     if ( response.ok ) {
       const json = response.entity;
       total = json.total;
       count = json.count;
       // prepare next offset:
       offset = json.offset + count;
       rest = Math.max(0, total - offset);
       const newpersons = json[entryKeyName].map(u => new CodeGradX.User(u));
       persons = persons.concat(newpersons);
       showPersonsList = true;
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('personslist', {exc});
     error = parseAnomaly(exc);
   }
 }

 const keyNames =
   `pseudo lastname firstname email confirmedemail confirmedua start`;
 
 async function downloadPersonsList (event) {
   event.stopPropagation();
   event.preventDefault();
   const filename = `${entryPointName}-${$campaign.name}.csv`;
   const keys = keyNames.split(/ /);
   let answer = keys.join(';') + '\n';
   persons.forEach(person => {
     keys.forEach(key => {
       answer += person[key] + ';';
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

 function mkShowPersonMenu (person) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     otherPerson = person;
   };
 }

 function mkPromote (person) {
   return async function (event) {
     const state = CodeGradX.getCurrentState();
     try {
       const response = await state.sendAXServer('x', {
         path: `/campaign/promote/${$campaign.name}/${person.personid}`,
         method: 'POST',
         headers: {
           Accept: 'application/json'
         }
       });
       dispatch('teachers', { });
       refreshPersonsList(event);
     } catch (exc) {
       console.log('personslist promote', {exc});
     }
   };
 }
 
 function mkDemote (person) {
   return async function (event) {
     const state = CodeGradX.getCurrentState();
     try {
       const response = await state.sendAXServer('x', {
         path: `/campaign/demote/${$campaign.name}/${person.personid}`,
         method: 'POST',
         headers: {
           Accept: 'application/json'
         }
       });
       dispatch('students', {});
       refreshPersonsList(event);
     } catch (exc) {
       console.log('personslist demote', {exc});
     }
   };
 }
 
 function mkHistory (person) {
   return async function (event) {
     goto(`/studentjobs/${$campaign.name}/${person.personid}`);
   };
 }

</script>
