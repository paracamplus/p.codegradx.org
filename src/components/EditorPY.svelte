<style>
 div.textareaParent {
   text-align: left;
 }
 div.code {
   font-family: monospace;
   font-size: 1em;
   color: black;
   background-color: var(--color-hover-gray);
   padding: 0.5em;
 }
 span.higher {
   position: relative;
   top: -0.5em;
   font-size: 2em !important;
 }
</style>

<link rel='stylesheet' href={buildGoto('codemirror.css')} />

<section class='w3-container'>
  <div class='smallHint'>
    Vous pouvez composer votre réponse dans l'éditeur ci-dessous ou bien
    utiliser tout autre moyen pour produire un fichier
    {#if exercise.inlineFileName}nommé
    <code>{exercise.inlineFileName}</code>{/if} puis cliquer sur le
    bouton « noter ma réponse ». Enfin, s'agissant de Python, vous
    pouvez (grâce à Brython) demander l'évaluation de votre code.
  </div>

  <form class='w3-form w3-padding-16 w3-center'
        accept-charset='UTF-8' enctype='multipart/form-data'>
    <div bind:this={textareaParent}
         class='w3-border textareaParent'>
      <textarea bind:this={textareaInput}
                autocomplete="off"></textarea>
    </div>

    <div class='w3-center w3-padding-16'>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Envoyer ma réponse au serveur pour notation"
              name='SuBmIt' on:click={sendEditorContent} >
        Noter ma réponse
      </button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Stocker ma réponse sur mon ordinateur"
              on:click={storeEditorContent} >
        Archiver ma réponse
      </button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Évaluer ma réponse sur mon ordinateur"
              on:click={evaluateEditorContent} >
        Évaluer localement ma réponse
      </button>
    </div>
  </form>

  {#if result}
  <div class='code'>
    <span class='w3-right higher'
          title='Effacer ces résultats'
          data-close="EditorPy"
          on:click={() => result = ''}>&#x2716;</span>
    <pre>{@html result}</pre>
  </div>
  {/if}
</section>

<script>
 import { onMount, onDestroy, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import Problem from '../components/Problem.svelte';
 import { CodeGradX } from 'codegradx';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { makeInitializeEditor,
          makeStoreEventHandler,
          makeSendEditorContent,
          HTMLize,
          customizeEditorForLanguage }
    from '../client/editorlib.mjs';
 import { buildGoto } from '../client/lib.mjs';

 export let exercise;
 export let file;
 export let language = 'python';
 let editor = undefined;
 let error = undefined;
 let textareaParent;
 let textareaInput;
 let result = undefined;

 onMount(async () => {

   editor = await makeInitializeEditor(language, file, textareaInput);
 });

 function getAnswer () {
   return editor.getValue();
 }

 const storeEditorContent = makeStoreEventHandler(exercise, getAnswer);
 const sec = makeSendEditorContent(exercise, getAnswer, dispatch);
 function sendEditorContent (event) {
   try {
     return sec(event);
   } catch (exc) {
     error = exc;
   }
 }

 function evaluateEditorContent (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   result = '';
   
 }


 /*

# Nombre * Nombre * Nombre -> Nombre

def le_plus_grand(x, y, z):
    """
        retourne le plus grand des nombres x, y et z.
    """
    return x
    
print(le_plus_grand(1, 2, 3))
print(le_plus_grand(11, 2, 3))


 */

</script>

