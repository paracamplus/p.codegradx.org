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
    bouton « noter ma réponse ». ...
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
 import { Parser, defaultEnvironment, Evaluator }
   from "../client/MrScheme/index.mjs";

 export let exercise;
 export let file;
 export let language = 'scheme';
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
   // See Servers/w.scm/Paracamplus-FW4EX-SCM/Templates/mrscheme.tt
   event.preventDefault();
   event.stopPropagation();
   error = undefined;
   result = '';
   const prog = getAnswer(0);
   const parser = new Parser(prog);
   const exprs = [];
   while ( true ) {
     const expr = parser.parseNext();
     if ( expr.type === 'parseError' ) {
       error = "parse pb";
     } else if ( expr.type !== 'unit' ) {
       exprs.push(expr);
     } else {
       break;
     }
   }
   const penv = defaultEnvironment();
   const evaluator = new Evaluator(penv);
   for ( const expr of exprs ) {
     try {
       const value = evaluator.eval(expr, false);
       if ( value.type === 'evalError' ) {
         error = value;
         break;
       }
       result += value.toHTML();
     } catch (exc) {
       error = exc.toString();
       break;
     }
   }
       
 }


 /*


 */

</script>

