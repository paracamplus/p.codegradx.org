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

<div class='line'
     data-safecookie='{exercise.safecookie}'
     data-name='{exercise.name}'
     data-nickname='{exercise.nickname}'
     data-uuid='{exercise.uuid}'
     on:click={showStem}
     itemscope itemtype="http://schema.org/Product" >
  <meta itemprop="identifier" content="{exercise.name}"/>
  <span class='rest'>{exercise.rest || ''}</span>
  <span class="title"
        itemprop="name">{exercise.nickname}</span>
  <span class='summary' itemprop="description">{@html exercise.summary}</span>
</div>

<script>
 import { onMount, createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 import { initializePerson } from '../client/lib.mjs';
 import { person } from '../stores.mjs';

 export let exercise = undefined;
 export let campaign = undefined;

 onMount(initializePerson);

 async function showStem (event) {
   const div = event.target;
   if ( ! $person ) {
     const error = `Pour en savoir plus sur cet exercice, 
il faut d'abord vous identifier!`;
     dispatch('authenticate', error);
     return;
   }
   // TEMP redirect to home_url
   document.location = campaign.home_url;
 }
</script>
