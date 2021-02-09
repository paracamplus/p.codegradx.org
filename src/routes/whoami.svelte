<style>
 .personName {
   color: #334191;
   padding: 0.1em 0.5em 0.1em 0.5em;
   margin: 0em 0.1em 0em 0.1em;
   border-radius: 0.5em;
   border: solid 1px #334191;
 }
 .bold {
   font-weight: bolder;
 }
 button.headerButton {
   font-size: smaller;
   margin-left: 2em;
 }
</style>

<svelte:head>
  <title>CodeGradX/Profil</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <div class='w3-margin-top w3-padding'>
    <header class='w3-center w3-large bold'>
      Mes informations
      <button class="w3-btn w3-theme-d1 w3-round-xxlarge headerButton"
              title="Modifier mes informations personnelles"
              on:click={modify} >Modifier mes informations</button>
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
      <p> Vous êtes auteur et vos préfixes possibles sont:</p>
      <ul>
        {#each $person.authorprefixes as prefix}
        <li><span class='personName'>{prefix}</span></li>
        {/each}
      </ul>
      {/if}
      
      {#if $person.campaigns.length > 0 }
      <p> Vous êtes déjà inscrit dans les univers suivants:</p>
      <Universes campaigns={$person.campaigns} />
      {/if}
        
    </div>
        
    {:else}
    {#if error}<Problem bind:error={error} />{/if}
    {/if}

  </div>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import ConnectDoc from '../components/ConnectDoc.svelte';
 import Universes from '../components/Universes.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';

 let error = undefined;

 onMount(async () => {
   if ( ! $person ) {
     $person = await CodeGradX.getCurrentUser();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
   }
 });

 function modify (event) {
   sapper.goto('/profile');
 }

</script>
