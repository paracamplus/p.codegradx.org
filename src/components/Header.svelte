<style>
 header.firstLine {
   /* max-height: 2rem; */
   max-width: 100vw;
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

<header id='Header' class='w3-container w3-theme-d2 firstLine'>
  <div class='w3-cell-row'>
    <div class='w3-container w3-cell w3-third'>
      <div class='w3-theme-d2 w3-dropdown-click'>
        <span id='MenuButton' on:click={displayMenu}>
          <MenuSign size={$config.logo ? $config.logo.height : '1em'} />
        </span>
        <div id='MenuContent' bind:this={menuContent}
             class:show={showMenu}
             class='w3-dropdown-content w3-bar-block w3-card-4'>
          <a class='w3-bar-item w3-btn'
             href={buildGoto('apropos')}>à propos</a>
          <a class='w3-bar-item w3-btn'
             href={buildGoto('universes')}>
            {#if $campaign}autres{:else}voir les {/if} univers</a>
      
          {#if $campaign}
          <a class='w3-bar-item w3-btn'
             href={buildGoto(`universe/${$campaign.name}`)}>
            l'univers {$campaign.name}</a>
          {/if}
      
          {#if isUser($person)}

            {#if dev && $person.isadmin}
            <!-- *********************************** -->
            <a class='w3-bar-item w3-btn'
               href={buildGoto('guts/')}>TRIPES</a>
            <!-- *********************************** -->
            {/if}

            {#if $campaign}
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`history/${$campaign.name}`)} >
                mon historique</a>
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`results/${$campaign.name}`)} >
                mes résultats</a>
            {/if}
            {#if $campaign && isTeacher($campaign, $person)}
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`teacher/${$campaign.name}`)} >
                pour enseignant</a>
            {/if}
            {#if $person.isauthor}
              <a class='w3-bar-item w3-btn'
                 href={buildGoto(`author/${$campaign ? $campaign.name : 'free'}`)} >pour auteur</a>
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
 import { onMount, createEventDispatcher } from 'svelte';
 import { person, campaign, config } from '../stores.mjs';
 import { isUser, isTeacher } from '../client/lib.mjs';
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
 try {
   dev = get(session).dev;
 } catch (exc) {
   // ignore
 }
 
 onMount(async () => {
   displayMenu = doDisplayMenu;
   showMenu = false;
 });

 function doDisplayMenu (event) {
   //menuContent.classList.add('w3-show');
   event.stopPropagation();
   event.preventDefault();
   showMenu = ! showMenu;
 }

 async function logout (event) {
   dispatch('logout', {});
 }

 function handleOutsideClick (event) {
   if ( showMenu ) {
     if ( menuContent.contains(event.target) ) {
       // nothing: the user selects an item in the menu!
     } else {
       event.stopPropagation();
       event.preventDefault();
       showMenu = ! showMenu;
     }
   } else {
     // nothing: the menu is not open
   }
 }

</script>
