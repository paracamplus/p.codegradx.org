<style>
 div.textareaParent {
   text-align: left;
 }
 section.Evaluation {
   border: solid 1px var(--color-hover-gray);
   display: none;
 }
 section.visible {
   display: block;
 }
 div.code {
   font-family: monospace;
   font-size: 1em;
   color: black;
   padding: 0.5em;
 }
 :global(.Program) {
   color: black;
   background-color: var(--color-hover-gray);
 }
 :global(.Value) {
   color: black;
   background-color: white;
 }
 span.higher {
   position: relative;
   top: -0.5em;
   font-size: 2em !important;
 }
 :global(span.value span.tooltip) {
   display: none;
 }
 :global(span.error) {
 }
 :global(.inError) {
   color: black;
   background-color: var(--color-error);
 }
 :global(font a) {
   text-decoration: none;
 }
 :global(.econode) {
    position: absolute;
    text-overflow: clip;
    font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
    font-size: xx-small;
    padding: 2px;
 }
 :global(.canvas101) {
    border: 1px solid black;
    position: relative;  
    display: inline-block;  
    vertical-align: top; 
    margin:12px 18px;
    box-shadow: 2px 2px 4px #555; 
    -moz-box-shadow: 2px 2px 4px #555; 
    -webkit-box-shadow: 2px 2px 4px #555; 
}
</style>

<link rel='stylesheet' href={buildGoto('codemirror.css')} />

<section class='w3-container'>
  <div class='smallHint'>
    <p>
    Vous pouvez composer votre réponse dans l'éditeur ci-dessous
    puis cliquer sur le bouton « Évaluer localement ma réponse »
    et, si tout est correct, cliquer sur le bouton « Noter ma réponse ».
    Vous pouvez également utiliser tout autre moyen pour produire un fichier
    {#if exercise.inlineFileName}nommé
    <code>{exercise.inlineFileName}</code>{/if} puis cliquer sur le
    bouton « choisir fichier {#if exercise.inlineFileName}
    <code>{exercise.inlineFileName}</code>{/if} ».
    </p><p>
      Vous devez résoudre ces exercices à l'aide du sous-ensemble de
      Scheme enseigné dans le 
      <a target='_blank' rel='noopener'
         href="https://programmation-recursive.net/">MOOC «
        Programmation récursive »</a> et résumé dans la
      <a target='_blank' rel='noopener'
         href={buildGoto('/carteref.pdf')}>carte
      de référence</a>.
    </p>
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

    {#if error}<Problem bind:error={error}/>{/if}
  </form>

  <section id='EvaluationResults'
           class:visible={showResults}
           class='w3-container Evaluation'>
    <header class='w3-padding-16'>Résultats d'évaluation locale
      <span class='w3-right higher'
            title='Effacer ces résultats'
            data-close="EditorSCM"
            on:click={hideResults}>&#x2716;</span>
    </header>
    <div class='code'>
      {@html result}
    </div>
  </section>

</section>

<script>
 import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
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
 import { Parser, defaultEnvironment, Evaluator, TreeLib }
    from "../../node_modules/mrscheme/index.mjs";
 import { buildGoto } from '../client/lib.mjs';

 export let exercise;
 export let file;
 export let language = 'scheme';
 let editor = undefined;
 let error = undefined;
 let textareaParent;
 let textareaInput;
 let result = undefined;
 let textMarker = undefined;
 let startTime;
 let showResults = false;

 onMount(async () => {
   editor = await makeInitializeEditor(language, file, textareaInput);
   editor.on('change', clear);
 });

 function clear (event) {
   error = undefined;
   if ( textMarker ) {
     textMarker.clear();
     textMarker = undefined;
   }
   showResults = false;
 }

 function hideResults (event) {
   showResults = false;
   result = '';
 }

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

 async function evaluateEditorContent (event) {
   // See Servers/w.scm/Paracamplus-FW4EX-SCM/Templates/mrscheme.tt
   event.preventDefault();
   event.stopPropagation();
   clear();
   startTime = new Date().getTime();
   const prog = getAnswer(0);
   const parser = new Parser(prog);
   const exprs = [];
   const penv = defaultEnvironment();
   const evaluator = new Evaluator(penv);
   result = '';
   showResults = true;
   await tick();
   const values = [];
   
   while ( true ) {
     const expr = parser.parseNext();
     if ( expr.type === 'parseError' ) {
       //console.log('evaluateEditorContent', {expr});
       error = parseError2text(expr);
       break;

     } else if ( expr.type !== 'unit' ) {
       try {
         //console.log('evaluateEditorContent', {expr});
         result += getExpression(expr);
         await tick();
         const value = evaluator.eval(expr, false);
         //console.log('evaluateEditorContent', {value});
         window.lastvalue = value; // DEBUG
         if ( value.type === 'evalError' ) {
           error = evalError2text(value);
           result += wrapError(expr, value);
           break;
         }
         result += wrapValue(expr, value);
         await tick();
         if ( value.afterOutput ) {
           values.push(value);
         }
       } catch (exc) {
         error = exc.toString();
         break;
       }
       
     } else {
       break;
     }
   }
   const endTime = new Date().getTime();
   const duration = (endTime - startTime)
   result += `;;; Fin d'évaluation (${duration} ms)`; //'
   await tick();
   for ( const value of values ) {
     value.afterOutput();
   }
 }
 
 function parseError2text (expr) {
   let error = `Anomalie syntaxique "${expr.message}" `;
   clear();
   textMarker = editor.getDoc().markText(
     {line: expr.startPos.lpos - 1, ch: expr.startPos.cpos - 1},
     {line: expr.endPos.lpos - 1,   ch: expr.endPos.cpos - 1},
     { className: "inError" } );
   editor.getDoc().setCursor({line: expr.startPos.lpos - 1,
                              ch: expr.startPos.cpos - 1});
   return error;
 }

 function evalError2text (expr) {
   let error = `Erreur d'évaluation "${expr.message}" `; //'
   clear();
   textMarker = editor.getDoc().markText(
     {line: expr.startPos.lpos - 1, ch: expr.startPos.cpos - 2},
     {line: expr.endPos.lpos - 1,   ch: expr.endPos.cpos - 1},
     { className: "inError" } );
   editor.getDoc().setCursor({line: expr.startPos.lpos - 1,
                              ch: expr.startPos.cpos - 1});
   return error;
 }

 function getExpression (expr) {
   const text = editor.getDoc().getRange(
     {line: expr.startPos.lpos - 1, ch: expr.startPos.cpos - 2},
     {line: expr.endPos.lpos - 1,   ch: expr.endPos.cpos - 1});
   return `<pre class="Program">${text}</pre>`;
 }

 function wrapValue (expr, value) {
   let html = '';
   if ( value.type === 'unit' ) {
     if ( expr.type === 'define' ) {
       html = `;;; fonction ${expr.fname} définie`;
     } else if ( expr.type === 'test' ) {
       html = `;;; ${expr.testCases.length} tests OK`;
     }
   } else {
     html = value.toHTML();
   }
   return `<pre class="Value">${html}\n</pre>\n`;
 }

 function wrapError (expr, value) {
   let html = `<div class='inError'>${value.message}</div>`;
   return  html;
 }

</script>

