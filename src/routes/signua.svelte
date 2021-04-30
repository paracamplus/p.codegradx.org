<!--
        Display the User's Agreement
-->

<style>
</style>

<Page shortTitle="ConditionsUsage"
      title="Conditions d'usage" >

 {#if error}<Problem bind:error={error} />{/if}

 {#if showPage}
  {#if withButton}
  <p>
    Vous pouvez maintenant finaliser votre inscription en prenant
    connaissance des dispositions légales quant à votre usage de
    l'infrastructure CodeGradX. Si vous êtes d'accord avec ces conditions
    d'usage, n'oubliez pas de les accepter en bas de page.
  </p>
  {/if}
  
  <p>
    Accepter ces conditions d'usage c'est, en très gros, accepter de
    donner ses programmes à la science afin d'aider les auteurs
    à améliorer leurs exercices.
  </p>

  <UA />

  {#if withButton}
  <div class='w3-container w3-center w3-margin-bottom'>
    <button class="w3-btn w3-theme-d2 w3-round-xxlarge"
            on:click={sign}>
      J'accepte ces conditions!
    </button>
  </div>
  {/if}

 {:else}
  <WaitingImage message="Chargement des conditions d'utilisation..." /> 
 {/if}

</Page>

<script>
 import UA from '../components/UA.svelte';
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import WaitingImage from '../components/WaitingImage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { onClient } from '../common/utils.mjs';
 import { person, lastmessage } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, goto, isUser } from '../client/lib.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';

 export let withButton = true;
 let error = undefined;
 let showPage = false;

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( isUser(maybeperson) ) {
     $person = maybeperson;
     $lastmessage = error =
       "Comme j'ai deviné qui vous étiez, je vous emmène directement ici!";
     goto('/universes');
   } else if ( ! maybeperson ) {
     $lastmessage = error = `Je n'ai aucune idée de qui vous êtes ?
Pouvez-vous tenter de vous identifier ...`; //'
     goto('/connect');
     return;
   }
   showPage = true;
 });

 async function sign (event) {
   try {
     const response = await CodeGradX.getCurrentState().sendAXServer('x', {
       path: `/fromp/sign/${$person.token}`,
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/x-www-form-urlencoded'
       }
     });
     if ( response.ok ) {
       $person = new CodeGradX.User(response.entity);
       return goto('/universes');
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('signua', {exc}); //DEBUG
     error = parseAnomaly(exc) ||
       "Problème d'accès au serveur!";
   }
 }
 
</script>
