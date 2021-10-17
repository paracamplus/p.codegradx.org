<style>
 textarea.noscrollbar {
   overflow: hidden;
 }
</style>

<section class='w3-container'>
  <div class='smallHint'>
    Votre réponse doit tenir dans les quelques lignes qui suivent:
  </div>

  <form class='w3-form w3-padding-16'
        accept-charset='UTF-8' enctype='multipart/form-data'>
    <div>
      <textarea name='content'
                bind:this={textareaInput}
                class='w3-input w3-border noscrollbar'
                id='answerString'
                spellcheck='false'
                on:keyup={autoGrow}
                rows='5'
                cols='72'
                required
        >{value}</textarea>
    </div>
    <div class='w3-center w3-padding-16'>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Envoyer ma réponse au serveur pour notation"
              name='SuBmIt' on:click={sendTextarea} >
        Noter ma réponse
      </button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Stocker ma réponse sur mon ordinateur"
              on:click={storeTextarea} >
        Archiver ma réponse
      </button>
    </div>
  </form>

  <Problem bind:error={error}
           within='TextAreaString' />

</section>

<script>
 import Problem from './Problem.svelte';
 
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx/src/exercise';
 import { makeStoreEventHandler } from '../client/editorlib.mjs';
 
 export let exercise = undefined;
 export let file = undefined;
 let error = undefined;
 let textareaInput;
 let value = '';

 onMount(() => {
   const newheight = +(file.initial.$.height || 5);
   value = expand((file.initial._ || '\n'), newheight);
   textareaInput.setAttribute('rows', newheight);
   const newwidth = +(file.initial.$.width || 72);
   textareaInput.setAttribute('cols', newwidth);
 });

 function sendTextarea (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   const answer = getAnswer();
   try {
     dispatch('jobPromise', {jobPromise: null});
     const jobPromise = exercise.sendStringAnswer(answer);
     dispatch('jobPromise', {jobPromise});
   } catch (exc) {
     console.log('TextAreaString send Textarea', {exc});
     error = "Je n'ai pas réussi à envoyer votre réponse!";
   }
 }
 
 function autoGrow (event) {
   if ( this.scrollHeight > this.clientHeight ) {
     this.style.height = this.scrollHeight + 'px';
   }
 }

 // Make s at least height lines:
 function expand (s, height) {
   let lines = s.split(/\n/).length;
   if ( lines < height ) {
     for ( let i=lines ; i<height ; i++ ) {
       s += '\n';
     }
   } 
   return s;
 }

 function getAnswer () {
   return textareaInput.value;
 }

 const storeTextarea = makeStoreEventHandler(exercise, getAnswer);

</script>
