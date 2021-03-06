<style>
</style>

<Page shortTitle="Exercices"
      title="Mes exercices">

  <p>
    Sélectionnez le fichier tar-gzippé contenant votre exercice. 
  </p>

  <FileChooser bind:filename={chosenfile}
               on:chosenfile={sendFile}
               labelChoose="Choisir fichier"
               labelChosen="Envoyer fichier" />

  {#if error}<Problem bind:error={error} />{/if}
</Page>
  
<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import FileChooser from '../components/FileChooser.svelte';

 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { initializePerson } from '../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/src/newexercise';

 let error = undefined;
 let chosenfile = undefined;

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
   } else if ( ! $person.isauthor ) {
     error = "Navré mais vous n'êtes pas auteur d'exercices!";
   }
 });
 
 async function sendFile (event) {
   const { chosenfile, FileChooserForm } = event.detail;
   error = undefined;
   try {
     const exercisePromise = await CodeGradX.submitNewExerciseFromDOM(
       FileChooserForm, chosenfile);
   } catch (exc) {
     console.log('myexercises sendFile', exc);
     error = "Je n'ai pas réussi à envoyer votre exercice!";
   }
 }
 
</script>
