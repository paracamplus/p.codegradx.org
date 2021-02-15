<style>
 header {
   max-height: 2rem;
   max-width: 100vw;
 }
</style>

<header class='w3-container w3-theme-d2'>
  <div class='w3-dropdown-hover w3-theme-d2'>
    <span class=''>CodeGradX</span>
    {#if isUser($person) }
    <span class='w3-margin-left'>{$person.pseudo}</span>
    {/if}
    <div class='w3-dropdown-content w3-bar-block w3-card-4'>
      <div class='w3-bar-item w3-button'
           on:click={universes} >voir les univers</div>
      {#if isUser($person) }
      {#if $campaign}
      <div class='w3-bar-item w3-button'
           on:click={universe} >l'univers {$campaign.name}</div>
      <div class='w3-bar-item w3-button'
           on:click={history} >mon historique</div>
      {/if}
      <div class='w3-bar-item w3-button'
           on:click={whoami} >qui suis-je ?</div>
      <div class='w3-bar-item w3-button'
           on:click={logout} >me déconnecter</div>
      {:else}
      <div class='w3-bar-item w3-button'
           on:click={login} >m'identifier</div>
      {/if}
    </div>
  </div>
</header>

<script>
 import * as sapper from '@sapper/app';
 import { person, campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { isUser } from '../client/lib.mjs';

 async function logout (event) {
   const json = $person;
   $person = undefined;
   if ( isUser(json) ) {
     await CodeGradX.getCurrentState().userDisconnect();
   }
   sapper.goto('/universes');
 }

 async function login (event) {
   sapper.goto('/connect');
 }

 async function universes (event) {
   sapper.goto('/universes');
 }

 async function universe (event) {
   sapper.goto(`/universe/${$campaign.name}`);
 }

 async function whoami (event) {
   sapper.goto('/whoami');
 }

 async function history (event) {
   sapper.goto(`/history/${$campaign.name}`);
 }
 
</script>
