<style>
 div.textareaParent {
   text-align: left;
 }
</style>

<link rel='stylesheet' href='/codemirror.css' />

<section class='w3-container'>
  <div class='smallHint'>
    Vous pouvez composer votre réponse dans l'éditeur ci-dessous ou bien
    utiliser tout autre moyen pour produire un fichier
    {#if exercise.inlineFileName}nommé
    <code>{exercise.inlineFileName}</code>{/if} puis cliquer sur le
    bouton « noter ma réponse ».
  </div>

  <form class='w3-form w3-padding-16 w3-center'
        accept-charset='UTF-8' enctype='multipart/form-data'>
    <div bind:this={textareaParent}
         class='w3-border textareaParent'>
      <textarea bind:this={textareaInput}></textarea>
    </div>

    <div class='w3-center w3-padding-16'>
      <button class='w3-button w3-round-xxlarge w3-theme-l4'
              title="Envoyer ma réponse au serveur pour notation"
              name='SuBmIt' on:click={sendEditorContent} >
        Noter ma réponse
      </button>
      <button class='w3-button w3-round-xxlarge w3-theme-l4'
              title="Stocker ma réponse sur mon ordinateur"
              on:click={storeEditorContent} >
        Archiver ma réponse
      </button>
    </div>
  </form>  
</section>

<script>
 import { onMount, onDestroy, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import Problem from '../components/Problem.svelte';
 import { CodeGradX } from 'codegradx';
 import { makeStoreEventHandler, customizeEditorForLanguage }
    from '../client/editorlib.mjs';

 export let exercise;
 export let file;
 export let language;
 let editor = undefined;
 let error = undefined;
 let textareaParent;
 let textareaInput;

 onMount(async () => {
   const CodeMirrorPromise = import('codemirror');
   const cm = await CodeMirrorPromise;
   customizeEditorForLanguage(language);
   let initialValue = '\n';
   if ( file && file.initial ) {
     initialValue = file.initial._ ;
   }
   let options = {
     lineNumbers: true,
     lineWrapping: false,
     indentWithTabs: false,
     indentUnit: 2,
     tabSize: 2,
     //viewportMargin: Infinity,
     spellcheck: false,
     autofocus: true,
     allowDropFileTypes: [ 'text/plain' ],
     mode: language
   };
   editor = cm.fromTextArea(textareaInput, options);
   setTimeout(() => {
     editor.setValue(initialValue);
     editor.addKeyMap(cm.keyMap.emacsy);
     editor.setOption('mode', language);
     editor.refresh();
     }, 800);
 });

 function getAnswer () {
   return editor.getValue();
 }

 function sendEditorContent (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   try {
     const answer = getAnswer();
     dispatch('jobPromise', {jobPromise: null});
     const jobPromise = exercise.sendStringAnswer(answer);
     dispatch('jobPromise', {jobPromise});
   } catch (exc) {
     console.log('TextAreaString send Textarea', exc);
     error = "Je n'ai pas réussi à envoyer votre réponse!";
   }
 }

 const storeEditorContent = makeStoreEventHandler(exercise, getAnswer);

</script>
