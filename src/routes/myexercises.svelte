<style>
</style>

<Page shortTitle="Exercices"
      title="Mes exercices">

  <p>
    Sélectionnez le fichier tar-gzippé contenant votre exercice. 
  </p>

  <FileChooser bind:filename={exerciseFileName}
               labelChoose="Choisir fichier"
               labelChosen="Envoyer fichier" />

  {#if error}<Problem bind:error={error} />{/if}
</Page>
  
<script>
 import Page from '../components/Page.svelte';
 import Problem from '../components/Problem.svelte';
 import FileChooser from '../components/FileChooser.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../stores.mjs';
 import { initializePerson } from '../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/src/newexercise';

 let error = undefined;
 let chosenfile = undefined;
 let exerciseFileName = '';
 let exerciseFileform;
 let sendExerciseButton;

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
 
 function initializeChooseFileButton (event) {
   error = chosenfile = undefined;
   sendExerciseButton.setAttribute('disabled', true);
 }
 
 function displayChosenFileName (event) {
   let name = event.target.value.split('\\').pop();
   chosenfile = htmlencode(name);
   sendExerciseButton.removeAttribute('disabled');
 }

 function sendFile (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   try {
     const filename = exercise.inlineFileName || chosenfile;
     const exercisePromise = CodeGradX.submitNewExerciseFromDOM(
       exerciseFileform, filename);
   } catch (exc) {
     console.log('myexercises sendFile', exc);
     error = "Je n'ai pas réussi à envoyer votre exercice!";
   }
 }
 
</script>
