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
 div.border {
   border: dashed 2px var(--color-hover-gray);
   border-radius: 20px;
   padding-left: 20px;
   padding-right: 20px;
   padding-top: 1em;
   margin: 0px;
 }
 div.highlight {
   border: solid 4px black;
 }
</style>


<form class='w3-form w3-padding-16 w3-center'
      bind:this={FileChooserForm}
      method="post" action=""
      accept-charset='UTF-8' enctype='multipart/form-data'>
  <div bind:this={dropArea}
     class:highlight={dragging}
     class:border={advancedUpload}
     class='w3-container'>
    <input type='file' name='content' class='file' id='FileChooserInput'
           bind:this={FileChooserInput}
           on:change={displayChosenFileName} />
    <label class='w3-btn w3-round-xxlarge w3-theme-l4'
           on:click={initializeChooseFileButton}
           for='FileChooserInput' >
      {labelChoose}</label>
    
    <div class:shown={chosenfile} class:hidden={! chosenfile} >
      <span>{chosenfile}</span>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              bind:this={sendFileButton} disabled
              on:click={sendFile} >{labelChosen}</button>
    </div>
    {#if advancedUpload}
    <p class='smallHint w3-left-align'>
      Sélectionnez un fichier à l'aide du bouton ou déposez-le ici!
    </p>
    {/if}

    {#if error}<Problem bind:error={error} />{/if}
  </div>
</form>

<script>
 import Problem from './Problem.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { htmlencode } from 'codegradx/src/htmlencode';

 export let labelChoose;
 export let labelChosen;
 let chosenfile;
 let FileChooserForm;
 let FileChooserInput;
 let sendFileButton;
 let dropArea = {};
 let dragging = false;
 let error = undefined;
 let advancedUpload = false;

 onMount(() => {
   advancedUpload = isAdvancedUpload();
   initializeChooseFileButton();
   ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
     dropArea.addEventListener(eventName, (event) => {
       event.preventDefault();
       event.stopPropagation();
       error = undefined;
       if ( eventName.match(/(enter|over)/) ) {
         dragging = true;
         chosenfile = undefined;
       } else if ( eventName.match(/drop/) ) {
         dragging = false;
         //console.log(event.dataTransfer); // DEBUG
         const files = event.dataTransfer.files;
         if ( files.length > 0 ) {
           const file = files.item(0);
           //console.log({file}); // DEBUG
           displayChosenFileItem(file);
           FileChooserInput.files= files;
         } else {
           error = 'aucun fichier reconnu!';
         }
       } else if ( eventName.match(/(leave)/) ) {
         dragging = false;
       }
     });
   });
 });

 function isAdvancedUpload () {
   return (('draggable' in dropArea) ||
           ('ondragstart' in dropArea &&
            'ondrop' in dropArea)) &&
         'FormData' in window &&
         'FileReader' in window;
 }

 function initializeChooseFileButton (event) {
   error = undefined;
   chosenfile = '';
   sendFileButton.setAttribute('disabled', true);
 }
 
 function displayChosenFileName (event) {
   error = undefined;
   let name = event.target.value.split('\\').pop();
   chosenfile = htmlencode(name);
   sendFileButton.removeAttribute('disabled');
 }

 function displayChosenFileItem (file) {
   error = undefined;
   chosenfile = htmlencode(file.name);
   sendFileButton.removeAttribute('disabled');
 }

 function sendFile (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   dispatch('chosenfile', { chosenfile, FileChooserForm });
 }
 
</script>
