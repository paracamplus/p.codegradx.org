<style>
</style>

<section class='w3-container'>
  <div class='smallHint w3-margin-bottom'>
    {#if exercise.inlineFileName}
      Écrivez votre réponse dans un fichier nommé 
      <code>{exercise.inlineFileName}</code>
      puis envoyez ce fichier pour notation.
    {:else}
      Réunissez vos fichiers dans un tar-gzip puis envoyez ce fichier.
    {/if}
  </div>
 
  <FileChooser on:chosenfile={sendFile}
               labelChoose="Choisir fichier {chosenfile}"
               labelChosen="Noter mon fichier" />

  <Problem bind:error={error} />
</section>

<script>
 import Problem from './Problem.svelte';
 import FileChooser from './FileChooser.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx/exercise';
 import { htmlencode } from 'codegradx/src/htmlencode';

 export let exercise;
 let chosenfile = undefined;
 let error = undefined;

 onMount(() => {
   chosenfile = exercise.inlineFileName || '';
 });

 function sendFile (event) {
   const { chosenfile, FileChooserForm } = event.detail;
   error = undefined;
   if ( ! navigator.onLine ) {
     error = "Pas d'accès à Internet!";
     return false;
   }
   try {
     dispatch('jobPromise', {jobPromise: null});
     const jobPromise = exercise.sendFileFromDOM(FileChooserForm, chosenfile)
     dispatch('jobPromise', {jobPromise});
   } catch (exc) {
     console.log('SingleFile sendFile', {exc});
     error = "Je n'ai pas réussi à envoyer votre fichier!";
   }
 }
 
</script>
