<!--
    Display all the exercises authored by the user and
    created after the start of the current campaign (if any).
-->

<style>
</style>

<Page title="Mes exercices {campaignTitle}"
  shortTitle="Auteurs" >      

  {#if showexercises }
  <p>
    {#if exercises.length > 0 }
      Voici les {exercises.length} exercices dont vous êtes 
      l'auteur {campaignTitle} {#if $campaign}depuis 
      {CodeGradX.Date2str($campaign.starttime)}.{:else}.{/if}
      Vous pouvez également créer un nouvel
      exercice ou une nouvelle version d'un ancien exercice.
    {:else}
      Vous n'avez pas encore défini d'exercices. À vous
      d'en créer un maintenant!
    {/if}
  </p>
  <FileChooser on:chosenfile={sendExerciseFile}
               labelChoose="Créer nouvel exercice"
               labelChosen="Envoyer exercice" />
  {/if}

  {#if error}<Problem bind:error={error} />{/if}

  {#if showexercises}
    <MyExercises bind:exercises={exercises} />
  {:else}
    <p class='waitingMessage'>Recherche de vos exercices...</p>
    <WaitingImage height='33px'/>
  {/if}

</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import FileChooser from '../../components/FileChooser.svelte';
 import MyExercises from '../../components/MyExercises.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, campaign, current_exercise } from '../../stores.mjs';
 import { initializePerson, goto } from '../../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/src/newexercise';
 import { CodeGradX as _ } from 'codegradx/src/userlib';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { sleep } from '../../common/utils.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';

 let error = undefined;
 let chosenfile = undefined;
 let campaignTitle = '...';
 let exercises = [];
 let showexercises = false;

 onMount(async () => {
   const uri = window.document.location.pathname;
   const campaignName = uri.replace(/^(.*\/)?author\/([^\/]+)/, '$2');
   campaignTitle = `dans ${campaignName} ...`;
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
     return;
   }
   if ( ! $person.isauthor ) {
     error = "Navré mais vous n'êtes pas auteur d'exercices!";
     return;
   }
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     error = "Veuillez d'abord choisir un univers! ...";
     await sleep(3);
     goto('/universes');
   }
   campaignTitle = `dans ${$campaign.name}`;
   try {
     exercises = await $person.getAllExercises();
     showexercises = true;
   } catch (exc) {
     console.log('author', {exc});
     error = parseAnomaly(exc);
   }
 });
 
 async function sendExerciseFile (event) {
   const { chosenfile, FileChooserForm } = event.detail;
   error = undefined;
   if ( ! navigator.onLine ) {
     throw "Pas d'accès à Internet!";
   }
   try {
     const exercise = await $person.submitNewExerciseFromDOM(
       FileChooserForm, chosenfile );
     $current_exercise = exercise;
     //console.log(exercise);
     goto(`/myexercise/${exercise.exerciseid}?newexercise=1`);
   } catch (exc) {
     console.log('author sendExerciseFile', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>
