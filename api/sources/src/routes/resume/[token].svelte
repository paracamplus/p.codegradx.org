<style>
 .personName {
   color: #334191;
   padding: 0.1em 0.5em 0.1em 0.5em;
   border-radius: 0.5em;
   border: solid 1px #334191;
 }
</style>

<svelte:head>
  <title>CodeGradX/CourrielConfirmé</title>
</svelte:head>

<Header />

<section class='w3-container'>
  <p> Bonjour {#if $person}<span class='personName'>{$person.email}</span>
    {/if}</p>
  <p> J'attends donc que vous cliquiez sur le lien qui vient de vous être
    envoyé par courriel. </p>

  {#if error}<Problem bind:error={error} />{/if}
  
  {#if $person}
    {#if $person.confirmedua === $person.uaversion}
    <p> Vous avez déjà signé les conditions d'usage. </p>
    {:else}
    <p> Vous n'avez pas encore signé les conditions d'usage. </p>
    {/if}
  {/if}
</section>

<Bottom />

<script>
 import Header from '../../components/Header.svelte';
 import Problem from '../../components/Problem.svelte';
 import ShowStore from '../../components/ShowStore.svelte';
 import Bottom from '../../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { determineNextUserState } from '../../client/lib.mjs';

 let error = undefined;

 onMount(async () => {
   try {
     const response = await CodeGradX.getCurrentState().sendAXServer('x', {
       path: `/fromp${location.pathname}`,
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/x-www-form-urlencoded'
       }
     });
     if ( response.ok ) {
       $person = new CodeGradX.User(response.entity);
       const href = await determineNextUserState($person);
       const where = document.location.pathname.replace(/^.*(\/\w+)/, '$1');
       if ( href && href !== where ) {
         console.log(`From ${where}: goto ${href}`);
         return sapper.goto(href);
       }
     } else {
       error = "probleme";
     }
   } catch (exc) {
     console.log({exc});//DEBUG
   }
 });
 
</script>
