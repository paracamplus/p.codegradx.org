<style>
 span.rest {
   font-style: italic;
   margin-right: 1em;
 }
 span.title {
   font-weight: bolder;
   margin-right: 1em;
 }
 div.line:hover {
   background-color: var(--color-hover-gray);
   cursor: pointer;
 }
 span.summary {
   font-style: initial;
 }
</style>

{#if exercise}
<div class='line'
     data-safecookie='{exercise.safecookie}'
     data-name='{exercise.name}'
     data-nickname='{exercise.nickname}'
     data-uuid='{exercise.uuid}'
     on:click={showStem}
     itemscope itemtype="http://schema.org/Product" >
  <meta itemprop="identifier" content="{exercise.name}"/>
  <span class='rest'>{exercise.rest || ''}</span>
  <span class="title" itemprop="name">{exercise.nickname}</span>
  <span class='summary' itemprop="description">{@html exercise.summary}</span>
</div>
{/if}

<script>
 import * as sapper from '@sapper/app';
 import { createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { person, current_exercise } from '../stores.mjs';
 import { goto } from '../client/lib.mjs';

 export let exercise = undefined;

 async function showStem (event) {
   if ( ! $person ) {
     const error = `Pour en savoir plus sur cet exercice, 
il faut d'abord vous identifier!`; //'
     dispatch('authenticate', error);
     return;
   }
   
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
