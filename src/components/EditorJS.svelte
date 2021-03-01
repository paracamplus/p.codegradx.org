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

<link rel='stylesheet' href='/codemirror.css' />

<section class='w3-container'>
  <div class='smallHint'>
    Vous pouvez composer votre réponse dans l'éditeur ci-dessous ou bien
    utiliser tout autre moyen pour produire un fichier
    {#if exercise.inlineFileName}nommé
    <code>{exercise.inlineFileName}</code>{/if} puis cliquer sur le
    bouton « noter ma réponse ». Enfin, s'agissant de JavaScript, vous
    pouvez demander l'évaluation de votre code. Vous pouvez utiliser
    <code>console.log</code> mais pas <code>require</code>.
  </div>

  <form class='w3-form w3-padding-16 w3-center'
        accept-charset='UTF-8' enctype='multipart/form-data'>
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
 import { makeStoreEventHandler, customizeEditorForLanguage }
    from '../client/editorlib.mjs';

 export let exercise;
 export let file;
 export let language = 'javascript';
 let editor = undefined;
 let error = undefined;
 let textareaParent;
 let textareaInput;
 let result = undefined;

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

 function evaluateEditorContent (event) {
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   result = '';
   const konsole = {
     log: function konsole_log (...args) {
       for ( const arg of args ) {
         result += `${arg} `;
       }
       result += "\n";
     }
   };
   function rekwire (pkg) {
     throw "require() n'est pas disponible!";
   }
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
     const value = f(konsole, rekwire);
     result += HTMLize(value);
   } catch (exc) {
     result += exc.toString();
   }
 }

 function HTMLize (value) {
   if ( typeof value === 'undefined' ) {
     return "Résultat final: undefined";
   } else if ( value === null ) {
     return "Résultat final: null";
   } else {
     return htmlencode(value.toString());
   }
 }

 /*

function min3 (a, b, c) {
  console.log(a,b)
  return a;
}

console.log(min3(1,2,3));
console.log('<', min3(11,2,3));
//require('lodash');


 */

</script>
