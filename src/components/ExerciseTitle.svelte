<style>
 span.rest {
   color: red;
 }
 span.title {
   font-weight: bolder;
 }
 div.line:hover {
   background-color: #eee;
   cursor: pointer;
 }
 span.summary {
   font-style: italics;
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
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { initializePerson } from '../client/lib.mjs';
 import { person, current_exercise } from '../stores.mjs';

 export let exercise = undefined;

 onMount(async () => {
   $person = await initializePerson();
 });

 async function showStem (event) {
   let div = event.target;
   while ( div.nodeName !== 'DIV' ) {
     div = div.parentNode;
   }
   //console.log(div);//DEBUG
   
   if ( ! $person ) {
     const error = `Pour en savoir plus sur cet exercice, 
il faut d'abord vous identifier!`;
     dispatch('authenticate', error);
     return;
   }
   
   $current_exercise = new CodeGradX.Exercise(div.dataset);
   console.log($current_exercise); // DEBUG
   sapper.goto(`/exercise/${$current_exercise.safecookie}`);
 }
</script>
