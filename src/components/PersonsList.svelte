<style>
</style>

{#if error}<Problem bind:error={error} />{/if}

{#if showPersonsList }

  <p class='smallHint'>
  {#if entryKeyName === 'students'}
      Cliquer sur un titre trie la table. Cliquer sur une ligne affiche un
      menu contextuel qui permet de visualiser les copies d'un apprenant,
      de promouvoir un apprenant en enseignant ou de désinscrire un apprenant
      d'un univers.
  {:else if entryKeyName === 'teachers'}
      Cliquer sur un titre trie la table. Cliquer sur une ligne affiche un
      menu contextuel qui permet de visualiser les copies d'un enseignant,
      de rétrograder un enseignant en simple apprenant.
  {/if}
  </p>

  <div class='w3-margin-top'>
  {#if persons.length > 0}
    {total} personnes en tout,
    seulement {persons.length} affichées ci-dessous dont
    {persons.filter(item => item.confirmedemail).length} avec courriel confirmé,
    et {persons.filter(item => item.confirmedua).length} avec UA confirmé.
  {/if}
  <span class='w3-right w3-xxlarge w3-margin-left'
        title="Clore la liste"
        data-close="PersonsList"
        on:click={() => dispatch('close')}>&#x2716;</span>
  <span class='w3-right w3-xlarge w3-margin-left'
        title="Télécharger la liste (CSV) ci-dessous"
        on:click={downloadPersonsList}><DownloadSign /></span>
  <span class='w3-right w3-xlarge w3-margin-left'
        title="Rafraîchir la liste ci-dessous"
        on:click={refreshPersonsList}><RefreshSign /></span>
  </div>

<table id='personsList' 
       bind:this={table}
       class='w3-table w3-center w3-hoverable'>
  <thead class="w3-theme-l3">
    <tr>
      <th on:click={sortColumn('pseudo')}>pseudo</th>
      <th on:click={sortColumn('lastname')}>nom</th>
      <th on:click={sortColumn('firstname')}>prénom</th>
      <th on:click={sortColumn('email')}>courriel</th>
      <th on:click={sortColumn('confirmedua')}>UA</th>
      <th on:click={sortColumn('start', 'date')}>inscription</th>
    </tr>
  </thead>
  <tbody bind:this={tbody} >
    {#each personsSets as personsSet}
      {#if personsSet.show}
        {#each personsSet.persons as person}
          <PersonLine
            person={person}
            showMenu={person.personid === currentlyopened.personid}
            on:openmenu={mkCloseAllMenuBut(person)}
            bind:entryKeyName={entryKeyName}
            on:removePerson={removePerson} />
        {/each}
      {/if}
    {:else}
      <tr><td class='w3-center' colspan='6'>Personne!</td></tr>
    {/each}

    {#if rest}
      <tr bind:this={LastLineTarget}>
        <td on:click={seeMore}
            class='w3-center'
            colspan='6'>
          <span class='w3-btn w3-round-xxlarge w3-theme-l4'>
            encore {rest} personnes restantes ...</span></td>
      </tr>
    {/if}
  </tbody>
</table>

{:else}
  <WaitingImage message="Chargement des données..." />  
{/if}


<script>
 import WaitingImage from '../components/WaitingImage.svelte';
 import RefreshSign from '../components/RefreshSign.svelte';
 import DownloadSign from '../components/DownloadSign.svelte';
 //import CloseSign from '../components/CloseSign.svelte';
 import MenuSign from '../components/MenuSign.svelte';
 import Problem from '../components/Problem.svelte';
 import PersonLine from '../components/PersonLine.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { shorten } from '../client/utils.mjs';
 import { sleep } from '../common/utils.mjs';
 import { doSortColumn } from '../client/sortlib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { goto } from '../client/lib.mjs';

 export let entryPointName = undefined;
 export let entryKeyName = undefined;
 let table;
 let showPersonsList = false;
 let persons = [];
 let error = undefined;
 let total = undefined;
 let offset = 0;
 let count = 20;
 let rest = 0;
 let tbody;
 let currentlyopened = { personid: 'xx' };
 let LastLineTarget;

 let personsSetsIndex = 0;
 let personsSets = [{
   show: false,    // display this set of persons
   filling: false, // a refreshPersonsList is active!
   persons: []
 }];

 onMount(async () => {
   await refreshPersonsList();
 });

 function close (event) {
   dispatch('close', {});
 }

 function mkCloseAllMenuBut (person) {
   currentlyopened = person;
 }

  // Sort exercises with key.
 function sortColumn (key, hint) {
   return function (event) {
     if ( event ) {
       event.stopPropagation();
       event.preventDefault();
     }
     persons = doSortColumn(table, key, persons, hint);
     let index = 0;
     for ( const personsSet of personsSets ) {
       const newindex = index + personsSet.persons.length;
       personsSet.persons = persons.slice(index, newindex);
       index = newindex;
     }
     // Force redisplay of all personsSets:
     personsSets = [].concat(personsSets);
   };
 }

 function seeMore (event) {
   refreshPersonsList(event);
 }

 async function refreshPersonsList () {
   function initializePersonsSets (jsontotal) {
     if ( typeof total === 'undefined' ) {
       total = jsontotal;
     }
     if ( personsSetsIndex === 0 ) {
       for ( let i = 0 ; i < Math.ceil((total * 1.0)/count) ; i++ ) {
         personsSets[i] = {
           show: false,
           filling: false,
           persons: [] };
       }
     }
   }
   if ( personsSets.length > 0 &&
        personsSets[personsSetsIndex].filling ) {
     return;
   }
   personsSets[personsSetsIndex].filling = true;
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
       initializePersonsSets(json.total);
       count = json.count;
       // prepare next offset:
       offset = json.offset + count;
       rest = Math.max(0, total - offset);
       if ( rest ) installTarget();
       const newpersons = json[entryKeyName].map(u => new CodeGradX.User(u));
       personsSets[personsSetsIndex].persons = newpersons;
       personsSets[personsSetsIndex].show = true;
       personsSetsIndex++;
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

 function removePerson (event) {
   //console.log(event.detail);
   const person = event.detail.person;
   const newpersons = [];
   for ( const p of persons ) {
     if ( person.personid !== p.personid ) {
       newpersons.push(p);
     }
   }
   persons = newpersons;
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

 function installTarget () {
   function handleIntersection (entries, observer) {
     //console.log('installTarget', {entries});
     if ( entries[0].isIntersecting ) {
       /* await */ refreshPersonsList().then(() => {
       });
     }
   }
   function doInstallTarget () {
     let observer = new IntersectionObserver(
       handleIntersection, {
         root: null,
         rootMargin: "100px",
         threshold: 0.5
       });
     observer.observe(LastLineTarget);
   }
   // Leave time for target to be mounted:
   setTimeout(doInstallTarget, 0);
 }

</script>
