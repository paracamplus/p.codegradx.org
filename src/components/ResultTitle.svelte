<style>
 span.title {
   font-weight: bolder;
   margin-right: 1em;
 }
 span.summary {
   font-style: initial;
 }
 span.mark {
   width: 4em;
   display: inline-block;
   box-sizing: content-box !important;
 }
 div.line:hover {
   background-color: var(--color-hover-gray);
   cursor: pointer;
 }
 .verygood {
   background-color: var(--color-waiting-message);
 }
 .good {
   background-color: var(--color-warning-message);
 }
 .bad {
   background-color: red;
 }
</style>

{#if exercise}
<div class='line'
     data-safecookie='{exercise.safecookie}'
     data-name='{exercise.name}'
     data-nickname='{exercise.nickname}'
     data-uuid='{exercise.uuid}'
     on:click={showStem}>
  <span class='mark'
        class:verygood={verygood}
        class:good={good}
        class:bad={bad} >{markTitle}</span>
  <span class="title">{exercise.nickname}</span>
  <span class='summary'>{@html exercise.summary}</span>
</div>
{/if}

<script>
 import { onMount } from 'svelte';
 import { massageMark } from '../client/marklib.mjs';
 import { current_exercise } from '../stores.mjs';
 import { goto } from '../client/lib.mjs';
  
 export let exercise = undefined;
 export let results = [];
 let markTitle = '';
 let verygood = false;
 let good = false;
 let bad = false;
 
 onMount(() => {
   //console.log({exercise, results});//DEBUG
   if ( exercise && results.length > 0 ) {
     const mark = computeMark(exercise, results)
     if ( mark ) {
       markTitle = `${massageMark(mark)}%`;
       if ( 0 < mark && mark < 0.75 ) {
         bad = true;
       } else if ( 0.75 < mark && mark < 0.95 ) {
         good = true;
       } else {
         verygood = true;
       }
     } else {
       markTitle = '';
     }
   }
 });

 function computeMark (exercise, results) {
   for ( const result of results ) {
     //console.log(`Comparing ${exercise.name} with ${result.name}`);//DEBUG
     if ( result.name === exercise.name ) {
       return result.mark;
     }
   }
   return undefined;
 }

 function showStem () {
   let div = event.target;
   while ( div.nodeName !== 'DIV' ) {
     div = div.parentNode;
   }
   //console.log(div);//DEBUG
   $current_exercise = new CodeGradX.Exercise(div.dataset);
   //console.log($current_exercise); // DEBUG
   goto(`/exercise/${$current_exercise.safecookie}`);
 }
 
</script>
