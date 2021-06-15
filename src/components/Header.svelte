<style>
 header.firstLine {
   /* max-height: 2rem; */
   max-width: 100vw;
   display: flex;
   justify-content: space-between;
   align-items: center;
 }
 header.firstLine div.w3-dropdown-content {
   font-weight: initial;
   font-size: 1rem;
 }
 div.show {
   display: block;
 }
</style>

<svelte:body on:click={handleOutsideClick} />

<div>
  <header id='Header' class='w3-theme-d2 firstLine'>
    <div class='w3-container w3-theme-d2 w3-dropdown-click'>
      <span id='MenuButton' on:click={displayMenu}>
        <MenuSign size={$config.logo ? $config.logo.height : '1.5em'} />
      </span>
      <div id='MenuContent' bind:this={menuContent}
           class:show={showMenu}
           class='w3-dropdown-content w3-bar-block w3-card-4'>
        <a class='w3-bar-item w3-btn'
           href={buildGoto('apropos')}>à propos</a>
        <a class='w3-bar-item w3-btn'
           href={buildGoto('help')}>aides</a>
        <a class='w3-bar-item w3-btn'
           href={buildGoto('universes')}>
          {#if $campaign}autres{:else}voir les {/if} univers</a>
        
        {#if $campaign}
        <a class='w3-bar-item w3-btn'
           href={buildGoto(`universe/${$campaign.name}`)}>
          l'univers {$campaign.name}</a>
        {/if}
        
        {#if isUser($person)}
        
          {#if $person.isadmin }
            <!-- *********************************** -->
            <a class='w3-bar-item w3-btn'
               href={buildGoto('guts/')}>TRIPES</a>
            <!-- *********************************** -->
            {/if}

            {#if $campaign}
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`history/${$campaign.name}`)} >
                mon historique</a>
            {/if}
            {#if $campaign && isTeacher($campaign, $person)}
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`teacher/${$campaign.name}`)} >
                pour enseignant</a>
            {/if}
            {#if $person.isauthor}
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`author/${campaignName}`)} >pour auteur</a>
            {/if}
            <a class='w3-bar-item w3-btn'
               href={buildGoto('whoami')} >mon profil</a>
            <div class='w3-bar-item w3-btn'
                 id='disconnectButton'
                 on:click={logout} >me déconnecter</div>
          {:else}
            <a class='w3-bar-item w3-btn'
               href={buildGoto('connect')} >m'identifier</a>
          {/if}
      </div>
    </div>

    <!-- if a logo here, then adjust max-height ! -->
    <div class='w3-container'>
      {#if $config.logo}<img src={$config.logo.url}
                             alt='{$config.logo.alt}'
                             height={$config.logo.height} />
      {:else}CodeGradX{/if}
    </div>

    <div class='w3-container w3-hide-small'>
      {#if isUser($person) }
        <span class='w3-margin-left'
              title="Votre pseudo" >{$person.pseudo}</span>
      {:else}???{/if}
    </div>
 </header>

 <Publicity bind:dev={dev} />

</div>

<script>
 import MenuSign from './MenuSign.svelte';
 import Publicity from './Publicity.svelte';
 
 import * as sapper from '@sapper/app';
 import { onMount, createEventDispatcher } from 'svelte';
 import { person, campaign, config, lastmessage } from '../stores.mjs';
 import { isUser, isTeacher, configureConfig } from '../client/lib.mjs';
 const dispatch = createEventDispatcher();
 import { buildGoto } from '../client/lib.mjs';
 import { stores } from '@sapper/app';
 const { session } = stores();
 import { get } from 'svelte/store';

 let menuContent = undefined;
 let showMenu = false;
 let displayMenu = function (event) {
   /* ignore till onMount */
   alert("Not yet installed!");
 };
 let dev = false;
 let campaignName = 'free';
 
 onMount(async () => {
   await configureConfig();
   try {
     dev = get(session).dev;
   } catch (exc) {
     // ignore
   }
   displayMenu = doDisplayMenu;
   showMenu = false;
   if ( $campaign ) {
     campaignName = $campaign.name;
   }
 });

 function doDisplayMenu (event) {
   //menuContent.classList.add('w3-show');
   event.stopPropagation();
   event.preventDefault();
   showMenu = ! showMenu;
 }

 async function logout (event) {
   dispatch('logout', {});
   showMenu = false;
   //$lastmessage = "Vous n'êtes plus identifié!";
 }

 function handleOutsideClick (event) {
   if ( showMenu ) {
     if ( menuContent.contains(event.target) ) {
       // nothing: the user selects an item in the menu!
     } else {
       event.stopPropagation();
       event.preventDefault();
       showMenu = false;
     }
   } else {
     // nothing: the menu is not open
   }
 }

</script>
