<style>
 input.file {
   width: 0.1px;
   height: 0.1px;
   opacity: 0;
   overflow: hidden;
   position: absolute;
   z-index: -1;
 }
 div.shown {
   display: inline;
 }
 div.hidden {
   display: none;
 }
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
 
  <div class='w3-container'>
    <form class='w3-form w3-padding-16 w3-center'
          bind:this={singleFileform}
          accept-charset='UTF-8' enctype='multipart/form-data'>
      <input type='file' name='content' class='file' id='answerFile'
             on:change={displayChosenFileName} />
      <label class='w3-btn w3-round-xxlarge w3-theme-d1'
             on:click={initializeChooseFileButton}
             for='answerFile' >
        Choisir fichier
        {#if ! chosenfile}{exerciseName}{/if} </label>

      <div class:shown={chosenfile} class:hidden={! chosenfile} >
        <span>{chosenfile}</span>
        <button class='w3-btn w3-round-xxlarge w3-theme-d1'
                bind:this={sendFileButton} disabled
                on:click={sendFile} >Noter mon fichier</button>
      </div>
    </form>
  </div>

  <Problem bind:error={error} />
</section>

<script>
 import Problem from './Problem.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx/exercise';
 import { htmlencode } from 'codegradx/src/htmlencode';

 export let exercise;
 let chosenfile = undefined;
 let exerciseName = '';
 let singleFileform;
 let sendFileButton;
 let error = undefined;

 onMount(() => {
   exerciseName = exercise.inlineFileName || '';
 });

 function initializeChooseFileButton (event) {
   error = chosenfile = undefined;
   sendFileButton.setAttribute('disabled', true);
 }
 
 function displayChosenFileName (event) {
   let name = event.target.value.split('\\').pop();
   chosenfile = htmlencode(name);
   sendFileButton.removeAttribute('disabled');
 }

 function sendFile (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   try {
     dispatch('jobPromise', {jobPromise: null});
     const filename = exercise.inlineFileName || chosenfile;
     const jobPromise = exercise.sendFileFromDOM(singleFileform, filename)
     dispatch('jobPromise', {jobPromise});
   } catch (exc) {
     console.log('SingleFile sendFile', exc);
     error = "Je n'ai pas réussi à envoyer votre fichier!";
   }
 }
 
</script>
