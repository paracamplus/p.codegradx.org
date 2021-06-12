<style>
</style>

<svelte:head>
  <title>CodeGradX/{shortTitle}</title>
</svelte:head>

<Header on:logout={logout} />

<section id='Page'
         in:fade="{{ duration: 300, delay: 300 }}"
         out:fade="{{ duration: 300 }}" 
         data-shortTitle={shortTitle}
         class='w3-container w3-margin-top w3-padding'>
  {#if showheader}
  <header class='w3-center w3-margin-bottom mainTitle'>
    {title}
  </header>
  {/if}

  <slot>
    <p> Page en construction... </p>
  </slot>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Bottom from '../components/Bottom.svelte';

 import { onMount } from 'svelte';
 import { person, lastmessage } from '../stores.mjs';
 import { isUser, goto } from '../client/lib.mjs';
 import { CodeGradX } from 'codegradx';
 import { fade } from 'svelte/transition';

 export let title;
 export let shortTitle;
 export let showheader = true;

 async function logout (event) {
   const json = $person;
   $person = undefined;
   if ( isUser(json) ) {
     await CodeGradX.getCurrentState().userDisconnect();
   }
   $lastmessage = "Vous avez bien été déconnecté!";
   goto('/universes');
 }

</script>
