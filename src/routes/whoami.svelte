<!--
       Display the profile of the user
-->

<style>
 .headerButton {
   font-size: smaller;
   margin-left: 2em;
 }
</style>

<Page shortTitle="Profil"
      title="Mes informations"
      showheader={false} >

  <header class='w3-center w3-large w3-margin-bottom'>
    Mes informations
    {#if $person}
    <a class="w3-btn w3-theme-d2 w3-round-xxlarge headerButton"
       title="Modifier mes informations personnelles"
       href={buildGoto('profile')} >Modifier mes informations</a>
    {/if}
  </header>

  {#if $person}
    <div class='w3-container w3-padding'>
      <p> Votre adresse électronique est
        <span class='personName'>{$person.email}</span>
        {#if $person.confirmedemail}(vous l'avez déjà confirmée){/if}</p>
      {#if $person.confirmedua === $person.uaversion}
      <p> Vous avez signé les conditions d'usage (v{$person.confirmedua})</p>
      {:else}
      <p> Vous n'avez pas encore signé les conditions d'usage </p>
      {/if}
      <p> Votre nom est 
        <span class="personName">{$person.lastname}</span>
        votre prénom est
        <span class="personName">{$person.firstname}</span>
        et votre pseudo est
        <span class="personName">{$person.pseudo}</span></p>
      <p> Votre nom de connexion (immuable) est
        <span class="personName">{$person.login}</span></p>
      {#if $person.logins.length > 1}
      <p> Vos autres noms de connexions sont:</p>
      <ul>
        {#each $person.logins as login}
        <li><span class='personName'>{login}</span></li>
        {/each}
      </ul>
      {/if}
      {#if $person.admin}<p> Vous êtes administrateur </p>{/if}
      {#if $person.isauthor}
      <p> Vous êtes auteur et les préfixes possibles
        pour vos exercices sont:</p>
      <ul>
        {#each $person.authorprefixes as prefix}
        <li><span class='personName'>{prefix}</span></li>
        {/each}
      </ul>
      {/if}
      
      {#if $person.campaigns.length > 0 }
      <p>
        Vous êtes déjà inscrit dans les univers suivants
        {#if $campaign}
        et, actuellement, vous êtes dans l'univers
        <code>{$campaign.name}</code>
        {/if}:
      </p>
      <Universes campaigns={$person.campaigns} />
      {/if}
        
    </div>
        
    {:else if error}
      <Problem bind:error={error} />
    {/if}

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import Universes from '../components/Universes.svelte';

 import { onMount } from 'svelte';
 import { person, campaign, lastmessage } from '../stores.mjs';
 import { initializePerson, buildGoto } from '../client/lib.mjs';
 import { goto } from '../client/lib.mjs';

 let error = undefined;

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     goto('/connect');
     return;
   }
 });
 
</script>
