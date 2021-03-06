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

<div class='w3-container'>
  <form class='w3-form w3-padding-16 w3-center'
        bind:this={FileChooserForm}
        accept-charset='UTF-8' enctype='multipart/form-data'>
    <input type='file' name='content' class='file' id='FileChooserInput'
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
  </form>
</div>

<script>
 import Problem from './Problem.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { htmlencode } from 'codegradx/src/htmlencode';

 export let labelChoose;
 export let labelChosen;
 let chosenfile;
 let FileChooserForm;
 let sendFileButton;

 onMount(() => {
   chosenfile = '';
 });

 function initializeChooseFileButton (event) {
   chosenfile = '';
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
   dispatch('chosenfile', {
     chosenfile,
     FileChooserForm
   });
 }
 
</script>
