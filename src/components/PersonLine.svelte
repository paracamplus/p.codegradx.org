<style>
 div.innerTable {
   margin-left: 2em;
   margin-right: 1em;
 }
</style>

{#if person}
      <tr data-personid={person.personid}
        on:click={mkShowPersonMenu(person)} >
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
        <td colspan='6'>
          <div class='w3-container innerTable'>
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title="Historique des réponses de {person.pseudo}"
                  on:click={mkHistory(person)} >historique</span>
            {#if entryKeyName === 'students'}
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title="Transformer {person.pseudo} en enseignant"
                  on:click={mkPromote(person)} >promouvoir</span>
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title="Retirer {person.pseudo} des apprenants"
                  on:click={mkDemote(person)} >retirer</span>
            {:else if entryKeyName === 'teachers'}
            <span class='w3-btn w3-round-xxlarge w3-theme-l4'
                  title="Transformer {person.pseudo} en apprenant"
                  on:click={mkDemote(person)} >rétrograder</span>          
            {/if}
          </div>
        </td>
      </tr>
      {/if}
{/if}
      
<script>
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { shorten } from '../client/utils.mjs';
 import { campaign } from '../stores.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 
 export let person;
 export let entryKeyName;
 let otherPerson = false;
 
 function mkShowPersonMenu (person) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     otherPerson = person;
   };
 }

 function mkHistory (person) {
   return function (event) {
     const href = `/studentjobs/${$campaign.name}/${person.personid}`;
     const element = document.createElement('a');
     element.setAttribute('href', href);
     element.setAttribute('target', '_blank');
     element.style.display = 'none';
     document.body.appendChild(element);
     element.click();
     document.body.removeChild(element);
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
       if ( response.ok ) {
         dispatch('removePerson', {person});
         otherPerson = false;
       } else {
         throw response;
       }
     } catch (exc) {
       console.log('personslist promote', {exc});
       error = parseAnomaly(exc);
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
       if ( response.ok ) {
         dispatch('removePerson', {person});
         otherPerson = false;
       } else {
         throw response;
       }
     } catch (exc) {
       console.log('personslist demote', {exc});
       error = parseAnomaly(exc);
     }
   };
 }
 
</script>
