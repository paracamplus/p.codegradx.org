<style>
</style>

<div class='w3-container'>
  <p class='smallHint'>
    Un jeu d'exercices est un fichier YAML.
  </p>
  
  <FileChooser on:chosenfile={sendExercisesSetFile}
               labelChoose="Choisir nouveau jeu d'exercices"
               labelChosen="Envoyer jeu d'exercices" />

  {#if error}<Problem bind:error={error} />{/if}

</div>

<script>
 import Problem from './Problem.svelte';
 import WaitingImage from './WaitingImage.svelte';
 import FileChooser from './FileChooser.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { campaign, lastmessage } from '../stores.mjs';
 import { parseAnomaly } from '../client/errorlib.mjs';
 import { goto } from '../client/lib.mjs';
 
 let content = '';
 let error = undefined;
 let messages = undefined;
 let showmessages = false;
 let waiting = false;

 async function sendExercisesSetFile (event) {
   const { chosenfile, FileChooserForm } = event.detail;
   const fd = new FormData(FileChooserForm);
   const basefilename = chosenfile.replace(new RegExp("^.*/"), '');
   error = undefined;
   try {
     const state = CodeGradX.getCurrentState();
     const response = await state.sendAXServer('x', {
       path: `/exercisesset/yml2json/${$campaign.name}`,
       method: "POST",
       headers: {
         // Useless since we post a FormData:
         //"Content-Type": "multipart/form-data",
         "Content-Disposition": ("inline; filename=" + basefilename),
         Accept: 'application/json'
       },
       entity: fd
     });
     if ( response.ok ) {
       dispatch('close');
       $lastmessage = "Voici le nouveau jeu d'exercices";
       goto(`/universe/${$campaign.name}`);
     } else {
       throw response;
     }
   } catch (exc) {
     console.log('sendExercisesSetFile', {exc});
     error = parseAnomaly(exc);
   }
 }

</script>

