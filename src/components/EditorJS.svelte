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
    bouton « noter ma réponse ». Enfin, s'agissant de JavaScript, vous
    pouvez demander l'évaluation de votre code. Vous pouvez utiliser
    <code>console.log</code> et <code>require('lodash')</code>.
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
              name='SuBmIt' on:click={sendEditorContent} >
        Noter ma réponse
      </button>
      <button class='w3-btn w3-round-xxlarge w3-theme-l4'
              title="Envoyer un fichier local au serveur pour notation"
              on:click={() => preferFile = true} >
        Choisir fichier {#if exercise.inlineFileName}
        <code>{exercise.inlineFileName}</code>{/if}
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
    {/if}
  </form>

  {#if result}
  <div class='code'>
    <span class='w3-right higher'
          title='Effacer ces résultats'
          data-close="EditorJS"
          on:click={() => result = ''}>&#x2716;</span>
    <pre>{@html result}</pre>
  </div>
  {/if}
</section>

<script>
 import Problem from '../components/Problem.svelte';
 import FileChooser from './FileChooser.svelte';

 import { onMount, onDestroy, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { CodeGradX } from 'codegradx';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { makeInitializeEditor,
          makeStoreEventHandler,
          makeSendEditorContent,
          makeSendFile,
          HTMLize,
          customizeEditorForLanguage }
    from '../client/editorlib.mjs';
 import { buildGoto } from '../client/lib.mjs';

  export let exercise;
 export let file;
 export let language = 'javascript';
 let editor = undefined;
 let error = undefined;
 let textareaParent;
 let textareaInput;
 let filechooser;
 let chosenfile;
 let preferFile = false;
 let result = undefined;
 let libraries = {};
 let libNames = [ 'lodash', 'util', 'request', 'assert', 'xml2js', 'sax',
                  'url', 'when', 'bluebird' ];

 onMount(async () => {
   editor = await makeInitializeEditor(language, file, textareaInput);
   await fillLibraries();
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

 async function fillLibraries () {
   if ( ! libraries.bluebird ) {
     try {
       libraries.lodash = await import('lodash');
       //libraries.yasmini = await import('yasmini');
       //libraries.util = await import('util');
       //libraries.request = await import('request');
       ////libraries.assert = await import('./assert');
       // for exercise org.codegradx.js.xmljson.1:
       //libraries.xml2js = await import('xml2js');
       ////libraries.sax = await import('sax');
       //libraries.url = await import('url');
       ////libraries.when = await import('when');
       //libraries.bluebird = await import('bluebird');
     } catch (exc) {
       console.log('EditorJS fillLibraries', {exc});
     }
   }
   return libraries;
 }

 function evaluateEditorContent (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   result = '';
   libraries.console = {
     log: function lib_console_log (...args) {
       for ( const arg of args ) {
         result += HTMLize(`${arg} `);
       }
       result += "\n";
     }
   };
   libraries.require = function lib_require (pkg) {
     // Maybe take inspiration from
     //   Servers/w.js/Paracamplus-FW4EX-JS/js/helpers/js-exercise.js
     for ( const libName of libNames ) {
       if ( libName === pkg ) {
         return libraries[libName];
       }
     }
     throw `require('${pkg}') n'est pas disponible!`; //'
   };
   try {
     const answer = getAnswer();
     const evaluator = window['ev' + 'al'];
     const jsprogram = `
(function () {
   return function (console, require) {
     ${answer};
   };
})();
`;
     const f = evaluator(jsprogram);
     const value = f(libraries.console, libraries.require);
     result += HTMLize(value);
   } catch (exc) {
     result += exc.toString();
   }
 }

/*

function min3 (a, b, c) {
  console.log(a,b)
  return a;
}

console.log(min3(1,2,3));
console.log('<', min3(11,2,3));
console.log(require('lodash').filter);


 */
 
</script>
