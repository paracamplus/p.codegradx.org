<style>
 header.firstLine {
   /* max-height: 2rem; */
   max-width: 100vw;
 }
 header.firstLine div.w3-dropdown-content {
   font-weight: initial;
   font-size: 1rem;
}
</style>

<header class='w3-container w3-theme-d2 firstLine'>
  <div class='w3-cell-row'>
    <div class='w3-container w3-cell w3-third'>
      <div class='w3-dropdown-hover w3-theme-d2'>
        <MenuSign size={$config.logo ? $config.logo.height : '1em'} />
        <div class='w3-dropdown-content w3-bar-block w3-card-4'>
          <a class='w3-bar-item w3-btn'
             href='/apropos'>à propos</a>
          <a class='w3-bar-item w3-btn'
             href='/universes'>
            {#if $campaign}autres{:else}voir les {/if} univers</a>
      
          {#if $campaign}
          <a class='w3-bar-item w3-btn'
             href='/universe/{$campaign.name}'>l'univers {$campaign.name}</a>
          {/if}
      
          {#if isUser($person)}
            {#if $campaign}
              <a class='w3-bar-item w3-btn'
                 href='/history/{$campaign.name}' >mon historique</a>
            {/if}
            <a class='w3-bar-item w3-btn'
               href='/whoami' >qui suis-je ?</a>
            <div class='w3-bar-item w3-btn'
                 on:click={logout} >me déconnecter</div>
          {:else}
            <a class='w3-bar-item w3-btn'
               href='/connect' >m'identifier</a>
          {/if}
        </div>
      </div>
    </div>

    <!-- if a logo here, then adjust max-height ! -->
    <div class='w3-container w3-cell w3-third'>
      {#if $config.logo}<img src={$config.logo.url}
                             alt='{$config.logo.alt}'
                             height={$config.logo.height} />
      {:else}CodeGradX{/if}
    </div>

    <div class='w3-container w3-cell w3-third w3-hide-small'>
      <div class='w3-right'>
        {#if isUser($person) }
        <span class='w3-margin-left'
              title="Votre pseudo" >{$person.pseudo}</span>
        {:else}???{/if}
      </div>
    </div>
  </div>
</header>

<script>
 import MenuSign from './MenuSign.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte'; 
 import { person, campaign, config } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { isUser, configureConfig } from '../client/lib.mjs';

 onMount(async () => {
   //await configureConfig();
 });

 async function logout (event) {
   const json = $person;
   $person = undefined;
   if ( isUser(json) ) {
     await CodeGradX.getCurrentState().userDisconnect();
   }
   sapper.goto('/universes');
 }
 
</script>
