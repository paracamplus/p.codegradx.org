<section class='w3-container'>
  <header>
    <h3> <span class='w3-left'>Votre réponse</span>  </h3>
  </header>
  {#if singleline && file}
    <SingleLineString file={file}
                      exercise={exercise}
                      on:jobPromise />
  {:else if multiline && file }
    {#if language }
      {#if language === 'javascript'}
        <EditorJS file={file}
                  exercise={exercise}
                  on:jobPromise />
      {:else if language === 'scheme'}
        <EditorSCM file={file}
                   exercise={exercise}
                   on:jobPromise />
      {:else}
        <Editor language={language}
                file={file}
                exercise={exercise}
                on:jobPromise />
      {/if}
    {:else}
      <TextAreaString file={file}
                      exercise={exercise}
                      on:jobPromise />
    {/if}
  {:else}
    <!-- this is the default answer form: -->
    <SingleFile exercise={exercise}
                on:jobPromise />
  {/if}
</section>

<script>
 import SingleFile from '../components/SingleFile.svelte';
 import TextAreaString from '../components/TextAreaString.svelte';
 import SingleLineString from '../components/SingleLineString.svelte';
 import Editor from '../components/Editor.svelte';
 import EditorJS from '../components/EditorJS.svelte';
 import EditorSCM from '../components/EditorSCM.svelte';

 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/src/exercise';
 import { chooseProgrammingLanguage } from '../client/editorlib.mjs';
 
 export let exercise = null;
 let singleline = false;
 let multiline = false;
 let language = undefined;
 let file = undefined;

 function chooseEditor (exercise) {
   singleline = multiline = false;
   language = chooseProgrammingLanguage(exercise);
   if ( exercise.expectations && exercise.expectations.file ) {
     file = exercise.expectations.file;
     if ( file.initial && file.initial.$ && file.initial.$.height ) {
       if ( +(file.initial.$.height) === 1 ) {
         // single line editor:
         singleline = true;
       } else if ( ! file.initial._ || file.initial._.match(/^( |\n)*$/) ) {
         // height is specified but there is no initialcontent!
         // submit a single file with a file chooser:
       } else {
         // multiple lines editor (possibly tailored to some language):
         multiline = true;
       }
     } else {
       // submit a single file with a file chooser:
     }
   } else {
     // submit a single file with a file chooser:
   }
}

 onMount(() => {
   if ( exercise ) {
     // deblanchir = org.example.li362.tr.4 -> singleline
     // max_mot = org.example.li218.devoir.2010nov.3 -> singlefile
     //        (height,width -> textarea + sh editor ?)
     // imin3 = org.example.li314.java.3 -> textarea + initialcontent
     // default -> multiple files -> tgz
     chooseEditor(exercise);
     //console.log({singleline, multiline, language, file}); // DEBUG
   }
 });

</script>
