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
      <Editor language={language}
              file={file}
              exercise={exercise}
              on:jobPromise />
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
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/exercise';
 import SingleFile from '../components/SingleFile.svelte';
 import TextAreaString from '../components/TextAreaString.svelte';
 import SingleLineString from '../components/SingleLineString.svelte';
 import Editor from '../components/Editor.svelte';
 
 export let exercise = null;
 let singleline = false;
 let multiline = false;
 let language = undefined;
 let file = undefined;

 function chooseProgrammingLanguageFromTags (tags) {
   for ( let tag of tags ) {
     if ( tag.match(/^(sh|bash|shell)$/i) ) {
       return 'shell';
     } else if ( tag.match(/^(c|java)$/i) ) {
       return 'clike';
     } else if ( tag.match(/^(js|javascript)$/i) ) {
       return 'javascript';
     } else if ( tag.match(/^((o?ca)?ml)$/) ) {
       return 'mllike';
     } else if ( tag.match(/^python3?$/) ) {
       return 'python';
     } else if ( tag.match(/^(scheme|perl|php|sql)$/i) ) {
       return tag.toLowerCase();
     }
   }
 }

 function chooseProgrammingLanguageFromExtension (filename) {
   const extension = filename.replace(/^.*[.][^.]+$/, '');
   if ( extension.match(/^sh$/) ) {
     return 'shell';
   } else if ( extension.match(/^(c|cc|java)$/) ) {
     return 'clike';
   } else if ( extension.match(/^js$/) ) {
     return 'javascript';
   } else if ( extension.match(/^scm$/) ) {
     return 'scheme';
   } else if ( extension.match(/^py$/) ) {
     return 'python';
   } else if ( extension.match(/^pr?[lm]/) ) {
     return 'perl';
   } else if ( extension.match(/^php$/) ) {
     return 'php';
   } else if ( extension.match(/^ml$/) ) {
     return 'mllike';
   }
 }

 function chooseProgrammingLanguageFromExpectations (expectations) {
   if ( expectations && expectations.file ) {
     let file = expectations.file;
     if ( file.initial && file.initial.language ) {
       return file.initial.language;
     }
   }
 }

 function chooseProgrammingLanguage (exercise) {
   //console.log(exercise);//DEBUG
   if ( exercise.expectations ) {
     language = chooseProgrammingLanguageFromExpectations(exercise.expectations);
     if ( language ) {
       return language;
     }
   }
   if ( exercise.tags ) {
     language = chooseProgrammingLanguageFromTags(exercise.tags);
     if ( language ) {
       return language;
     }
   }
   if ( exercise.inlineFileName ) {
     language = chooseProgrammingLanguageFromExtension(exercise.inlineFileName);
     if ( language ) {
       return language;
     }
   }
   return 'clike';
 }

 function chooseEditor (exercise) {
   singleline = multiline = false;
   language = chooseProgrammingLanguage(exercise);
   if ( exercise.expectations && exercise.expectations.file ) {
     file = exercise.expectations.file;
     if ( file.initial && file.initial.$ && file.initial.$.height ) {
       if ( +(file.initial.$.height) === 1 ) {
         // single line editor:
         singleline = true;
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
     console.log({singleline, multiline, language, file}); // DEBUG
   }
 });

</script>
