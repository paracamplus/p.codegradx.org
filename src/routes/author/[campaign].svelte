<!--
    Display all the exercises authored by the user and
    created after the start of the current campaign (if any).
-->

<style>
</style>

<Page title="Mes exercices {campaignTitle}"
  shortTitle="Auteurs" >      

  {#if isauthor && exercisesloaded }
    <p>
    {#if exercises.length > 0 }
      Voici les {exercises.length} exercices dont vous êtes l'auteur
      {#if $campaign}dans l'univers {$campaign.name} depuis 
      {CodeGradX.Date2str($campaign.starttime)}.{:else}.{/if}
      Vous pouvez également créer un nouvel
      exercice ou une nouvelle version d'un ancien exercice.
    {:else}
      Vous n'avez pas encore défini d'exercices
      {#if $campaign}dans l'univers {$campaign.name}.{/if}
      À vous d'en créer un maintenant!
    {/if}
    </p>

    <FileChooser on:chosenfile={sendExerciseFile}
                 labelChoose="Créer nouvel exercice"
                 labelChosen="Envoyer exercice" />
  {/if}

  {#if error}<Problem bind:error={error} />{/if}

  {#if exercisesloaded}
    <MyExercises bind:exercises={exercises} />
  {:else if isauthor}
    <WaitingImage message="Recherche de vos exercices..." />
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
 import { person, campaign, current_exercise, lastmessage }
    from '../../stores.mjs';
 import { initializePerson, goto, isUser } from '../../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/src/newexercise';
 import { CodeGradX as _ } from 'codegradx/src/userlib';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import { onClient } from '../../common/utils.mjs';

 let error = undefined;
 let chosenfile = undefined;
 let campaignTitle = '...';
 let campaignName = '';
 let exercises = [];
 let exercisesloaded = false;
 let isauthor = false;

 onClient(async () => {
   const uri = window.document.location.pathname;
   campaignName = uri.replace(/^(.*\/)?author\/([^\/]+)/, '$2');
   campaignTitle = `dans ${campaignName} ...`;
   
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = "Veuillez d'abord vous identifier!";
     await goto('/connect');
     return;
   }
 });

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person || ! $person.isauthor ) {
     error = "Navré mais vous n'êtes pas auteur d'exercices!";
     return;
   }
   isauthor = true;
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     $lastmessage = error = "Veuillez d'abord choisir un univers! ...";
     goto('/universes');
     return;
   }
   campaignTitle = `dans ${$campaign.name}`;
   try {
     exercises = await $person.getAllExercises();
     exercisesloaded = true;
   } catch (exc) {
     //console.log('author', {exc});
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
     //console.log('author sendExerciseFile', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>
