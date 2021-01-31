<style>/*
 div.onePage {
   display: grid;
   grid-template-rows: auto 1fr auto;
 }
 section.withScroll {
   overflow-y: scroll;
 }
*/
</style>

<svelte:head>
  <title>CodeGradX/ConditionsUsage</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <p> Votre adresse électronique est maintenant confirmée. </p>
  <p>
    Vous pouvez maintenant finaliser votre inscription en prenant
    connaissance des dispositions légales quant à votre usage de
    l'infrastructure CodeGradX. Si vous êtes d'accord avec ces conditions
    d'usage, n'oubliez pas de les accepter en bas de page.
  </p>
  <p>
    Accepter ces conditions d'usage c'est, en très gros, accepter de
    donner ses programmes à la science afin d'aider les auteurs
    à améliorer leurs exercices.
  </p>
</section>

<UA />

<div class='w3-container w3-center w3-margin-bottom'>
  <button class="w3-btn w3-theme-d1 w3-round-xxlarge"
          on:click={sign}>
    J'accepte ces conditions!
  </button>
</div>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import UA from '../components/UA.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';

 onMount(async () => {
   return initializePerson();
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
       return sapper.goto('/universes');
     } else {
       return "Problème d'accès au serveur!";
     }
   } catch (exc) {
     console.log({exc});//DEBUG
   }
 }
 
</script>
