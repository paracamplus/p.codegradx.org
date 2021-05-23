<style>
 div.textareaParent {
   text-align: left;
 }
</style>

<link rel='stylesheet' href={buildGoto('codemirror.css')} />

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
    {#if preferFile}
    <div bind:this={filechooser}>
      <FileChooser
         on:chosenfile={sendFile}
         labelChoose={`Sélectionner fichier ${exercise.inlineFileName || ''}`}
      labelChosen="Noter ce fichier" />
    </div>
    {:else}
    <div bind:this={textareaParent}
         class='w3-border textareaParent'>
      <textarea bind:this={textareaInput}></textarea>
    </div>

    <div class='w3-center w3-padding-16'>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Envoyer ma réponse au serveur pour notation"
              on:click={sendEditorContent} >
        Noter ma réponse
      </button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Envoyer un fichier local au serveur pour notation"
              on:click={() => preferFile = true} >
        Choisir fichier {#if exercise.inlineFileName}
        <code>{exercise.inlineFileName || ''}</code>{/if}
      </button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Stocker ma réponse sur mon ordinateur"
              on:click={storeEditorContent} >
        Archiver ma réponse
      </button>
    </div>
    {/if}
  </form>

  {#if error}<Problem bind:error={error} />{/if}
</section>

<script>
 import Problem from '../components/Problem.svelte';
 import FileChooser from './FileChooser.svelte';

 import { onMount, onDestroy, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { makeInitializeEditor,
          makeStoreEventHandler,
          makeSendEditorContent,
          customizeEditorForLanguage,
          makeSendFile,
          chooseProgrammingLanguage }
    from '../client/editorlib.mjs';
 import { buildGoto } from '../client/lib.mjs';

 export let exercise;
 export let file;
 export let language = undefined;
 let editor = undefined;
 let error = undefined;
 let textareaParent;
 let textareaInput;
 let filechooser;
 let chosenfile;
 let preferFile = false;

 onMount(async () => {
   editor = await makeInitializeEditor(language, file, textareaInput);
 });

 function getAnswer () {
   return editor.getValue();
 }

 function wrap (f) {
   return function (event) {
     error = undefined;
     if ( ! navigator.onLine ) {
       error = "Pas d'accès à Internet!";
     } else {
       try {
         return f(event);
       } catch (exc) {
         error = exc;
       }
     }
   };
 }
 
 const storeEditorContent = makeStoreEventHandler(exercise, getAnswer);
 const sendEditorContent =
   wrap(makeSendEditorContent(exercise, getAnswer, dispatch));
 const sendFile = wrap(makeSendFile(exercise, dispatch));

</script>
